// Script to make a FREAKING GIANT TRANS FLAG
// For a Apollo project.

//The script build a long stripe with a full inv from west to east.
//To use it, make sure the refill chest are filled with materials, and that 2 hoppers are feeding them more materials. This way, you'd be able to do more.
//You need to have the north side already blocked, and the east side too, where the refill chest should be
/* EXAMPLE

XXXXXXXXXXS
OOOOOOOOOOX
OOOOOOOOOOX
OOOOOOOOOOXC
OOOOOOOOOOXC
OOOOOOOOOOX

X block are already placed, and O blocks are what you will place. Refill chests are marked as C on the map, and you need to start the script from the point S.
It's ok if S is more to the south than the refill chest, you'll just have to walk more when refilling
*/


// You should just edit the first part : your current color, and where do you refill
//Refill chests
const xStanding = -1601;
const zStanding = -3034; 
const xBlockChest =-1600;
const zBlockChest = -3034;
const xReinforceChest = -1600;
const zReinforceChest = -3036;
const currentColor = "minecraft:pink_wool"
const reinforceMat = "minecraft:stone"

const lagTick = 10;
const numberOfRefill = 10; //The number of full inv you want to place. It'll make 5 block wide stripe

//No touching behind this point this ! Math was done ! :p
const floorSide = 1; //1 if you want your floor on the right, -1 for on the left
const length = 225 ; //Your floor length
const width = 5; // Your floor width
const speed = 0; //1 if you have speed 1, 0 if you have speed 0
const sneakWhenFilling = false;//Allow you to sneak when you fill the U shape, to place block such as trapdoors


//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
var inv = Player.openInventory();
var slots;  
var blockAmount;

var prevZ;
var prevX;
const startX = Math.floor(p.getX());
const startZ = Math.floor(p.getZ());
var firstFloor=true;

var dir;

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
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
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);
    
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
            KeyBind.keyBind("key.sneak", true);
            KeyBind.keyBind("key.back", false);
            KeyBind.keyBind("key.forward", false);
            Chat.log("Out of materials")
            throw("No more "+item);
        }
        Chat.log("Found the item, in slot "+swapSlot);
        inv.swapHotbar(swapSlot,i);
    }
    if (inv.findItem(reinforceMat).length==0){
            KeyBind.keyBind("key.sneak", true);
            KeyBind.keyBind("key.back", false);
            KeyBind.keyBind("key.forward", false);
        throw("Out of stone");
    }
}

function needLine(length,originX,originZ) { //Return true if you need to continue the line, false otherwise
    return (p.distanceTo(originX,p.getY(),originZ)<(length-1))
}

function lookAtEdge(dir){
    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());
    if (dir==-90) {
        p.lookAt(currentX+1,p.getY()-0.1,p.getZ())
    } else if (dir==0) {
        p.lookAt(p.getX(),p.getY()-0.1,currentZ+1)
    } else if (dir==90) {
        p.lookAt(currentX,p.getY()-0.1,p.getZ())
    } else { 
        p.lookAt(p.getX(),p.getY()-0.1,currentZ)
    }
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
            lookAtEdge(dir);
            placeFill(0);
            if ((length-1-p.distanceTo(originX,p.getY(),originZ))>1) {
                KeyBind.keyBind("key.sneak", false); 
                Client.waitTick(5-speed)
                KeyBind.keyBind("key.sneak", true);
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
    Client.waitTick(1)
    KeyBind.keyBind("key.back", false);
}

function blockToPlace(i,width,dir){ //Make you look where you should place
    if (dir==-180) { //You are facing north
        p.lookAt(Math.floor(p.getX())+0.5,p.getY()-0.1,Math.floor(p.getZ())-(width-3)+i)
    } else if (dir==-90){
        p.lookAt(Math.floor(p.getX())+(width-2)-i,p.getY()-0.1,Math.floor(p.getZ())+0.5)
    } else if (dir==0){
        p.lookAt(Math.floor(p.getX())+0.5,p.getY()-0.1,Math.floor(p.getZ())+(width-2)-i)
    } else {
        p.lookAt(Math.floor(p.getX())-(width-3)+i,p.getY()-0.1,Math.floor(p.getZ())+0.5)
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
    currentX = p.getX();
    currentZ = p.getZ();
    if (!sneakWhenFilling){
        KeyBind.keyBind("key.sneak", false);
        Client.waitTick(5);//Take time to get up

    }
    for (let i=0;i<length;i++){
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
    KeyBind.keyBind("key.sneak", false);

}

function floor5(length,width,floorSide){ //Make a floor using the L technique, supposing you already have a "side" to stick too and the first ledge is already built, starting from the direction you are facing
    Chat.log("floor 5 of width "+width)
    p.lookAt(p.getYaw()-180,0);
    line(length);
    p.lookAt(p.getYaw()-90*floorSide,0)
    if (width>1){
        fillFloor(length-1,width+1,floorSide);
    }
}

function refill(item,xChest,zChest){ //Empty your inv and refill with exactly 17 stacks of each
    walkTo(xStanding,zStanding);
    inv = Player.openInventory();
    blockAmount = Math.floor(inv.getItemCount().get(item)/64);
    Client.waitTick(lagTick)
    p.lookAt(xChest+0.5,p.getY()-0.5,zChest+0.5); //Open the chest
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    slots = inv.getSlots('container');
    for (const slot of slots) {
        const currentItem = inv.getSlot(slot);
        if ((currentItem.getItemId() == item)&&(blockAmount<18)) {
            inv.quick(slot);
            Client.waitTick();
            blockAmount++;
        }
    }
    if (blockAmount<17) {
        throw("No more "+item)
    }
    Player.openInventory().close();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
}

function refillBoth(){
    refill(currentColor,xBlockChest,zBlockChest);
    refill(reinforceMat,xReinforceChest,zReinforceChest);
    equip(currentColor,0);
}


function buildFlag(){ //Build the flag from north to south, and east to west, starting on the block you are on
    for (let i=1;i<=numberOfRefill;i++){
        Chat.log(startX); 
        walkTo(startX,startZ+i*5);
        p.lookAt(90,0);
        floor5(length,width,floorSide);
        refillBoth();
    }
    

}

buildFlag();