// Script to make a floor
// To make the floor, start on the north west corner, define the size of it, and have your mats in the first slot


//Only edit those five variable, the rest don't touch
var floorSide = 1; //1 if you want your floor on the right, -1 for on the left
const length = 17; //Your floor length
const width = 6; // Your floor width
const placeLight = false; //If set to true, place torches
const torchGridX = 6; //The x distance between your torches
const torchGridZ = 6; //The z distance between your torches
const speed = 0; //1 if you have speed 1, 0 if you have speed 0
const playSound = true;
const reinforceMat = "minecraft:stone"


//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
const inv = Player.openInventory();


var prevZ;
var prevX;
const startX = Math.floor(p.getX())+0.5;
const startZ = Math.floor(p.getZ())+0.5;
var firstFloor=true;

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
            KeyBind.keyBind("key.back", false);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.forward", true);
            Client.waitTick(3);
            KeyBind.keyBind("key.forward", false);
            KeyBind.keyBind("key.sneak", false);
            Chat.log("Out of materials")
            throw("No more "+item);
        }
        Chat.log("Found the item, in slot "+swapSlot);
        inv.swapHotbar(swapSlot,i);
    }
    if (inv.findItem(reinforceMat).length==0){
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
    return (p.distanceTo(originX,p.getY(),originZ)<(length-1))
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
        if (p.distanceTo(prevX,p.getY(),prevZ)==0) {
            placeFill(0);
            if ((length-1-p.distanceTo(originX,p.getY(),originZ))>1) {
                KeyBind.keyBind("key.sneak", false); 
                Client.waitTick(5-speed)
                KeyBind.keyBind("key.sneak", true);
                placeTorch(Math.floor(p.getX()),Math.floor(p.getZ()));
            }

        }
    }
    KeyBind.keyBind("key.back", false);
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

function floor(length,width,floorSide){//Make a floor of a certain length and width, and specify the direction you want it to go.
    p.lookAt(p.getYaw()+180,80);
    Client.waitTick();
    if (placeLight) {
        equip("minecraft:torch",1);
    }
    for (let i=0;i<width;i++) {
        line(length);
        if (i<(width-1)) { //Don't turn on last line
            turn(floorSide);
            floorSide = - floorSide
        }
        p.lookAt(dir+180,80);

    }
    if (playSound) {
        World.playSound("entity.experience_orb.pickup", 100);
    }
}

function blockToPlace(i,width,dir){ //Make you look where you should place
    if (dir==-180) { //You are facing north
        p.lookAt(Math.floor(p.getX())+0.5,p.getY()-0.5,Math.floor(p.getZ())-(width-3)+i)
    } else if (dir==-90){
        p.lookAt(Math.floor(p.getX())+(width-2)-i,p.getY()-0.5,Math.floor(p.getZ())+0.5)
    } else if (dir==0){
        p.lookAt(Math.floor(p.getX())+0.5,p.getY()-0.5,Math.floor(p.getZ())+(width-2)-i)
    } else {
        p.lookAt(Math.floor(p.getX())-(width-3)+i,p.getY()-0.5,Math.floor(p.getZ())+0.5)
    }
}

function fillLine(width){ //Fill a line
    dir = (((Math.floor((p.getYaw() + 225) / 90))) % 4 - 2)*90
    for (let i=0;i<width-2;i++) {
        blockToPlace(i,width,dir);
        //Client.waitTick();
        placeFill(0);
    }
}

function fillFloor(length,width,floorSide){ //Fill a U shape holl
    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.forward", true);
    while ((currentX==Math.floor(p.getX()))&&(currentZ==Math.floor(p.getZ()))) {
        Client.waitTick()
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick()
    KeyBind.keyBind("key.sneak", false);
    currentX = p.getX();
    currentZ = p.getZ();
    for (let i=0;i<(length-1);i++){
        fillLine(width);
        p.lookAt(dir,50);
        Client.waitTick();
        if (floorSide==1) {
            KeyBind.keyBind("key.right", true);
        } else {
            KeyBind.keyBind("key.left", true);
        }

        while (p.distanceTo(currentX,p.getY(),currentZ)<(i+1)) {
            Client.waitTick();
        }
        KeyBind.keyBind("key.right", false);
        KeyBind.keyBind("key.left", false);
    }
}

function floor6(length,width,floorSide){ //Makes a floor from a single block using the U technique. You start from the angle of the floor
    Chat.log("floor 6 of width "+width);
    originalYaw = (((Math.floor((p.getYaw() + 225) / 90))) % 4 - 2)*90
    p.lookAt(originalYaw+180,80);
    Client.waitTick();
    if (placeLight) {
        equip("minecraft:torch",1);
    }
    line(length);
    turn(floorSide);
    line(width-1);
    p.lookAt(originalYaw,80);
    line(length);
    if (width>2) {
        //The u shape is done, now align you to the edge of the block
        p.lookAt(startX,p.getY(),startZ);
        fillFloor(length,width,floorSide)
    }
}

function floor5(length,width,floorSide){ //Make a floor using the L technique, supposing you already have a "side" to stick too, starting from the direction you are facing
    Chat.log("floor 5 of width "+width)
    p.lookAt(p.getYaw()-180,0);
    line(width+1);
    p.lookAt(p.getYaw()+90*floorSide,0)
    line(length);
    p.lookAt(p.getYaw()-90*floorSide,0)
    if (width>1){
        fillFloor(length,width+1,floorSide);
    }
}

function fullfloor(length,width,floorSide){
    widthRemaining = width;
    while(widthRemaining>0){
        if (firstFloor) {
            if (widthRemaining>=6){
                floor6(length,6,floorSide);
                widthRemaining-=6;
                p.lookAt(p.getYaw()-180,0);
                KeyBind.keyBind("key.forward", true);
                Client.waitTick(3);
                KeyBind.keyBind("key.forward", false);
                walkTo(Math.floor(p.getX(),Math.floor(p.getZ())));
            } else {
                floor6(length,widthRemaining,floorSide);
                widthRemaining = 0;
            }
            firstFloor = false;
        } else {
            if (widthRemaining>=5) {
                floor5(length,5,floorSide);
                widthRemaining-=5;
                p.lookAt(p.getYaw()-180,0);
                KeyBind.keyBind("key.forward", true);
                Client.waitTick(3);
                KeyBind.keyBind("key.forward", false);
                walkTo(Math.floor(p.getX(),Math.floor(p.getZ())));

            } else {
                floor5(length,widthRemaining,floorSide);
                widthRemaining =0;
            }
        }
    }
}

fullfloor(length,width,floorSide)
