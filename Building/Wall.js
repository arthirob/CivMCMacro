// Script to make a wall
// To make the wall, look in the direction you want the wall to go, define the length and height and have your mats in the first slot. You need to start from a flat line


//Only edit those two variable, the rest don't touch
const wallLength = 6; //The length of the wall
const wallHeight = 5;  //The height of the wall

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
const inv = Player.openInventory();
const wallDir = (Math.floor((p.getYaw()+225)/90)%4)*90-180


var prevZ;
var prevX;
var startPoint;
var endPoint;

var dir; //0 if going from start to end, 1 if going from end to start

function initiateVar(){
    if (wallDir==-180) {//Wall is going north
        startPoint = Math.floor(p.getZ())
        endPoint = startPoint -wallLength+1;
    } else if (wallDir==-90) { //Wall is going east
        startPoint = Math.floor(p.getX())
        endPoint = startPoint + wallLength-1;
    } else if (wallDir==0) {
        startPoint = Math.floor(p.getZ())
        endPoint = startPoint + wallLength-1;
    } else if (wallDir==90) {
        startPoint = Math.floor(p.getX())
        endPoint = startPoint - wallLength+1;
    } else {
        throw("Problem with the faced direction")
    }
}

function placeFill(i) { //Autofill the i slot
    item = inv.getSlot(36+i).getItemID();
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

function onPoint(value) { //Return true if you are on this point
    if ((wallDir==-90)||(wallDir==90)) {//You are moving accross X value
        return (Math.abs(p.getX()-value-0.5)<0.2)
    } else {
        return (Math.abs(p.getZ()-value-0.5)<0.2)

    }
}

function needLine() { //Return true if you need to continue the line, false otherwise
    if (dir==0) {
        return (!onPoint(endPoint));
    } else {
        return (!onPoint(startPoint))
    }
}

function line() {
    p.lookAt(wallDir+180*dir,80);
    KeyBind.keyBind("key.forward", true);
    while (needLine()){
        Client.waitTick(2);
        placeFill(0);
    }
    KeyBind.keyBind("key.forward", false);
}

function jumpPlace() {
    inv.setSelectedHotbarSlotIndex(0);
    p.lookAt(0,90)
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(3);
    placeFill(0)
    KeyBind.keyBind("key.jump", false);
    Client.waitTick(5);
}

function wall() {
    initiateVar();
    KeyBind.keyBind("key.sneak", true);
    dir=0;
    for (let i=2;i<wallHeight;i=i+2) {
        jumpPlace();
        jumpPlace();
        line();
        dir=1-dir;
    }
    if (wallHeight%2==1) {
        jumpPlace();
        line();
    }
    KeyBind.keyBind("key.sneak", false);
    Chat.log("Wall is finished")
}

wall();