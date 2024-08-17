//Script to build a layer of a tree farm

const zNorth = 0;
const zSouth = 30;
const xEast = -8;
const xWest = -32;

const fullBock = "minecraft:dirt";
const slimBlock = "minecraft:glass_pane";
const p = Player.getPlayer() ;
const inv = Player.openInventory();
const distOfDirt = 5;
const distRow =5;
var prevZ =p.getZ();

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
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

function placeFill(i,item) { //Autofill the i slot
    inv.setSelectedHotbarSlotIndex(i);
    Chat.log(item);
    p.interact();
    Client.waitTick();
    if (inv.getSlot(36+i).getItemId()=="minecraft:air") { //i slot empty
        list = inv.findItem(item);
        Chat.log("length"+list.length);
        Chat.log("firstvalue"+list[0]);
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
}


function bridgeLine(item,dir){
    var placedBlock=0 ;
    p.lookAt(dir,80);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    prevZ = p.getZ();
    while ((zNorth < prevZ)&&(prevZ < zSouth)){
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
        
    }
    KeyBind.keyBind("key.sneak", false);
    KeyBind.keyBind("key.back", false);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(3);
    KeyBind.keyBind("key.forward", false);
}

function bridgeFloor(){
    var dir = (Math.floor((p.getYaw()+90)/180))*180;
    var item = inv.getSlot(36);
    while ((xWest <= p.getX())&&(p.getX() <= xEast)){
        bridgeLine(item,dir);
        Chat.log(Math.floor(p.getX()+distRow));
        if (dir==180) {
            zObj = zNorth ;
        } else {
            zObj = zSouth ;
        }
        walkTo(Math.floor(p.getX()+distRow),zObj);
        dir = (dir+180)%360;
    }
}

Chat.log(inv.findItem("minecraft:glass_pane")[0])
bridgeFloor();
