// Script to make a floor
// To make the floor, start on the north west corner, define the size of it, and have your mats in the first slot
//Hotbar : Obby on 1, cherry trapdoor on 2, pick on 3, ladder on 4 

//This needs a bit of configuration.Right now, it is set up to start from the south west corner

//Only edit those five variable, the rest don't touch

const speed = 0; //1 if you have speed 1, 0 if you have speed 0
const xEast = -453 ;
const xWest = -459;
const zNorth = -448;
const zSouth = 454;
const ladderX = [6050,6052];
const ladderZ = [-6484,-6486]
const lagTick = 5;  


//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
const inv = Player.openInventory();
const im = Player.getInteractionManager();
const obbyBreakTime = 70;
const reinforceMat = "minecraft:stone"


var prevZ;
var prevX;

var dir;

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        throw("No more "+item);
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick();
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.1 || Math.abs(p.getZ() - z - 0.5 ) > 0.1)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        prevX = p.getX();
        prevZ = p.getZ();
        Client.waitTick();
        if (p.distanceTo(prevX,p.getY(),prevZ)<0.05) {
            KeyBind.keyBind("key.jump", true);
            Client.waitTick(2);
            KeyBind.keyBind("key.jump", false);
        }
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);

    
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

function jumpPlace(i) {
    inv.setSelectedHotbarSlotIndex(i);
    p.lookAt(0,90)
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(3);
    placeFill(i)
    KeyBind.keyBind("key.jump", false);
    Client.waitTick(5);
}

function needLine(length,originX,originZ) { //Return true if you need to continue the line, false otherwise
    return (p.distanceTo(originX,p.getY(),originZ)<(length-1))
}

function line(length) {
    originX = Math.floor(p.getX())+0.5;
    originZ = Math.floor(p.getZ())+0.5;
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
            Client.waitTick(5-speed)
            KeyBind.keyBind("key.sneak", true);
        }
    }
    KeyBind.keyBind("key.back", false);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(12-2*speed);
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
    p.lookAt(dir,0);
    KeyBind.keyBind("key.sneak", false);
}

function placeWall(){
    let waitingTick = 2;
    //Do the corners
    walkTo((xWest+xEast)/2,(zNorth+zSouth)/2-1);
    p.lookAt(xWest+0.5,p.getY(),zNorth+0.5);
    placeFill(0);
    p.lookAt(xWest+0.5,p.getY()+1,zNorth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    p.lookAt(xEast+0.5,p.getY(),zNorth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    p.lookAt(xEast+0.5,p.getY()+1,zNorth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    walkTo((xWest+xEast)/2,(zNorth+zSouth)/2+1);
    p.lookAt(xWest+0.5,p.getY(),zSouth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    p.lookAt(xWest+0.5,p.getY()+1,zSouth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    p.lookAt(xEast+0.5,p.getY(),zSouth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    p.lookAt(xEast+0.5,p.getY()+1,zSouth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    //Do the middle
    walkTo((xWest+xEast)/2,(zNorth+zSouth)/2);
    p.lookAt((xWest+xEast)/2+0.5,p.getY(),zNorth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    p.lookAt((xWest+xEast)/2+0.5,p.getY()+1,zNorth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    p.lookAt(xEast+0.5,p.getY(),(zSouth+zNorth)/2+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    p.lookAt(xEast+0.5,p.getY()+1,(zSouth+zNorth)/2+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    p.lookAt((xWest+xEast)/2+0.5,p.getY(),zSouth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    Client.waitTick(waitingTick);
    p.lookAt((xWest+xEast)/2+0.5,p.getY()+1,zSouth+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    Client.waitTick(waitingTick);
    p.lookAt(xWest+0.5,p.getY(),(zSouth+zNorth)/2+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
    p.lookAt(xWest+0.5,p.getY()+1,(zSouth+zNorth)/2+0.5);
    Client.waitTick(waitingTick);
    placeFill(0);
}

function checkPillar(){
    prevY = p.getY()
    p.lookAt(ladderX[0]+0.5,prevY,ladderZ[0]+0.5)
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(100);
    if (p.getY()!=(prevY+2)) { //You are not going up, so you are the last obby is not placed
        walkTo((xWest+xEast)/2,(zNorth+zSouth)/2);
        throw("Error pillar not placed")
    } else {
        walkTo(xWest,zSouth);
        jumpPlace(0);
    }

}

function placeTrapdoor(){
    increaseValue = [[0,-1],[1,0],[0,1],[-1,0]]
    startingPoint = [[xWest+0.1,zSouth-0.5],[xWest+1.5,zNorth+0.1],[xEast+0.9,zNorth+1.5],[xEast-0.5,zSouth+0.9]]
    walkTo((xWest+xEast)/2,(zNorth+zSouth)/2);
    KeyBind.keyBind("key.sneak", true);
    for (let h=0;h<1;h++) {
        for (let i=0;i<4;i++) {
            for (let j=0;j<5;j++) {
                if (j!=2) {
                    p.lookAt(startingPoint[i][0]+j*increaseValue[i][0],p.getY()+h*0.125,startingPoint[i][1]+j*increaseValue[i][1])
                    placeFill(1);
                    Client.waitTick()
                }
            }
        }
    }
    KeyBind.keyBind("key.sneak", false);
    startingPoint = [[xWest+0.9,zSouth-0.5],[xWest+1.5,zNorth+0.9],[xEast+0.1,zNorth+1.5],[xEast-0.5,zSouth+0.1]]

    Client.waitTick(lagTick);
    for (let h=0;h<1;h++) {
        for (let i=0;i<4;i++) {
            for (let j=0;j<5;j++) {
                if (j!=2) {
                    p.lookAt(startingPoint[i][0]+j*increaseValue[i][0],p.getY()+h,startingPoint[i][1]+j*increaseValue[i][1])
                    Client.waitTick();
                    p.interact();
                    Client.waitTick()
                }
            }
        }
    }


}

function placeLadder(){
    walkTo((xWest+xEast)/2,(zNorth+zSouth)/2);
    for (let i=0;i<ladderX.length;i++) {
        inv.setSelectedHotbarSlotIndex(2);
        p.lookAt(ladderX[i]+0.5,p.getY(),ladderZ[i]+0.5);
        KeyBind.keyBind("key.attack", true);
        Client.waitTick(obbyBreakTime);
        KeyBind.keyBind("key.attack", false);
        p.lookAt(ladderX[i]+0.5,p.getY(),ladderZ[i]+0.5);
        placeFill(1);
        Client.waitTick();
        p.lookAt(ladderX[i]+0.5,p.getY()+1,ladderZ[i]+0.5);
        placeFill(3);
        p.lookAt(ladderX[i]+0.5,p.getY()+1.5,ladderZ[i]+0.5);
        placeFill(3);
    }
}

function SoyjackLevel(){
    p.lookAt(180,0);
    Client.waitTick();
    Floor(7,7,1);
    placeWall();
    placeTrapdoor();
    placeLadder()
    checkPillar();
}

function SoyjackTower(){
    for (let i=1;i<11;i++) {
        Chat.log("Doing level "+i)
        SoyjackLevel();
    }
}

SoyjackTower();