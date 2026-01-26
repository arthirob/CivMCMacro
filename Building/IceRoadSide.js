// Script to make a 3 block tall wallz
// Hug the wall and it'll build in the direction behind you

//Only edit those two variable, the rest don't touch
const wallLength = 750;
const lagTick = 6;

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
const inv = Player.openInventory();
const wallDir = (Math.floor((p.getYaw()+225)/90)%4)*90-180
const reinforceMat = "minecraft:stone"



var dir; //0 if going from start to end, 1 if going from end to start

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        World.playSound("entity.elder_guardian.curse", 200);
        throw("No more mats")
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick(lagTick);
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
            throw("No more mats")
        }
        Chat.log("Found the item, in slot "+swapSlot);
        inv.swapHotbar(swapSlot,i);
    }
    if (inv.findItem(reinforceMat).length==0){
        KeyBind.keyBind("key.back", false);
        throw("Out of stone");
    }
}


function line(){
    p.lookAt(dir,-30);
    placeFill(0);
    p.lookAt(dir,0);
    placeFill(0);
    p.lookAt(dir,45);
    placeFill(0);
    /*KeyBind.keyBind("key.back", false);
    Client.waitTick(20);
    KeyBind.keyBind("key.back", true);
    */


}
function init(){
    if (refill) {
        equip("minecraft:obsidian",0)
    }
}

function wall() {
    equip("minecraft:obsidian",0);
    startX = p.getX();
    startZ = p.getZ();
    placed = 1;
    dir = (Math.floor((p.getYaw()+225)/90)%4)*90-180
    p.lookAt(dir,0);
    KeyBind.keyBind("key.back", true);

    while (placed<wallLength) {
        if (p.distanceTo(startX,p.getY(),startZ)>placed) {
            KeyBind.keyBind("key.sneak", true);
            line();
            placed++
            KeyBind.keyBind("key.sneak", false);
        } else {
            Client.waitTick();
        }
    }
}

wall();