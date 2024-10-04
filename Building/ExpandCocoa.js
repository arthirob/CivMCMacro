// Constant and variable declaration
const p = Player.getPlayer() ;
const inv = Player.openInventory();

const heightGoal = 300;
const logType = "minecraft:jungle_log"
const cocoaBean = "minecraft:cocoa_beans"
const treeX = Math.floor(p.getX());
const treeZ = Math.floor(p.getZ());
var currentY;
const smallWait = 4;
const longWait = 16;


function jumpPlace() {
    inv.setSelectedHotbarSlotIndex(0);
    p.lookAt(0,90)
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(3);
    placeFill(0)
    KeyBind.keyBind("key.jump", false);
    Client.waitTick(3);
}

function placeFill(i) { //Autofill the i slot
    item = inv.getSlot(36+i);
    inv.setSelectedHotbarSlotIndex(i);
    Client.waitTick();
    p.interact();
    Client.waitTick();
    if (inv.getSlot(36+i).getCount()==0) { //i slot empty
        list = inv.findItem(item);
        if (list.length==0) {
            KeyBind.keyBind("key.back", false);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.forward", true);
            Client.waitTick(3);
            KeyBind.keyBind("key.forward", false);
            KeyBind.keyBind("key.sneak", false);
            Chat.log("Out of materials")
            throw("No more mats")
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

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkSlowTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.sneak", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.1 || Math.abs(p.getZ() - z - 0.5 ) > 0.1)){
        lookAtCenter(x,z);// Allow trajectory correction
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);    
}

function placeTwoCocoa(i) { //is is between -1 and 3
    inv.setSelectedHotbarSlotIndex(1);
    p.lookAt(90*i,84);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    Client.waitTick(longWait);
    placeFill(1);
    Client.waitTick(smallWait);
    p.lookAt(90*i,78);
    KeyBind.keyBind("key.back", false);
    Client.waitTick(smallWait);
    placeFill(1);
    Client.waitTick(smallWait);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(smallWait)
}

function placeTwo(i){
    Client.waitTick(smallWait);
    if (i==1) {
        p.lookAt(treeX,p.getY()-1.5,treeZ+0.5);
        Client.waitTick(smallWait)
        placeFill(1);
        p.lookAt(treeX,p.getY()-0.5,treeZ+0.5);
        Client.waitTick(smallWait)
        placeFill(cocoaBean,1);
    }
    if (i==2) {
        p.lookAt(treeX+0.5,p.getY()-1.5,treeZ);
        Client.waitTick(smallWait)
        placeFill(1);
        p.lookAt(treeX+0.5,p.getY()-0.5,treeZ);
        Client.waitTick(smallWait)
        placeFill(1);
    }
    if (i==3) {
        p.lookAt(treeX+1,p.getY()-1.5,treeZ+0.5);
        Client.waitTick(smallWait)
        placeFill(1);
        p.lookAt(treeX+1,p.getY()-0.5,treeZ+0.5);
        Client.waitTick(smallWait)
        placeFill(1);
    }
    if (i==4) {
        p.lookAt(treeX+0.5,p.getY()-1.5,treeZ+1);
        Client.waitTick(smallWait)
        placeFill(1);
        p.lookAt(treeX+0.5,p.getY()-0.5,treeZ+1);
        Client.waitTick(smallWait)
        placeFill(1);
    }

}

function placeAround() {
    inv.setSelectedHotbarSlotIndex(1);
    p.lookAt(-90,90)
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    while (treeX-p.getX()<0.2) {
        Client.waitTick();
    }
    KeyBind.keyBind("key.back", false);
    placeTwo(1);
    KeyBind.keyBind("key.left", true);
    placed = 1;
    while (placed<4) {
        Client.waitTick();
        lookAtCenter(treeX,treeZ);
        if (p.getYaw()>(-135+90*placed)) {
            placed+=1
            placeTwo(placed);
        }
    }
    KeyBind.keyBind("key.left", false);
    walkSlowTo(treeX,treeZ);
}


function makeTwoLayer() {
    jumpPlace() ;
    Client.waitTick(smallWait);
    jumpPlace();
    Client.waitTick(smallWait);
    placeAround();
}


function makeTree() {
    currentZ = p.getY();
    while (currentZ<heightGoal) {
        makeTwoLayer();
        Client.waitTick(smallWait);
    }
}

makeTree();