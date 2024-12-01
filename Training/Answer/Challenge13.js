const p = Player.getPlayer() ;
const inv = Player.openInventory();
snowballList = inv.findItem("minecraft:snowball")

function equipSnow() {
    if (snowballList.length==0) {
        throw("You don't have any snow")
    } else {
        inv.swapHotbar(snowballList[0],0);
    }
}

function yeetSnow() {
    inv.setSelectedHotbarSlotIndex(0);
    p.interact();
    Client.waitTick(2);
    if (inv.getSlot(36).getCount()==0) { //i slot empty
        snowballList = inv.findItem("minecraft:snowball")
        if (snowballList.length==0) {
            throw("You don't have any snow")
        } else {
            inv.swapHotbar(snowballList[0],0);
            Client.waitTick(5);
        }    }

}

function start() {
    equipSnow();
    for (let i=0;i<32;i++) {
        yeetSnow();
    }
}

start();
Chat.log("Script over");
