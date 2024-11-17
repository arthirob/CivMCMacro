// Script to make a floor
// To make the floor, start on the north west corner, define the size of it, and have your mats in the first slot


//Only edit those two variable, the rest don't touch
const distSouth = 9; //The number of blocks you want to go south
const distEast = 121;  //The number of blocks you want to go east
const torchGridX = 6; //The x distance between your torches
const torchGridZ = 6; //The z distance between your torches

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
const inv = Player.openInventory();
const xWest = Math.floor(p.getX());
const zNorth = Math.floor(p.getZ());
const xEast = xWest +(distEast-1);
const zSouth = zNorth + (distSouth-1);


var prevZ;
var prevX;

var dir;

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        throw("No more mats")
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick();
}

function walkTo(x, z) { // Walk to the center of a block
    Chat.log("Starting function walkTO")
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.2 || Math.abs(p.getZ() - z - 0.5 ) > 0.2)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);
    
}

function placeTorch(x,z){ // Place a torch if it follows the torch grid
    if ((x%torchGridX==0)&&(z%torchGridZ==0)) {
        placeFill(2);
        inv.setSelectedHotbarSlotIndex(0);
    }
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
            walkTo(1278,-4578)
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
        walkTo(1278,-4578)
        throw("Out of stone");
    }
}

function needLine(dir) { //Return true if you need to continue the line, false otherwise
    if (dir==90) {
        return (p.getX()<xEast+0.301)
    } else {
        return (xWest+0.301<p.getX())
    }
}

function lineX() {
    Chat.log("line")
    dir = 90*Math.abs(p.getYaw())/p.getYaw();
    p.lookAt(dir,80);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    prevX =p.getX();
    while (needLine(dir)){
        prevX = p.getX();
        Client.waitTick();
        if (prevX==p.getX()) {
            placeFill(0);
            KeyBind.keyBind("key.sneak", false);
            Client.waitTick(3)
            KeyBind.keyBind("key.sneak", true);
            placeTorch(Math.floor(p.getX()),Math.floor(p.getZ()));
        }
    }
    KeyBind.keyBind("key.back", false);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(4);
    KeyBind.keyBind("key.forward", false);

}

function turn(){
    Chat.log("turn")
    p.lookAt(180,80)
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    prevZ =p.getZ();
    Client.waitTick()
    while (prevZ != p.getZ()) {
        prevZ = p.getZ();
        Client.waitTick()
        
    }
    Client.waitTick(1);
    placeFill(0);
    placeTorch(Math.floor(p.getX()),Math.floor(p.getZ()));
    Client.waitTick(1)
    KeyBind.keyBind("key.back", false);
}

function Floor(){
    p.lookAt(90,0);
    equip("minecraft:torch",2);
    while ((p.getZ()<zSouth)) {
        lineX();
        turn();
        dir = (dir + 180)%360;
        p.lookAt(dir,80);
    }
    lineX();
    Chat.log("Floor finished")

}

Floor();