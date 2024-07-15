// Script to make a wall or a floor
// To make the floor, start on the north west corner, and choose where to stop by placing zSouth and Xeast value, and look torward the east. The hotbar should have the item you want to use in the first slot, and the rest of the hotbar shouldn't contain the item

const xEast = -6;
const xWest = -14;
const zNorth = -1;
const zSouth = 8;

const p = Player.getPlayer() ;
const inv = Player.openInventory();
var prevZ =p.getZ();
var prevX =p.getX();
var wallHeight = 74;

var dir;




function jump() {
    p.lookAt(p.getYaw(),90);
    KeyBind.keyBind("key.jump", true);
    Client.waitTick();
    KeyBind.keyBind("key.jump", false);
    Client.waitTick(3);
    p.interact();
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
            }
}

function lineX(item) {
    dir = (Math.floor((p.getYaw()+45)/90))*90;
    p.lookAt(dir,80);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    var prevX =p.getX();
    while (((xWest+0.301) < prevX)&&(prevX < xEast+0.301)){
        prevX = p.getX();

        Client.waitTick();
        if (prevX==p.getX()) {
            placeFill(item);
        }
    }
    KeyBind.keyBind("key.back", false);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(6);
    KeyBind.keyBind("key.forward", false);

}

function wall(item) {

    Chat.log(Math.floor(p.getY()));
    while (Math.floor(p.getY())<wallHeight) {
        jump(item)
        lineX(item);
        dir = (dir + 180)%360;
        p.lookAt(dir,80);
        Client.waitTick(10);
    }
    Chat.log("Wall finished")
}

function turn(item){
    p.lookAt(180,80)
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    var prevZ =p.getZ();
    Client.waitTick()
    while (prevZ != p.getZ()) {
        prevZ = p.getZ();
        Client.waitTick()
    }
    Client.waitTick(1);
    placeFill(item);
    Client.waitTick(1)
    KeyBind.keyBind("key.back", false);
}

function Floor(){
    const start = p.getZ();
    var item = inv.getSlot(36);
    while ((p.getZ()<zSouth)) {
        lineX(item);
        turn(item);
        dir = (dir + 180)%360;
        p.lookAt(dir,80);
    }
    lineX();
    Chat.log("Floor finished")

}

Floor();