// Script to make a wall
// To make the wall, look in the direction you want the wall to go, define the length and height. You need to start from a flat line
// Hotbar is : 1st slot is building mat, 2nd slot is lodestone, 3rd slot is pickaxe

//Only edit those two variable, the rest don't touch
const wallHeight = 20;  //The height of the wall
const refill = false;
const reinforceMat = "minecraft:stone"
const refillChestX = 1470;
const refillChestZ = -159;
const refillStacks = 5; //The amount of stacks for the building item and the reinforcing item
const lagTick = 6;
const speed = 0; //The value of your speed boost

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
var inv = Player.openInventory();
const wallDir = (Math.floor((p.getYaw()+225)/90)%4)*90-180
const buildMat = inv.getSlot(inv.getSlots('hotbar')[0]).getItemId();

var prevZ;
var prevX;
var startPoint;
var endPoint;
const startTime = Date.now();


var dir; //0 if going from start to end, 1 if going from end to start

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        World.playSound("entity.elder_guardian.curse", 200);
        throw("No more mats")
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick(lagTick);
}

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY(), z+0.5);
}

function walkSlowTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.sneak", true);
    Client.waitTick();
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);    
}

function center(){
    walkSlowTo(Math.floor(p.getX()),Math.floor(p.getZ()));
}

function checkMats() { //Return true if you have enough mats, false otherwise. Need enough to make 4 lines
    listOfMat = inv.getItemCount();
    buildMatNumber = listOfMat.get(buildMat);
    reinforceNumber = listOfMat.get(reinforceMat);
    return ((buildMatNumber>7)&&(reinforceNumber>7))
}

function placeFill(i) { //Autofill the i slot
    item = inv.getSlot(inv.getSlots('hotbar')[0]+i).getItemId();
    needRestock = inv.getSlot(inv.getSlots('hotbar')[0]+i).getCount()<=2
    inv.setSelectedHotbarSlotIndex(i);
    Client.waitTick();
    p.interact();
    Client.waitTick();
    if (needRestock) { //i slot empty
        list = inv.findItem(item);
        swapSlot = 0
        for (slot of list) {
            if (inv.getSlot(slot).getCount()>2) {
                swapSlot = slot ; 
            }
        }
        if (swapSlot==0) {
            
            /*KeyBind.keyBind("key.back", false);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.forward", true);
            Client.waitTick(3);
            KeyBind.keyBind("key.forward", false);
            KeyBind.keyBind("key.sneak", false);
            Chat.log("Out of materials")
            */
            throw("No more mats")
        }
        Chat.log("Found the item, in slot "+swapSlot);
        inv.swapHotbar(swapSlot,i);
    }
    /*
    if (inv.findItem(reinforceMat).length==0){
        KeyBind.keyBind("key.back", false);
        KeyBind.keyBind("key.left", false);
        KeyBind.keyBind("key.forward", true);
        Client.waitTick(3);
        KeyBind.keyBind("key.forward", false);
        KeyBind.keyBind("key.sneak", false);
        throw("Out of stone");
    }
    */
}

function lodestoneUp(goingUp) {//If true, go up, otherwise go down
    Client.waitTick(lagTick);
    if (goingUp) {
        KeyBind.keyBind("key.jump", true);
        Client.waitTick(3);
        KeyBind.keyBind("key.jump", false);
    } else {
        KeyBind.keyBind("key.sneak", true);
        Client.waitTick(3);
        KeyBind.keyBind("key.sneak", false);    }
    Client.waitTick(lagTick)
}

function onPoint(value) { //Return true if you are on this point
    if ((wallDir==-90)||(wallDir==90)) {//You are moving accross X value
        return (Math.abs(p.getX()-value-0.5)<0.2)
    } else {
        return (Math.abs(p.getZ()-value-0.5)<0.2)

    }
}

function line() {
    KeyBind.keyBind("key.sneak", true);
    p.lookAt(wallDir,17);
    placeFill(0);
    placeFill(0);
    placeFill(0);
    p.lookAt(wallDir,40);
    placeFill(0)
    p.lookAt(180+wallDir,17);
    placeFill(0);
    placeFill(0);
    placeFill(0);
    p.lookAt(180+wallDir,40);
    placeFill(0)
    jumpPlace(0);

}

function jumpPlace(i) {
    inv.setSelectedHotbarSlotIndex(0);
    p.lookAt(wallDir,90)
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(3);
    placeFill(i)
    KeyBind.keyBind("key.jump", false);
    Client.waitTick(5);
}

function destroyLodestone() {
    p.lookAt(wallDir,90);
    inv.setSelectedHotbarSlotIndex(2);
    Client.waitTick(lagTick);
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(15+lagTick);
    KeyBind.keyBind("key.attack", false);
    inv.setSelectedHotbarSlotIndex(0);
    Client.waitTick(50); //Wait until the lodestone is looted
}

function refillMat(){
    Client.waitTick(10); //Wait a long time, to make sure you are in the lodestone and not moving
    p.lookAt(refillChestX+0.5,p.getY(),refillChestZ+0.5);
    Client.waitTick(lagTick);
    listOfMat = inv.getItemCount();
    buildMatNumber = listOfMat.get(buildMat);
    reinforceNumber = listOfMat.get(reinforceMat);
    neededMat = refillStacks - buildMatNumber/64;
    neededReinforce = refillStacks - reinforceNumber/64;
    Client.waitTick();
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    Client.waitTick(lagTick);
    slots= inv.getSlots('container')
    for (slot of slots) {
        if (inv.getSlot(slot).getItemId() == buildMat) {
            if (neededMat>0) {
                inv.quick(slot);
                neededMat--;
                Client.waitTick();
            }
        }
        if (inv.getSlot(slot).getItemId() == reinforceMat) {
            if (neededReinforce>0) {
                inv.quick(slot);
                neededReinforce--;
                Client.waitTick();
            }
        }
    }
    Player.openInventory().close();    
    Client.waitTick(lagTick);
    inv = Player.openInventory();
}

function init(){
    if (refill) {
        equip("minecraft:lodestone",1)
        equip("minecraft:diamond_pickaxe",2);
    }
}

function wall() {
    init();
    KeyBind.keyBind("key.sneak", true);
    center();
    for (let i=0;i<wallHeight;i++) {
        line();
        if (!checkMats()&&refill) { //You are above the lodestone, and you need to refill
            inv.setSelectedHotbarSlotIndex(1);
            Client.waitTick(20);
            KeyBind.keyBind("key.sneak", false);
            jumpPlace(1)
            Client.waitTick(20);//Wait for you to fall from the jump
            lodestoneUp(false);
            refillMat();
            lodestoneUp(true);
            destroyLodestone()
            KeyBind.keyBind("key.sneak", true);
        }
    }
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("Placed  "+wallHeight+" blocks in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. Now logging out")
    KeyBind.keyBind("key.sneak", false);
t}

wall();