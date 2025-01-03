// Script to make a floor
// To make the floor, start on the north west corner, define the size of it, and have your mats in the first slot


//Only edit those two variable, the rest don't touch
const dist = 150; //The distance you want to make
const dir = -1 // -1 for east, 0 for south, 1 for west and 2 for north
const distBetweenPowered = 8;

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
const inv = Player.openInventory();

var originX;
var originZ;
var lastPlacedX;
var lastPlacedZ;
var sinceLastPowered = 1;

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY(), z+0.5);
}

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        throw("No more mats")
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick();
}

function walkSlowTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.sneak", true);
    Client.waitTick();
    while ((Math.abs(p.getX() - x - 0.5) > 0.05 || Math.abs(p.getZ() - z - 0.5 ) > 0.05)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    Chat.log("In here")
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);

    Client.waitTick(3);
    
}

function centerPlayer(){ //Centers a player on a block
    walkSlowTo(Math.floor(p.getX()),Math.floor(p.getZ()))
}

function placeFill(i) { //Autofill the i slot
    item = inv.getSlot(36+i).getItemID();
    inv.setSelectedHotbarSlotIndex(i);
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
            World.playSound("entity.elder_guardian.curse", 200);
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
        World.playSound("entity.elder_guardian.curse", 200);
        throw("Out of stone");
    }
}

function placeRail() {
    if (sinceLastPowered==distBetweenPowered) {
        KeyBind.keyBind("key.forward", false);
        placeFill(2)
        sinceLastPowered = 1
        p.lookAt(90*dir+80,60);
        Client.waitTick()
        placeFill(3);
        Client.waitTick();
        p.interact();
        Client.waitTick();
        p.lookAt(90*dir,60);
        KeyBind.keyBind("key.forward", true);

    } else {
        placeFill(1)
        sinceLastPowered++;
    }
}

function needRail(){
    if ((dir==-1)||(dir==1)) {
        if (Math.abs(lastPlacedX-p.getX())>1) {
            lastPlacedX = lastPlacedX - dir;
            return true
        } else {
            return false
        }
    } else {
        if (Math.abs(lastPlacedZ-p.getZ())>1) {
            lastPlacedZ = lastPlacedZ + 1 - dir
            return true
        } else {
            return false
        }

    }
}

function rail(){
    centerPlayer();
    equip("minecraft:rail",1);
    equip("minecraft:powered_rail",2);
    equip("minecraft:lever",3);
    let i = 0;
    KeyBind.keyBind("key.forward", true);
    p.lookAt(90*dir,60);
    originX = Math.floor(p.getX());
    originZ = Math.floor(p.getZ());
    lastPlacedX = originX;
    lastPlacedZ = originZ;
    placeRail();
    while (i<dist) {
        if (needRail()) {
            placeRail();
            i++;
        } else {
            Client.waitTick();
        }
    }
    KeyBind.keyBind("key.forward", false);
    World.playSound("entity.elder_guardian.curse", 200);
    Chat.log("Finished placing blocks")
}

rail();