// Script to make a snitch tower. This is a 2 part script where you place block 1,2,3 & 4 then 7,8 & 9, and block 5 & 6 need hand placing.
// To make the tower, set corner to true for the first part, and to false for the second part


//Only edit those two variable, the rest don't touch
const reinforceMat = "minecraft:stone"
const lagTick = 6;
const belowWater = false ;
const obbyLayer = [[-60,3],[-49,3],[-31,6],[-8,6],[15,6],[38,6],[61,6],[84,6],[107,6],[130,6],[153,6],[176,6],[199,6],[222,6],[245,6],[268,6],[291,6]] //Stand where the lowest obby should be 

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
var inv = Player.openInventory();
var placingSlot = 0;//0 for purpur, 1 for obby

var currentY;
const startTime = Date.now();

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY(), z+0.5);
}

function walkSlowTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.sneak", true);
    Client.waitTick();
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);    
}

function center(){
    walkSlowTo(Math.floor(p.getX()),Math.floor(p.getZ()));
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
            throw("No more mats")
        }
        Chat.log("Found the item, in slot "+swapSlot);
        inv.swapHotbar(swapSlot,i);
    }
    
    if (inv.findItem(reinforceMat).length==0){
        throw("Out of stone");
    }
    
}

function line() {
    KeyBind.keyBind("key.sneak", true);
    p.lookAt(-25,30);
    placeFill(placingSlot);
    p.lookAt(0,30);
    placeFill(placingSlot);
    p.lookAt(25,30);
    placeFill(placingSlot);
    p.lookAt(45,45);
    placeFill(placingSlot);
    p.lookAt(-90,50);
    placeFill(placingSlot);

    p.lookAt(90,50);
    placeFill(placingSlot)

    jumpPlace(placingSlot);

}

function jumpPlace(i) {
    inv.setSelectedHotbarSlotIndex(0);
    p.lookAt(0,90)
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(3);
    placeFill(i)
    KeyBind.keyBind("key.jump", false);
    Client.waitTick(5);
}

function keepPlacing(){
    if (belowWater) {
        return(p.getY()<42)
    } else {
        return (p.getY()<314)
    }
}

function changeMats(){
    placingSlot = 0;
    currentY = p.getY();
    for (i of obbyLayer){
        if ((i[0]<=currentY)&&(currentY<(i[0]+i[1]))){
            Chat.log("You switched to obby")
            placingSlot = 1
        }
    }
}

function wall() {
    KeyBind.keyBind("key.sneak", true);
    center();
    changeMats();
    while (keepPlacing()) {
        line();
        changeMats();
    }
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("Finished in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds")
    KeyBind.keyBind("key.sneak", false);
t}


wall();