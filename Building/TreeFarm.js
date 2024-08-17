//Script to build a layer of a tree farm

const zNorth = 0;
const zSouth = 15;
const xEast = -8;
const xWest = -32;

const fullBock = "minecraft:dirt";
const slimBlock = "minecraft:glass_pane";
const p = Player.getPlayer() ;
const inv = Player.openInventory();
const distOfDirt = 5;
const distRow =5;
var prevZ =Math.floor(p.getZ());
var currentRow = Math.floor(p.getX());

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.01 || Math.abs(p.getZ() - z - 0.5 ) > 0.01)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);
}

function alignX(x){
    var currentX = p.getX()
    if ((Math.abs(currentX-x-0.5))>0.06) { //You are not aligned
        p.lookAt(180,0);
        if (currentX>(x+0.5)) {
            KeyBind.keyBind("key.left", true);
            Client.waitTick();
            KeyBind.keyBind("key.left", false);
            alignX(x)
        } else {
            KeyBind.keyBind("key.right", true);
            Client.waitTick();
            KeyBind.keyBind("key.right", false);
            alignX(x);
        }
    }
}

function placeFill(i,item) { //Autofill the i slot
    inv.setSelectedHotbarSlotIndex(i);
    p.interact();
    Client.waitTick();
    if (inv.getSlot(36+i).getItemId()=="minecraft:air") { //i slot empty
        list = inv.findItem(item);
        if (list.length==0) {
            KeyBind.keyBind("key.back", false);
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
}


function bridgeLine(dir){
    var finished = false
    var placedBlock=0 ;
    p.lookAt(dir,80);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    prevZ = p.getZ();
    while (!finished){
        prevZ = p.getZ();
        Client.waitTick();
        if (prevZ==p.getZ()) {
            if (placedBlock==(distOfDirt-1)) {
                placeFill(1,fullBock);
                placedBlock = 0;
            } else {
                placeFill(0,slimBlock);
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
    KeyBind.keyBind("key.back", false);
}

function bridgeFloor(){
    var dir = 180;
    walkTo(currentRow,prevZ);
    alignX(currentRow);
    while (currentRow+distRow<xEast){
        bridgeLine(dir);
        if (dir==0) {
            zObj = zNorth ;
        } else {
            zObj = zSouth ;
        }
        currentRow+=distRow;
        walkTo(currentRow,zObj);
        alignX(currentRow);
        dir = (dir+180)%360;
    }
}

bridgeFloor();
