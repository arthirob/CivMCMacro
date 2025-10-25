/*
*/


// Variable and constant declaration

//JS Macro stuff, no touching
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
var inv = Player.openInventory();

//Farm borders and properties

const xEast = -9612 ; //Easter row
const xWest = -9659 ; // Western row
const zRow = 539; // North limit
const treeSpace = 5; //Space between trees in a row
const firstTreeDistEast = 4;//The distance between the first tree and the edge of the farm
const firstTreeDistWest = 3;//The distance between the first tree and the edge of the farm
const farmYlow = 87;

const levelSpace = 7; //Space between two levels
const lagTick = 4; //Lag safeguard. Reduce to 4 or less with good connection
const hotbarSlot = 1; //The slot you want to have saplings in
const saplingType = "minecraft:oak_sapling"
//Variable of the script, no touching as well
var nextTree;
var planted;
var dir; // 1 for facing west, -1 for facing east



const startTime = Date.now();
var plantedSapling = 0;


function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        throw("No more "+item);
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick();
}

function eat() {
    if (p.getFoodLevel()<16) {
        if (inv.getSlot(38).getItemId()!=foodType) {
            equip(foodType,2);
        }
        inv.setSelectedHotbarSlotIndex(2);
        KeyBind.keyBind("key.use", true);
        do {
            Client.waitTick(lagTick);
        } while (p.getFoodLevel()<16)
        inv.setSelectedHotbarSlotIndex(0);
        KeyBind.keyBind("key.use", false);
    }
}

function placeFill(slot) {
    previousItem = inv.getSlot(36+slot).getItemId();
    previousSlot = inv.getSelectedHotbarSlotIndex();
    inv.setSelectedHotbarSlotIndex(slot);
    Client.waitTick();
    im.interact();
    Client.waitTick();
    if (inv.getSlot(36+slot).getItemId()!=previousItem) {
        list = inv.findItem(previousItem);
        if (list.length==0) {
            Chat.log("Out of mats")
            throw("No more mats")
        }
        inv.swapHotbar(list[0],1);
        Client.waitTick();
    }
    inv.setSelectedHotbarSlotIndex(previousSlot);
}

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.1){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);
    
}

function plantTo(x,z) { //Walk to a dirt spot and plant when possible
    KeyBind.keyBind("key.forward", true);
    planted = false;
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.1){
        p.lookAt(x+0.5,p.getY(), z+0.5);
        if ((p.distanceTo(x+0.5,p.getY(),z+0.5)<1)&&(!planted)) {
            p.lookAt(x+0.5,p.getY(), z+0.5);
            placeFill(hotbarSlot);
            planted = true;
            Chat.log("I planted")
        }
    }
    KeyBind.keyBind("key.forward", false);

}

function lineNotFinished(dir) {//Return false if the line is finished after this tree, true otherwise
    if (dir==1) { //You are facing west
        return (Math.floor(p.getX())>xWest+firstTreeDistWest)
    } else {
        return (Math.floor(p.getX())<xEast-firstTreeDistEast)
    }
}

function plantLine(dir) {
    if (dir==1) {
        nextTree = xEast - firstTreeDistEast
    } else {
        nextTree = xWest + firstTreeDistWest
    }
        while (lineNotFinished(dir)) {
        plantTo(nextTree,zRow);
        nextTree=nextTree-dir*treeSpace;
    }
    if (dir==1) {
        walkTo(xWest,zRow);
    } else {
        walkTo(xEast,zRow)
    }
}

function goDown() {
    p.lookAt(0,0);
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.sneak", true);
    Client.waitTick(20);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(1);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(20);
    KeyBind.keyBind("key.sneak", false);
    walkTo(Math.floor(p.getX()),zRow);
}

function plantTwo(){
    plantLine(1);
    goDown();
    dir = -1;
    plantLine(-1);
}

function plantAll() {
    while(p.getY()>farmYlow) {
        plantTwo();
        if (p.getY()>farmYlow) {
            goDown();
        }
    }
}

function finishFarm(){
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.log("Farm is finished to harvest. Choped "+plantedSapling+" trees in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. Now logging out")
    Chat.say("/logout")   
}

function start() { //Allows to start back where you were. Finish the row, and place yourself at the start of the new row
    if ((Math.floor(p.getX())!=xEast)||(Math.floor(p.getZ())!=zRow)) {
        Chat.log("You are not in the correct block, start in the east obby block")
    } else {
        if ((p.getY()-farmYlow)%(2*levelSpace)!=levelSpace) {
            Chat.log("You should start on the higher point, or on a block with honey next to it")
        } else {
            equip(saplingType,hotbarSlot)
            plantAll();
        }
    }
}
start();