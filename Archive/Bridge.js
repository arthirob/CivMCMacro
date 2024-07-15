const zNorth = -6279;
const zSouth = -6124;
const xEast = 6376;
const xWest = 6326;


const p = Player.getPlayer() ;
const inv = Player.openInventory();
const distOfDirt = 7;
const distRow =7;
var prevZ =p.getZ();

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.4 || Math.abs(p.getZ() - z - 0.5 ) > 0.4)){
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);
    
}

function placeFill(item) {
    p.interact();
            if (inv.findFreeHotbarSlot()==36) { //First slot empty
                list = inv.findItem(item);
                Chat.log("Listlength"+list.length);
                if (list.length==0) {
                    KeyBind.keyBind("key.sneak", false);
                    KeyBind.keyBind("key.back", false);
                    KeyBind.keyBind("key.forward", true);
                    Client.waitTick(3);
                    KeyBind.keyBind("key.forward", false);
                    Chat.log("Out of materials")
                    throw("No more mats")
                }
                inv.quick(list[0]);
                Client.waitTick(10);
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
                KeyBind.keyBind("key.hotbar.2", true);
                Client.waitTick();
                KeyBind.keyBind("key.hotbar.2", false);
                p.interact();
                placedBlock = 0;
                KeyBind.keyBind("key.hotbar.1", true);
                Client.waitTick();
                KeyBind.keyBind("key.hotbar.1", false);
            } else {
                placeFill(item);
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
        walkTo(Math.floor(p.getX()+distRow),Math.floor(p.getZ()));
        dir = (dir+180)%360;
    }
}

bridgeFloor();
