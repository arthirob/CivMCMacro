/*
Script to harvest a square(not necessary) potato field, and compact the result.

V1.4 by Sublime - Updated for W key tapping logic and termination key.
V1.3 by arthirob 21/07/2024
*/

// Constant and variable declaration

const p = Player.getPlayer() ;
const inv = Player.openInventory();
const lagTick = 9; // Edit this depending on your internet connection
const abortKey = "s"; // The key to press to stop the script

// Farm border declaration
const xEast = 4842;
const xWest = 4711;
const zNorth = -6729;
const zSouth = -6673;


//Compactor placement declaration
const xFrontCompactor = 4712;
const zFrontCompactor = -6708; // Those two is where you stand. Two blocks away from the compactor is probably the best idea
const xChestCompactor = 4710
const zChestCompactor = -6709
const xFurnaceCompactor = 4710
const zFurnaceCompactor = -6707

//JS Macro stuff used during the execution
var dir = 1 ;//The direction you are going. 1 for north, 0 for south. Edit here to change the start value
var row ; // The current row you are in
var timeRemaining ; //The time remaining in the farm approximately
var lineFinished; // The boolean to check if a line is finished

//Misc declaration
const discordGroup = 'maius-bots';
const farmName = "Potato farm at Avena"
const regrowTime = 32;
const pitchGoal = 20    ; //The pitch you want to reach
const lineCompact = 4; //The number of line you want to make before compating
var currentCompact ; //Track how many line you did since last compact
var shouldTerminate = false; // Flag to track manual abort!

const timePerRow = ((zSouth-zNorth)/4.31) + 3 ; // Count the time to harvest a row and the wait ticks
const startTime = Date.now();


function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function checkManualAbort() { // Function to check if the abort key is pressed
    if (KeyBind.getPressedKeys().contains("key.keyboard." + abortKey)) {
        shouldTerminate = true
        Chat.log("🚨 Player has pressed abort key ('" + abortKey.toUpperCase() + "'). Terminating script now. 🚨")
    }
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.2 || Math.abs(p.getZ() - z - 0.5 ) > 0.2) && !shouldTerminate){
        lookAtCenter(x,z);// Allow trajectory correction
        Client.waitTick();
        checkManualAbort(); // Check abort while walking too
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(lagTick);
    
}

function equipTool() { // Function to equip a tool with the fortune effect
    var foundTool = false;
    let i = 9;
    while ((i < 45)&&(!foundTool)){
        if (inv.getSlot(i).hasEnchantment("fortune")) {
            // Note: If slot is null or enchantment is incorrectly cased ("Fortune" vs "fortune"), this line may throw a Null error.
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
// --------------------------------------------------------

function equiStick() {
    listStick = inv.findItem("minecraft:stick");
    if (listStick.length==0) {
        throw("Have a stick in our inventory")
    }
    inv.swapHotbar(listStick[0],8);
    if (shouldTerminate) throw("Aborted during stick equip.");
}


function farmLine() { // Farm a line
    walkTo(row, zSouth * dir + zNorth * (1 - dir));
    if (shouldTerminate) return; // Exit if aborted while walking

    lineFinished = false;
    pitch = 90;
    
    const tapDuration = 4; // Ticks to hold the key down (Press duration)
    const tapWait = 5;     // Ticks to wait after releasing the key (Idle duration)

    while (!lineFinished && !shouldTerminate) { 
        Client.waitTick();
        checkManualAbort(); 
        if (shouldTerminate) break;
        
        p.interact();
        while (Math.abs(pitch - pitchGoal) > 5 && !shouldTerminate) { 
            pitch += (pitchGoal - pitch) / 10
            Client.waitTick();
            p.interact();
            p.lookAt(dir * 180, pitch);
            
            checkManualAbort(); 
        }
        
        if (shouldTerminate) break; 
        
        KeyBind.keyBind("key.forward", true); 
        Client.waitTick(tapDuration);
        
        KeyBind.keyBind("key.forward", false); 
        Client.waitTick(tapWait); 
        
        if (dir == 1) { 
            if ((Math.floor(p.getZ()) < zNorth + 4)) {
                lineFinished = true;
            }
        } else { 
            if ((Math.floor(p.getZ()) > zSouth - 4)) {
                lineFinished = true;
            }
        }
    }
    
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(lagTick);
}

function farmTwoLine() { //Farm two line
    farmLine();
    if (shouldTerminate) return; 

    row++;
    dir = 1-dir;
    farmLine();
    if (shouldTerminate) return; 

    row++;
    dir = 1-dir;
    currentCompact+=2 ;
    if (currentCompact>=lineCompact) {
        compact();
        if (shouldTerminate) return; 
        currentCompact = 0;
    }
}

function compact() { //Go to the compactor, put things in the chest and hit the furnace with the stick
    walkTo(xFrontCompactor,zFrontCompactor );
    if (shouldTerminate) return; // Exit if aborted while walking

    lookAtCenter(xChestCompactor,zChestCompactor); //Open the chest
    Client.waitTick(lagTick);
    p.interact(); // Right-click to open chest
    Client.waitTick(lagTick);

    const inv = Player.openInventory();
    const slots = inv.getSlots('main', 'hotbar', 'offhand');
    // Put the potatoes in the chest
    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item === "minecraft:wheat") {
            inv.quick(slot);
            Client.waitTick();
            checkManualAbort(); // Check while transferring items
            if (shouldTerminate) break; 
        }
    }
    Player.openInventory().close();
    
    Client.waitTick(lagTick * 3); 
    checkManualAbort(); if (shouldTerminate) return;

    lookAtCenter(xFurnaceCompactor,zFurnaceCompactor);
    inv.setSelectedHotbarSlotIndex(8); // Select the stick
    
    Client.waitTick(lagTick * 2 + 1); 
    checkManualAbort(); if (shouldTerminate) return;

    p.attack(); // The intended activation click (Left Click)
    Client.waitTick(lagTick);
    inv.setSelectedHotbarSlotIndex(0);
}
// --------------------------------------------------------

function farmMain() { // Main farming functions
    row = Math.floor(p.getX());
    if (row != xWest) {
        Chat.log("Resuming at "+ (row-xWest)+"th row")
    }
    inv.setSelectedHotbarSlotIndex(0);
    while (row <= xEast && !shouldTerminate) { 
        timeRemaining = Math.floor((xEast-row+1)*timePerRow);
        Chat.log((xEast-row+1) +" row remainings");
        Chat.log("Time remaining : "+ Math.floor(timeRemaining/60)+ " minutes and "+(timeRemaining%60)+" seconds");
        
        farmTwoLine();
    }   
}
function yeetSeeds() {
    p.lookAt(90,0);
    const slots = inv.getSlots('main', 'hotbar', 'offhand');
    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item === "minecraft:wheat_seeds") {
            inv.dropSlot(slot,true);
            Client.waitTick();
        }
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
    shouldTerminate = false; 
    
    if ((xWest<=currentX)&&(currentX<=xEast)&&(zNorth<=currentZ)&&(currentZ<=zSouth)) { 
        try {
            equipTool();
            equiStick();
            
            checkManualAbort();
            if (shouldTerminate) throw new Error("Aborted before farming started.");

            farmMain();
            
            if (!shouldTerminate) { 
                finishFarm();
            } else {
                Chat.log("Script aborted by user. Please manually check player position and items.");
            }
        } catch (e) {
            Chat.log("Script terminated: " + e.message);
            KeyBind.keyBind("key.forward", false); 
        }
     }else {
        Chat.log("You are not in the farm, cannot proceed");
    }
}

start();
