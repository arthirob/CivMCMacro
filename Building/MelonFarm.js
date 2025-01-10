// Script to make a floor
// To make the floor, start on the north west corner, define the size of it, and have your mats in the first slot


//Only edit those five variable, the rest don't touch
const xLodestone = 4888;
const zLodestone = -6316; 
const torchGridX = 0; //The x distance between your torches
const torchGridZ = 0; //The z distance between your torches
const speed = 0; //1 if you have speed 1, 0 if you have speed 0

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
const inv = Player.openInventory();


var prevZ;
var prevX;

var dir;

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
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.sneak", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.05 || Math.abs(p.getZ() - z - 0.5 ) > 0.05)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);

    Client.waitTick(3);
    
}

function move(x,z) { //Make you move in a x and z direction
    walkSlowTo(Math.floor(p.getX())+x,Math.floor(p.getZ()+z))
}

function placeTorch(x,z){ // Place a torch if it follows the torch grid
    if ((x%torchGridX==0)&&(z%torchGridZ==0)) {
        placeFill(1);
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

function needLine(length,originX,originZ) { //Return true if you need to continue the line, false otherwise
    return ((Math.abs((originX-p.getX()))+Math.abs((originZ-p.getZ())))<(length-1))
}

function line(length) {
    originX = p.getX();
    originZ = p.getZ();
    dir = Math.floor((p.getYaw()+45)/90)*90;
    p.lookAt(dir,80);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    while (needLine(length,originX,originZ)){
        prevX = p.getX();
        prevZ = p.getZ();
        Client.waitTick();
        if ((prevX==p.getX())&&(prevZ==p.getZ())) {
            placeFill(0);
            KeyBind.keyBind("key.sneak", false);
            Client.waitTick(5-2*speed)
            KeyBind.keyBind("key.sneak", true);
            placeTorch(Math.floor(p.getX()),Math.floor(p.getZ()));
        }
    }
    KeyBind.keyBind("key.back", false);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(12-4*speed);
    KeyBind.keyBind("key.forward", false);
}

function turn(leftOrRight){ //Turn in a direction. -1 for left, 1 for right
    p.lookAt(dir+90*leftOrRight,80)
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    prevX = p.getX();
    prevZ = p.getZ();
    Client.waitTick()
    while ((prevX!=p.getX())||(prevZ!=p.getZ())) {
        prevX = p.getX();
        prevZ = p.getZ();
        Client.waitTick()
    }
    Client.waitTick(1);
    placeFill(0);
    placeTorch(Math.floor(p.getX()),Math.floor(p.getZ()));
    Client.waitTick(1)
    KeyBind.keyBind("key.back", false);
}

function Floor(length,width,firstTurn){//Make a floor of a certain length and width, and specify the direction you want it to go.
    p.lookAt(p.getYaw()+180,80);
    Client.waitTick();
    for (let i=0;i<width;i++) {
        line(length);
        if (i<(width-1)) { //Don't turn on last line
            turn(firstTurn);
            firstTurn = - firstTurn
        }
        p.lookAt(dir+180,80);

    }

}

function makeMelonFloor(){
    walkSlowTo(xLodestone,zLodestone);
    p.lookAt(-90,0);
    line(2)
    p.lookAt(180,0);
    line(2);
    p.lookAt(0,0);
    Floor(12,4,1)
    
    p.lookAt(-90,0);
    line(2)
    p.lookAt(90,0)
    Floor(40,4,-1)
    move(1,0);
    move(0,2);
    p.lookAt(-90,0);
    line(2);
    p.lookAt(90,0);
    Floor(40,4,-1);
    move(1,0);
    move(0,2);
    p.lookAt(-90,0);
    line(2);
    p.lookAt(90,0);
    Floor(40,2,-1)
    
    move(1,0);
    move(0,-11);
    p.lookAt(0,0);
    line(3);
    p.lookAt(180,0);
    Floor(32,4,-1)
    
    move(0,-1);
    p.lookAt(-90,0);
    line(2);
    p.lookAt(90,0);
    Floor(37,2,-1)
    
    move(4,0);
    p.lookAt(90,0);
    line(3);
    p.lookAt(180,0);
    Floor(32,4,1);
    p.lookAt(90,0);
    line(3);
    p.lookAt(180,0);
    Floor(32,4,1);
    p.lookAt(90,0);
    line(3);
    p.lookAt(180,0);
    Floor(32,4,1);
}

makeMelonFloor();