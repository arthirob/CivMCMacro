//Only edit those five variable, the rest don't touch
const xLodestone = 4888;
const zLodestone = -6316; 
const speed = 0; //1 if you have speed 1, 0 if you have speed 0
const seed = "minecraft:melon_seeds"
const lagTick = 6;
const damageTreshhold = 15;

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
const inv = Player.openInventory();


var originX;
var originZ;

var dir;

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY(), z+0.5);
}

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        World.playSound("entity.elder_guardian.curse", 200);
        throw("No more mats")
    }
    inv.swap(list[0],slot);
    Client.waitTick();
}

function toolCheck() { // Check if your tool can be used, and if not, switch it
    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
        throw("No more tool")
    }
}


function walkTo(x, z,slow) { // Walk to the center of a block
    KeyBind.keyBind("key.forward", true);
    if (slow) {
        KeyBind.keyBind("key.sneak", true);
    }
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.1){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);

    Client.waitTick(3);
    
}

function move(x,z,slow) { //Make you move in a x and z direction
    walkTo(Math.floor(p.getX())+x,Math.floor(p.getZ()+z),slow)
}

function align(){
    move(0,0,true)
}

function lodestoneUp(goingUp) {//If true, go up, otherwise go down
    p.lookAt(0,90);
    Client.waitTick(lagTick);
    if (goingUp) {
        p.interact();
    } else {
        p.attack();
    }
    Client.waitTick(lagTick)
}


function refill() {
    if (inv.getSlot(45).getCount()==0) { //i slot empty
            equip(seed,45);
    }
}

function tiltLine(dir,length){
    p.lookAt(90*dir,90);
    Client.waitTick();
    p.interact();
    Client.waitTick(10)
    p.interact();
    refill();
    p.lookAt(90*dir,45);
    originX = Math.floor(p.getX())+0.5;
    originZ = Math.floor(p.getZ())+0.5;
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.use", true);

    while (p.distanceTo(originX,p.getY(),originZ)<(length-1)) {
        refill();
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    KeyBind.keyBind("key.use", false);

    toolCheck();

}

function plantMelonFloor(){
    move(-1,1,true);
    tiltLine(1,40)
    move(-4,3,true);
    tiltLine(-1,40);
    move(0,2,true);
    tiltLine(1,40);
    move(0,3,true)
    tiltLine(-1,40);
    move(0,2,true);
    tiltLine(1,40);
    move(12,-12,false);
    align();
    tiltLine(-1,26);
    align();
    tiltLine(2,20);
    move(3,-8,false);
    align();
    tiltLine(0,28);
    move(2,0,true);
    tiltLine(2,28);
    move(3,-4,true);
    tiltLine(0,32);
    move(2,0,true);
    tiltLine(2,32);
    move(3,0,true);
    tiltLine(0,28);
    move(2,-8,false);
    align();
    tiltLine(2,20);
    move(3,0,true);
    tiltLine(0,20);
}

function plantAll(){
    for (let i=0;i<10;i++) {
        plantMelonFloor();
        walkTo(xLodestone,zLodestone,false);
        lodestoneUp(true);
    }
}

plantAll();