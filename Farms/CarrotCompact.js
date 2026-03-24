/*
Script to harvest a square potato field, and compact the result.
V2.0 by arthirob and wandrum 24/03/2026

This one harvest sideway to make sure no crop is lost. By default, it starts from the south west corner, and move to the east.
To start from north to south first, you just need to change the dir variable line 36
To start from east to west, you need to edit the pitch function to look the other way, farmLine to decrease, farmMain correction on row number, and farmMain end condition
*/

// Constant and variable declaration

const p = Player.getPlayer() ;
const inv = Player.openInventory();
const lagTick = 6; // Edit this depending on your internet connection


// Farm border declaration (no border no nation tho')
const xEast = 5792;
const xWest = 5713;
const zNorth = -5070;
const zSouth = -4991;

//Compactor placement declaration
const xFrontCompactor = 5755;
const zFrontCompactor = -5070; // Those two is where you stand. Two blocks away from the compactor is probably the best idea
const xChestCompactor = 5754
const zChestCompactor = -5072
const xFurnaceCompactor = 5756
const zFurnaceCompactor = -5072

//Misc declaration
const discordGroup = 'FU-Bot';
const farmName = "Carrot farm south of Moscow"
const regrowTime = 32;
const pitchGoal = 13    ; //The pitch you want to reach
const angle = 20; //The angle you want to harvest
const shift = -0.8; //How far you want to stay from the middle of the row
var dir = 0 ;//The direction you are starting from. 1 for north, 0 for south. Edit here to change the start value
const lineCompact = 6; //The number of line you want to make before compating

//NO TOUCHING BEYOND THIS POINT
var currentCompact ; //Track how many line you did since last compact

var row ; // The current row you are in
var justStarted;
var timeRemaining ; //The time remaining in the farm approximately
var lineFinished; // The boolean to check if a line is finished

const timePerRow = ((zSouth-zNorth)/4.31) + 3 ; // Count the time to harvest a row and the wait ticks
const startTime = Date.now();


function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);// Allow trajectory correction
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(lagTick);
    
}

function equipTool() { // Function to equip a tool with the fortune effect
    var foundTool = false;
    let i = 9;
    while ((i < 45)&&(!foundTool)){
        if (inv.getSlot(i).hasEnchantment("fortune")) {
            if (inv.getSlot(i).getEnchantment("Fortune").getLevel()==3) {
                inv.swapHotbar(i,0);
                foundTool=true;
            }
        }
        i++;
    }
    if (!foundTool) {
        throw("Have a fortune 3 tool in our inventory")
    }
}

function equipStick() {
    listStick = inv.findItem("minecraft:stick");
    if (listStick.length==0) {
        throw("Have a stick in our inventory")
    }
    inv.swapHotbar(listStick[0],8);
}

function correctPitch(pitch,pitchGoal){
    pitch += (pitchGoal - pitch) / 10
    Client.waitTick();
    p.interact();
    if (Math.abs(pitch - pitchGoal)>10){
        p.lookAt(dir*180-angle*(1-2*dir)-pitch*(1-2*dir), pitch); //Add the angle and a correction on the first crop
    } else {
        p.lookAt(dir*180-angle*(1-2*dir), pitch); //Add the angle and a correction based on the current pitch
    }
    return pitch
}

function farmLine() { // Farm a line
    walkTo(row+shift, zSouth*dir+zNorth*(1-dir)); //
    lineFinished=false;
    pitch = 90
    justStarted = true;
    while (!lineFinished ) {
        p.interact();
        Client.waitTick();

        while (Math.abs(pitch - pitchGoal)>5 ) { //Wait until you are at almost the pitch
            pitch = correctPitch(pitch,pitchGoal);
        }
        KeyBind.keyBind("key.forward", true); //You to move forward a bit if you just started
        if (justStarted){
            Client.waitTick(3);
            justStarted = false;
        }
        if (p.distanceTo(row+0.5+shift,p.getY(),p.getZ())>0.2){ //If you move sideway too much, go back to the middle
            if (dir==1){ //You are going north, so you need to go more to the left
                KeyBind.keyBind("key.left", true);
            } else {
                KeyBind.keyBind("key.right", true);
            }
        
        } else {
            KeyBind.keyBind("key.right", false);
            KeyBind.keyBind("key.left", false);
        }
        if (dir==1) {
            if ((Math.floor(p.getZ()) < zNorth + 3)) {
                lineFinished=true;
            }
        } else {
            if ((Math.floor(p.getZ()) > zSouth - 3 )) {
                lineFinished=true;
            }
        }
    }
    KeyBind.keyBind("key.right", false);
    KeyBind.keyBind("key.left", false);
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(lagTick);
}

function farmTwoLine() { //Farm two line
    farmLine();
    row++;
    dir = 1-dir;
    farmLine();
    row++;
    dir = 1-dir;
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

    const inv = Player.openInventory();
    const slots = inv.getSlots('main', 'hotbar', 'offhand');
    // Put the potatoes in the chest
    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item === "minecraft:carrot") {
            inv.quick(slot);
            Client.waitTick();
            
        }
    }
    Player.openInventory().close();
    Client.waitTick(lagTick);
    lookAtCenter(xFurnaceCompactor,zFurnaceCompactor);
    inv.setSelectedHotbarSlotIndex(8);
    Client.waitTick(lagTick);
    p.attack();
    Client.waitTick(lagTick);
    inv.setSelectedHotbarSlotIndex(0);
}
function farmMain() { // Main farming functions
    row = Math.floor(p.getX()-1);
    if (row != xWest) {
        Chat.log("Resuming at "+ (row-xWest)+"th row")
    }
    inv.setSelectedHotbarSlotIndex(0);
    while (row <= xEast) {
        timeRemaining = Math.floor((xEast-row+1)*timePerRow);//Count the time to harvest the rows and add the time to go to the compactor
        Chat.log((xEast-row+1) +" row remainings");
        Chat.log("Time remaining : "+ Math.floor(timeRemaining/60)+ " minutes and "+(timeRemaining%60)+" seconds");
        farmTwoLine();
    }   
}

function finishFarm() {
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. It'll be ready again in "+regrowTime+" hours. Now logging out") 
    Chat.say("/logout")
}

function start(){
    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());
    currentCompact = 0;
    //First check the position
    if ((xWest<=currentX)&&(currentX<=xEast)&&(zNorth<=currentZ)&&(currentZ<=zSouth)) { // Check if you are inside the farm
        equipTool();
        equipStick();
        farmMain();
        finishFarm();
     }else {
        Chat.log("You are not in the farm, cannot proceed");
    }
}

start();