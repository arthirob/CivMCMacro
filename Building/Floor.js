// Script to make a floor
// To make the floor, start on the north west corner, define the size of it, and have your mats in the first slot


//Only edit those five variable, the rest don't touch
const floorSide = -1; //1 if you want your floor on the right, -1 for on the left
const floorLength = 5; //Your floor length
const floorWidth = 4; // Your floor width
const placeLight = true; //If set to true, place torches
const torchGridX = 6; //The x distance between your torches
const torchGridZ = 6; //The z distance between your torches
const speed = 1; //1 if you have speed 1, 0 if you have speed 0
const playSound = true;

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
const inv = Player.openInventory();


var prevZ;
var prevX;

var dir;

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        throw("No more "+item);
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick();
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.2 || Math.abs(p.getZ() - z - 0.5 ) > 0.2)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);
    
}

function placeTorch(x,z){ // Place a torch if it follows the torch grid
    if (placeLight) {
        if ((x%torchGridX==0)&&(z%torchGridZ==0)) {
            placeFill(1);
            inv.setSelectedHotbarSlotIndex(0);
        }
    }
}


function placeFill(i) { //Autofill the i slot
    item = inv.getSlot(36+i).getItemID();
    inv.setSelectedHotbarSlotIndex(i);
    p.interact();
    Client.waitTick();
    if (inv.getSlot(36+i).getCount()==0) { //i slot empty
        list = inv.findItem(item);
        Chat.log(list.length);
        if (list.length==0) {
            KeyBind.keyBind("key.back", false);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.forward", true);
            Client.waitTick(3);
            KeyBind.keyBind("key.forward", false);
            KeyBind.keyBind("key.sneak", false);
            Chat.log("Out of materials")
            throw("No more "+item);
        }
        inv.swapHotbar(list[0],i);
        Client.waitTick();
    }
    if (inv.findItem("minecraft:stone").length==0){
        KeyBind.keyBind("key.back", false);
        KeyBind.keyBind("key.left", false);
        KeyBind.keyBind("key.forward", true);
        Client.waitTick(3);
        KeyBind.keyBind("key.forward", false);
        KeyBind.keyBind("key.sneak", false);
        throw("Out of stone");
    }
}

function needLine(length,originX,originZ) { //Return true if you need to continue the line, false otherwise
    return (p.distanceTo(originX,p.getY(),originZ)<length)
}

function line(length) {
    originX = Math.floor(p.getX())+0.5;
    originZ = Math.floor(p.getZ())+0.5;
    dir = Math.floor((p.getYaw()+45)/90)*90;
    p.lookAt(dir,80);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    while (needLine(length,originX,originZ)){
        prevX = p.getX();
        prevZ = p.getZ();
        Client.waitTick();
        if ((prevX==p.getX())&&(prevZ==p.getZ())) {
            placeFill(0);
            KeyBind.keyBind("key.sneak", false);
            Client.waitTick(5-speed)
            KeyBind.keyBind("key.sneak", true);
            placeTorch(Math.floor(p.getX()),Math.floor(p.getZ()));
        }
    }
    KeyBind.keyBind("key.back", false);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(12-2*speed);
    KeyBind.keyBind("key.forward", false);
}

function turn(leftOrRight){ //Turn in a direction. -1 for left, 1 for right
    p.lookAt(dir+90*leftOrRight,80)
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    prevX = p.getX();
    prevZ = p.getZ();
    Client.waitTick()
    while ((prevX!=p.getX())||(prevZ!=p.getZ())) {
        prevX = p.getX();
        prevZ = p.getZ();
        Client.waitTick()
    }
    Client.waitTick(1);
    placeFill(0);
    placeTorch(Math.floor(p.getX()),Math.floor(p.getZ()));
    Client.waitTick(1)
    KeyBind.keyBind("key.back", false);
}

function Floor(length,width,firstTurn){//Make a floor of a certain length and width, and specify the direction you want it to go.
    p.lookAt(p.getYaw()+180,80);
    Client.waitTick();
    if (placeLight) {
        equip("minecraft:torch",1);
    }
    for (let i=0;i<width;i++) {
        line(length);
        if (i<(width-1)) { //Don't turn on last line
            turn(firstTurn);
            firstTurn = - firstTurn
        }
        p.lookAt(dir+180,80);

    }
    p.lookAt(dir,0);
    if (playSound) {
        World.playSound("entity.experience_orb.pickup", 100);
    }

}

Floor(floorLength,floorWidth,floorSide);