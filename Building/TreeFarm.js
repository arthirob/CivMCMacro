//Script to build a layer of a tree farm
//The "edge" should already be built on the zNorth and zSouth places.
//You should start your bot on the southwest part of the farm, where you want your first line to be

const zNorth = 123;
const zSouth = 138;
const xEast = -13;
const xWest = -19;
const fullBock = "minecraft:dirt";
const slimBlock = "minecraft:glass_pane";
const reinforceMat = "minecraft:stone"
const distOfFull = 5; //The distance between full blocks
const distRow = 3 ; //The distance between two rows
const firstTreeDist = 2; //If your first tree distance to the ledge is the same, choose 0, otherwise choose the distance you want for the first tree


//No touching beyond this point
const p = Player.getPlayer() ;
const inv = Player.openInventory();
var prevZ =Math.floor(p.getZ());
var currentRow = Math.floor(p.getX());
var dir; //The direction you are facing
var finished;
var floorFinished = false;
var placedBlock;
var alignGoal;

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x,z) { // Walk to the center of a block. 
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(3);
}

function align(){//Align yourself with the middle of a slime block
    KeyBind.keyBind("key.sneak", true);
    alignGoal = Math.floor(p.getX())+0.5
    if ((p.distanceTo(alignGoal,p.getY(),p.getZ()))>0.05){
        if(p.getX()>alignGoal){ //
            p.lookAt(90,0)
        } else {
            p.lookAt(-90,0)
        }
        KeyBind.keyBind("key.forward", true);
        Client.waitTick()
        KeyBind.keyBind("key.forward", false);
        Client.waitTick(10);
        align();
    }


}

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        throw("No more "+item);
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick();
}



function placeFill(i) { //Autofill the i slot
    item = inv.getSlot(inv.getSlots('hotbar')[0]+i).getItemId();
    needRestock = inv.getSlot(inv.getSlots('hotbar')[0]+i).getCount()<=3
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


function bridgeLine(dir){
    finished = false;
    if (firstTreeDist!=0){
        placedBlock = distOfFull - firstTreeDist
    } else {
        placedBlock = 0 ;
    }
    align();
    p.lookAt(dir,80);
    KeyBind.keyBind("key.sneak", true);
    align();
    KeyBind.keyBind("key.back", true);
    while (!finished){ //
        prevZ = p.getZ();
        Client.waitTick();
        if (prevZ==p.getZ()) {
            if (placedBlock==(distOfFull-1)) {
                placeFill(1);
                placedBlock = 0;
            } else {
                placeFill(0);
                placedBlock+=1;
            }
        }
        if (dir==0) {
            if (prevZ < zNorth) {
                finished = true;
            }
        } else {
            if (prevZ > zSouth) {
                finished = true;
            }
        }
        
    }
    Chat.log("Line finished")
    KeyBind.keyBind("key.back", false);
    KeyBind.keyBind("key.sneak", false);
}

function bridgeFloor(){
    init();
    while (!floorFinished){
        bridgeLine(dir);
        if (Math.floor(p.getX())!=xEast){ //You have rows remaining
            if (dir==0){ //You just reach the north side
                Chat.log("walking north")
                walkTo(Math.floor(p.getX())+distRow,zNorth)
            } else {
                walkTo(Math.floor(p.getX())+distRow,zSouth)
            }
            dir = 180-dir;
        } else {
            floorFinished = true;
        }
    }
    Chat.log("Congratz")
}

function init(){ //Equip your slim block on first slot, and the full block on second slot
    equip(slimBlock,0);
    equip(fullBock,1);
    dir = 0; //Start from the south going to the north, so look to the south and walk back
}

bridgeFloor();
