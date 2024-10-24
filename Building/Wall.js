// Script to make a wall
// To make 

const wallHeight = 80;

const p = Player.getPlayer() ;
const inv = Player.openInventory();
var prevZ =p.getZ();
var prevX =p.getX();

var dir;




function jump() {
    p.lookAt(p.getYaw(),90);
    KeyBind.keyBind("key.jump", true);
    Client.waitTick();
    KeyBind.keyBind("key.jump", false);
    Client.waitTick(2);
    placeFill(0);
}

function placeFill(i) { //Autofill the i slot
    item = inv.getSlot(36+i).getItemID();
    Chat.log(item);
    inv.setSelectedHotbarSlotIndex(i);
    Client.waitTick();
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


function wall() {
    while (p.getZ()<wallHeight)

}

