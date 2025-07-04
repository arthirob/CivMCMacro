// Script to make a floor
// To make the floor, start on the north west corner, define the size of it, and have your mats in the first slot
//Hotbar : Obby on 1, cherry trapdoor on 2, pick on 3, ladder on 4 

//This needs a bit of configuration.Right now, it is set up to start from the south west corner

//Only edit those five variable, the rest don't touch

const speed = 0; //1 if you have speed 1, 0 if you have speed 0
const xEast = 6055 ;
const xWest = 6049;
const zNorth = -6487;
const zSouth = -6481;
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

function placeTrapdoorUp(){
    increaseValue = [[0,-1],[1,0],[0,1],[-1,0]]
    startingPoint = [[xWest+0.1,zSouth-0.5],[xWest+1.5,zNorth+0.1],[xEast+0.9,zNorth+1.5],[xEast-0.5,zSouth+0.9]]
    walkTo((xWest+xEast)/2,(zNorth+zSouth)/2);
    for (let h=0;h<1;h++) {
        for (let i=0;i<4;i++) {
            for (let j=0;j<5;j++) {
                if (j!=2) {
                    p.lookAt(startingPoint[i][0]+j*increaseValue[i][0],p.getY()+2+h*0.125,startingPoint[i][1]+j*increaseValue[i][1])
                    placeFill(1);
                    Client.waitTick()
                    p.interact();
                    Client.waitTick()
                }
            }
        }
    }
}

placeTrapdoorUp();

