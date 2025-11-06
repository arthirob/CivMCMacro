/*
Script to harvest a square blue vine field, and compact the result. You might need to adjust const and compactor placement to be able to use it.
V1.0 by arthirob 04/11/2025

Things to improve
*/

// Constant and variable declaration

const p = Player.getPlayer() ;
var inv = Player.openInventory();
const lagTick = 6; // Edit this depending on your internet connection


// Farm border declaration (no border no nation tho')
const xEast = 6581;
const xWest = 6532;
const zNorth = -4477;
const zSouth = -4426;


//Compactor placement declaration
const xFrontCompactor = 6581;
const zFrontCompactor = -4433; // Those two is where you stand. Two blocks away from the compactor is probably the best idea
const xChestCompactor = 6583
const zChestCompactor = -4434
const xFurnaceCompactor = 6583
const zFurnaceCompactor = -4432

//JS Macro stuff used during the execution
var dir = 1 ;//The direction you are going. 1 for west, -1 for west. Edit here to change the start value
var line ; // The current line you are in
var timeRemaining ; //The time remaining in the farm approximately
var lineFinished; // The boolean to check if a line is finished
var slots;
var compactorOn = false; //Tells if the compactor is on or not

//Misc declaration
const discordGroup = 'FU-Bot';
const farmName = "Blue vine farm next to portal"
const regrowTime = 12;
const lineCompact = 2; //The number of line you want to make before compating
var currentCompact ; //Track how many line you did since last compact

const timePerRow = ((xEast-xWest)/3) + 3 ; // Count the time to harvest a row and the wait ticks
const startTime = Date.now();


function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);    
}

function equipStick() {
    listStick = inv.findItem("minecraft:stick");
    if (listStick.length==0) {
        throw("Have a stick in our inventory")
    }
    inv.swapHotbar(listStick[0],8);
}

function farmLine() { // Farm a line
    if (dir==1) {
        walkTo(xEast,line);
        p.lookAt(-180,0);
        KeyBind.keyBind("key.attack", true);
        Client.waitTick()
        KeyBind.keyBind("key.left", true);
    } else {
        walkTo(xWest,line);
        p.lookAt(-180,0);
        KeyBind.keyBind("key.attack", true);
        Client.waitTick()
        KeyBind.keyBind("key.right", true);

    }
    lineFinished=false;
    KeyBind.keyBind("key.attack", true);
    while (!lineFinished ) {
        Client.waitTick();
        if (dir==1) {
            lineFinished = (p.getX()<(xWest+0.8))
        } else {
            lineFinished = (p.getX()>(xEast+0.2))

        }
    }
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.right", false);
    KeyBind.keyBind("key.left", false);
    Client.waitTick(lagTick);
}

function farmTwoLine() { //Farm two line
    farmLine();
    line = line - 2;
    dir = -dir;
    farmLine();
    line = line -2 ;
    dir = -dir;
    currentCompact+=2 ;
    if (currentCompact>=lineCompact) {
        compact();
        currentCompact = 0;
    }
}

function compact() { //Go to the compactor, put things in the chest and hit the furnace with the stick
    walkTo(xFrontCompactor,zFrontCompactor );
    lookAtCenter(xChestCompactor,zChestCompactor); //Open the chest
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);

    inv = Player.openInventory();
    slots = inv.getSlots('main', 'hotbar', 'offhand');
    // Put the potatoes in the chest
    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item === "minecraft:twisting_vines") {
            inv.quick(slot);
            Client.waitTick();
            
        }
    }
    Player.openInventory().close();
    if (!compactorOn) {
        Client.waitTick(lagTick);
        lookAtCenter(xFurnaceCompactor,zFurnaceCompactor);
        inv.setSelectedHotbarSlotIndex(8);
        Client.waitTick(lagTick);
        p.attack();
        Client.waitTick(lagTick);
        inv.setSelectedHotbarSlotIndex(0);
        compactorOn  = true;
    }
}
function farmMain() { // Main farming functions
    line = Math.floor(p.getZ());
    if (line != zSouth) {
        Chat.log("Resuming at "+ (zSouth-line)+"th line")
    }
    inv.setSelectedHotbarSlotIndex(0);
    while (line >= zNorth) {
        timeRemaining = Math.floor((line-zNorth+1)*timePerRow/2);//Count the time to harvest the rows and add the time to go to the compactor
        Chat.log((line-zNorth+1) +" line remainings");
        Chat.log("Time remaining : "+ Math.floor(timeRemaining/60)+ " minutes and "+(timeRemaining%60)+" seconds");
        farmTwoLine();
    }
    if (currentCompact!=0) { //If you didn't just compact, compact before finishing
        compact();
    } 
}

function finishFarm() {
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. It'll be ready again in "+regrowTime+" hours. Now logging out") 
    Chat.say("/logout")
}

function align(){  // Get you back to a multiple of 4 remaining row, to be able to finish on the good spot
    shift = (zSouth-Math.floor(p.getZ()))%4;
    walkTo(Math.floor(p.getX()),Math.floor(p.getZ())+shift);
}

function start(){
    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());
    currentCompact = 0;
    //First check the position
    if ((xWest<=currentX)&&(currentX<=xEast)&&(zNorth<=currentZ)&&(currentZ<=zSouth)) { // Check if you are inside the farm
        equipStick();
        align()
        farmMain();
        finishFarm();
     }else {
        Chat.log("You are not in the farm, cannot proceed");
    }
}

start();