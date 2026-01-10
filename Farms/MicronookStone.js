/*Script to farm stone with stone pick on a stone generator
V1.0 by arthirob, 21/06/2024 

Press 9 to abort the script, have log on your 9th slot
*/


// Variable and constant declaration

//JS Macro stuff, no touching
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
var inv = Player.openInventory();

//Farm borders and properties
const xCraftingTable = 6424;
const zCraftingTable = -6308;
const xInputChest = 6423; //The chest the flow puts the item in
const zInputChest = -6308;
const xOutputChest = 6426; //The chest after the basic smelter
const zOutputChest = -6308;
const pickCobbleRecipe=[1,2,3]
const pickStickRecipe=[5,8]
const logType = "oak"
const xStoringChest = 6423; //The chest where you store the stone
const zStoringChest = -6306;
const xStickChest = 6425; //The chest where you store the stick and logs
const zStickChest = -6310;
const xFurnace = 6425;
const zFurnace = -6308;

const lagTick = 6;//Adapt to your configuration
const aborted = false;
var breakTime;
var latestEmpty//The last empty chest
var startedOnce = false;//Allows to start the factory once you used 16 picks

//Information to send the message in a discord relay
const discordGroup = 'FU-Bot';
const farmName = "Cascadia Oak"
const regrowTime = 24;

//Variable of the script, no touching as well
const startTime = Date.now();

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        throw("No more "+item);
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick();
}

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);    
}

function emptyCobble(){ // Empty your cobble in the currently opened chest
    const slots = inv.getSlots('main', 'hotbar', 'offhand');
    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item === "minecraft:cobblestone") {
            inv.quick(slot);
            Client.waitTick();
        }
    }
}

function craftPick(){
    //Take 2 stacks of cobble from the chest
    p.lookAt(xInputChest+0.2,p.getY()-1,zInputChest+0.5);
    Client.waitTick(lagTick);
    im.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();

    //First, remove all the cobble in your inventory
    emptyCobble();

    //Then take the two full stacks of cobblestone
    inv.quick(inv.findItem("minecraft:cobblestone")[0]);
    Client.waitTick(lagTick);
    inv.quick(inv.findItem("minecraft:cobblestone")[0]);
    Client.waitTick(lagTick);
    inv.close();

    //Then craft the stick from 8 logs
    p.lookAt(xCraftingTable+0.5,p.getY()-1,zCraftingTable+0.2);
    Client.waitTick();
    im.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    logSpot = inv.findItem(`minecraft:${logType}_log`)
    inv.click(logSpot[0],0);
    Client.waitTick(lagTick)
    for (let i=0;i<8;i++) {
        inv.click(1,1);
        Client.waitTick(lagTick)
    }
    inv.click(logSpot[0],0);
    Client.waitTick(lagTick);
    inv.quick(0);
    Client.waitTick(lagTick);
    inv.click(pickStickRecipe[0],0);
    Client.waitTick(lagTick);
    inv.click(pickStickRecipe[0],1);
    Client.waitTick(lagTick);
    inv.click(pickStickRecipe[1],0);
    Client.waitTick(lagTick);
    plankSpot = inv.findItem(`minecraft:${logType}_planks`);
    inv.swap(plankSpot[0],pickStickRecipe[0]);
    Client.waitTick();
    inv.click(pickStickRecipe[0],1);
    Client.waitTick(lagTick);
    inv.click(pickStickRecipe[1],0);
    inv.quick(0);
    Client.waitTick(lagTick)
    //Then craft the pick
    stickSpot = inv.findItem(`minecraft:stick`);
    inv.swap(stickSpot[0],pickStickRecipe[0]);
    inv.click(pickStickRecipe[0],1);
    Client.waitTick(lagTick);
    inv.click(pickStickRecipe[1],0);
    cobbleSpot = inv.findItem(`minecraft:cobblestone`);
    inv.swap(cobbleSpot[0],pickCobbleRecipe[0]);
    inv.swap(cobbleSpot[1],pickCobbleRecipe[1]);
    inv.click(pickCobbleRecipe[1],1);
    Client.waitTick(lagTick);
    inv.click(pickCobbleRecipe[2],0);
    Client.waitTick(lagTick);
    inv.quick(0);
    Client.waitTick(lagTick)
    inv.close();
    inv = Player.openInventory();
    Client.waitTick(lagTick);

    //Put the remaining cobble in the input chest, to not ruin your next batch of pick
    p.lookAt(xInputChest+0.2,p.getY()-1,zInputChest+0.5);
    Client.waitTick(lagTick);
    im.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    emptyCobble()
    Client.waitTick(lagTick);
    inv.close();
    startFactory();
    farmStone();

}

function keepGoing(){ //Check if you need to continue, and equip a fresh pick if needed
    if (KeyBind.getPressedKeys().contains("key.keyboard.9")) {
        aborted = false;
        Chat.log("Aborting the script")
        return false
    } else if (inv.findItem("minecraft:stone_pickaxe").length ==0 ) {
        Chat.log("No more pick, crafting more")
        startedOnce = false; //Reset the half pick counter
        return false
    } else {
        if (inv.getSlot(36).getItemId()!="minecraft:stone_pickaxe"){ //Refill your pick if needed
            inv.swapHotbar(inv.findItem("minecraft:stone_pickaxe")[0],0);
        }
        if (inv.findItem("minecraft:stone_pickaxe").length==16) {
            if (!startedOnce){
                KeyBind.keyBind("key.attack", false);
                KeyBind.keyBind("key.sneak", false);
                Client.waitTick(20);
                startedOnce = true;
                startFactory();
                p.lookAt(90,0);
                KeyBind.keyBind("key.attack", true);
                KeyBind.keyBind("key.sneak", true);

            }
        }
        return true
    }
}

function place() { //Place yourself in the corner
    walkTo(xInputChest,zInputChest);//Walk to the middle
    p.lookAt(135,0);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(10);
    KeyBind.keyBind("key.forward", false);
}

function farmStone(){
    inv = Player.openInventory();
    KeyBind.keyBind("key.sneak", true);
    p.lookAt(90,0);
    Client.waitTick();
    inv.setSelectedHotbarSlotIndex(0);
    KeyBind.keyBind("key.attack", true);
    while (keepGoing()) {
        Client.waitTick(10);
    }
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(lagTick);
    if (aborted) {
        finishFarm();
    } else {
        emptyOutput();
        craftPick();
    }  
}

function moveStick(){//Allow to put or take the stick in the chest
    p.lookAt(xStickChest+0.5,p.getY()+0.5,zStickChest+0.5);
    Client.waitTick(lagTick);
    im.interact();
    Client.waitTick(lagTick);
    inv=Player.openInventory(); 
    inv.quick(inv.findItem("minecraft:stick")[0]);
    Client.waitTick();
    inv.close();
    Client.waitTick(lagTick);
    inv=Player.openInventory(); 

}

function startFactory(){//Take a stick in the chest, start the factory and put the stick back in the chest
    moveStick();
    inv=Player.openInventory();
    inv.swapHotbar(inv.findItem("minecraft:stick")[0],0);
    inv.setSelectedHotbarSlotIndex(0);
    Client.waitTick(lagTick);
    p.lookAt(xFurnace+0.5,p.getY()-1,zFurnace+0.2);
    Client.waitTick(lagTick);
    im.attack();
    Client.waitTick(lagTick);
    moveStick()
}

function findEmpty(){//Find the first empty chest on the side
    let i=0;
    let j=0;
    let found=false;
    while ((i<3)&&(j<5)&&(!found)) {
        p.lookAt(xStoringChest+0.5+(j*0.85),p.getY()+i+0.7,zStoringChest); //The 0.95 allows to look slightly more to edge of the chest each column
        Client.waitTick(lagTick);
        im.interact();
        Client.waitTick(lagTick);
        inv = Player.openInventory();
        slots = inv.getSlots('container');
        for (slot of slots) {
            if(inv.getSlot(slot).getItemId()=="minecraft:air"){
                found = true;
            }
        }
        inv.close();
        if (!found) {
            i++
            if (i==3) {
                i=0;
                j++;
            }
        }
    }
    inv.close();
    Client.waitTick(lagTick);
    return([i,j])
}

function emptyOutput(){
    p.lookAt(xOutputChest+0.5,p.getY()-1,zOutputChest+0.5);
    Client.waitTick(lagTick);
    im.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    inv.quickAll(inv.findItem("minecraft:stone")[0]);
    Client.waitTick(lagTick);
    inv.close();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    while (inv.findItem("minecraft:stone").length!=0) {
        p.lookAt(xStoringChest+0.9-(latestEmpty[1]*0.95),p.getY()+latestEmpty[0]+0.7,zStoringChest+1); //The 0.95 allows to look slightly more to edge of the chest each column
        Client.waitTick()
        im.interact();
        Client.waitTick(lagTick);
        inv = Player.openInventory();
        slots = inv.getSlots('main', 'hotbar');
        for (const slot of slots) {
            if (inv.getSlot(slot).getItemId()=="minecraft:stone") {
                inv.quick(slot);
                Client.waitTick();
            }
        }
        inv.close();
        Client.waitTick(lagTick);
        inv = Player.openInventory();
        //If you have remaining stone, switch to next chest
        if (inv.findItem("minecraft:stone").length!=0) {//You have stone remaining
            latestEmpty[0]=latestEmpty[0]+1
            if (latestEmpty[0]==3) {
                latestEmpty[0]=0;
                latestEmpty[1]=latestEmpty[1]+1;
            }
            if (latestEmpty[1]==6){
                throw("Out  of room")
            }
        }

    }
}

function finishFarm(){
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" is finished to harvest. Choped "+plantedSapling+" trees in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. Now logging out")
    Chat.say("/logout")   
}

function start() {
    place();
    latestEmpty = findEmpty();
    farmStone();
}

start();