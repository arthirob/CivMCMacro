// Script to make a floor
// To make the floor, start on the north west corner, define the size of it, and have your mats in the first slot


//Only edit those five variable, the rest don't touch
const xLodestone = 4888;
const zLodestone = -6316; 
const torchGridX = 0; //The x distance between your torches
const torchGridZ = 0; //The z distance between your torches
const speed = 2; //1 if you have speed 1, 0 if you have speed 0

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
const inv = Player.openInventory();


var prevZ;
var prevX;
var refill;
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
    if (inv.getSlot(36+i).getCount()==1) {
        KeyBind.keyBind("key.back", false);
        refill = true;
    } else {
        refill = false;
    }
    inv.setSelectedHotbarSlotIndex(i);
    p.interact();
    if (refill) { //i slot empty
        Client.waitTick()
        list = inv.findItem(item);
        if (list.length==0) {
            KeyBind.keyBind("key.back", false);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.forward", true);
            Client.waitTick(3);
            KeyBind.keyBind("key.forward", false);
            KeyBind.keyBind("key.sneak", false);
            throw("No more mats")
        }
        inv.swapHotbar(list[0],i);
        Client.waitTick();
        KeyBind.keyBind("key.back", true);
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

function line(length) {
    originX = Math.floor(p.getX())+0.5;
    originZ = Math.floor(p.getZ())+0.5;
    dir = Math.floor((p.getYaw()+45)/90)*90;
    p.lookAt(dir,80);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    while (p.distanceTo(originX,p.getY(),originZ)<(length-1)){
        prevX = p.getX();
        prevZ = p.getZ();
        Client.waitTick();
        if ((prevX==p.getX())&&(prevZ==p.getZ())) {
            placeFill(0);
            
        }
    }
    KeyBind.keyBind("key.back", false);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(12-3*speed);
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