/*
Script to harvest a kelp field, and compact the result. You might need to adjust const and compactor placement to be able to use it.
V1.0 by arthirob 01/08/2024

Things to improve
*/

// Constant and variable declaration

const p = Player.getPlayer() ;
const lagTick = 4; // Edit this depending on your internet connection
const inv = Player.openInventory();


// Farm border declaration (no border no nation tho')
const xEast = 6670;
const xWest = 6635;
const zNorth = -5631;
const zSouth = -5616;

//Compactor placement declaration
const xFrontCompactor = 6633;
const zFrontCompactor = -5622; // Those two is where you stand. Two blocks away from the compactor is probably the best idea
const xChest1 = 6631;
const zChest1 = -5621;
const xChest2 = 6632;
const zChest2 = -5622;
const xChest3 = 6631;
const zChest3 = -5622;
const xFurnaceCompactor = 6631;
const zFurnaceCompactor = -5623;

//Misc declaration
const discordGroup = 'FU-Bot';
const farmName = "Kelp farm south of Moscow"
const regrowTime = 8;
const lineCompact = 2; //The number of line you want to make before compating
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !


var currentCompact ; //Track how many line you did since last compact
var plotLeft;
var currentPlot;
var currentTrap;
const plotWidth = 4;
const trapMargin = 2; //Reduce by one to avoid falling in water with the speed
const trapdoorDist = 2;
var effectMap ;
var gotBuff;
var speedPotAvailable;
var compactorOn;
var lastCompact;
var currentChest;
const startTime = Date.now();

function equipStick() { // Equip a stick in the 9th slot
    listStick = inv.findItem("minecraft:stick");
    if (listStick.length==0) {
        throw("Have a stick in our inventory")
    }
    inv.swapHotbar(listStick[0],8);
}

function checkSpeed() {
    gotBuff = false;
    effectMap = p.getStatusEffects();
    for (let i=0;i<effectMap.length;i++) {
        if (effectMap[i].getId()=="minecraft:speed") {
            gotBuff=true;
        }
    }
    return gotBuff;
}

function refreshSpeed() {
    const potList = inv.findItem("minecraft:potion")
    if (potList.length==0) {
        Chat.log("You are out of speed pots");  
        speedPotAvailable = false;
    } else {
        speedPotAvailable = true;
        inv.swapHotbar(potList[0],7)
        inv.setSelectedHotbarSlotIndex(7);
        KeyBind.keyBind("key.use", true);
        while (!checkSpeed()) {
            Client.waitTick();
        }
        KeyBind.keyBind("key.use", false);
        inv.setSelectedHotbarSlotIndex(0);
        
    }
}

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.2 || Math.abs(p.getZ() - z - 0.5 ) > 0.2)){
        lookAtCenter(x,z);// Allow trajectory correction
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(lagTick);
    
}

function walkPreciseTo(x, z) { // Walk to the center of a block, slow down at the end
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.2 || Math.abs(p.getZ() - z - 0.5 ) > 0.2)){
        if ((Math.abs(p.getX() - x - 0.5) < 1 && Math.abs(p.getZ() - z - 0.5 ) < 1)) {
            KeyBind.keyBind("key.sneak", true);
        }
        lookAtCenter(x,z);// Allow trajectory correction
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(lagTick);
    
}


function equiStick() {
    listStick = inv.findItem("minecraft:stick");
    if (listStick.length==0) {
        throw("Have a stick in our inventory")
    }
    inv.swapHotbar(listStick[0],8);
}

function chestFull(inv) {
    const size = inv.getTotalSlots();
    for (let i = 0; i < size - 36; i++) {
         if (inv.getSlot(i).isEmpty()) {
             return false;
         }
    }
    return true;
}

function emptyInv(chest) { //Empty your inv in the chest specific number
    if (chest==1) {
        p.lookAt(xChest1+0.5,p.getY()+0.75,zChest1+0.5);
    }
    if (chest==2) {
        p.lookAt(xChest2+0.5,p.getY()+0.5,zChest2+0.5);
    }
    if (chest==3) {
        p.lookAt(xChest3+0.5,p.getY()+1.5,zChest3+0.5);
    }
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);

    const inv = Player.openInventory();
    const slots = inv.getSlots('main', 'hotbar', 'offhand');

    // Put the kelp in the chest
    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item === "minecraft:kelp") {
                inv.quick(slot);
                Client.waitTick();
            }
        }
    Player.openInventory().close();
    Client.waitTick(lagTick);

}

function compact() { //Go to the compactor, put things in the chest and hit the furnace with the stick
    walkPreciseTo(xFrontCompactor,zFrontCompactor );
    emptyInv(currentChest);
    if (inv.findItem("minecraft:kelp").length>0) { //If you stil have kelp in your inventory, change chest
        currentChest = (currentChest%3)+1
        emptyInv(currentChest);
    }
    if (!compactorOn) {
        lookAtCenter(xFurnaceCompactor,zFurnaceCompactor);
        inv.setSelectedHotbarSlotIndex(8);
        Client.waitTick(lagTick);
        p.attack();
        Client.waitTick(lagTick);
        inv.setSelectedHotbarSlotIndex(0);
        compactorOn = true
    }
}

function eat() {
    if (p.getFoodLevel()<19) {
        const foodList = inv.findItem(foodType);
        if (foodList.length==0) {
            throw("Out of food")
        }
        inv.swapHotbar(foodList[0],2);
        KeyBind.keyBind("key.use", true);
        inv.setSelectedHotbarSlotIndex(2);
        do {
            Client.waitTick(10);
        } while (p.getFoodLevel()<19)
        KeyBind.keyBind("key.use", false);
        inv.setSelectedHotbarSlotIndex(0);
    }
}

function doingLine() { // Return true if you are still cutting line, false if not
    if (dir==1) {
        return (Math.floor(p.getX())<=(xEast-1))
    } else {
        return (Math.floor(p.getX())>=(xWest+1))
    }
}

function cutLine() { //Cut one lines of kelp
    p.lookAt(0,0)
    KeyBind.keyBind("key.attack", true);
    Client.waitTick();
    if (dir==1) {
        KeyBind.keyBind("key.left", true);
    } else {
        KeyBind.keyBind("key.right", true);
    }
    while (doingLine()) {
        Client.waitTick();
    }
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.left", false);
    KeyBind.keyBind("key.right", false);
}

function cutKelp() { //Cut all the kelp
    currentPlot = zNorth;
    plotLeft = true;
    while (plotLeft) {
        dir = 1;
        walkTo(xWest+1,currentPlot)
        cutLine();
        currentPlot+=plotWidth;
        walkTo(xEast,currentPlot);
        walkTo(xEast-1,currentPlot);
        dir = -1 ;
        cutLine();
        currentPlot+=plotWidth;
        if (!checkSpeed()) {
            refreshSpeed();
        }
        eat();
        if (currentPlot>zSouth) {
            plotLeft=false
        } else {
            walkTo(xWest,currentPlot);
        }
    }
}

function harvestTwoLine() {
    KeyBind.keyBind("key.sprint", true);
    walkPreciseTo(xWest-trapMargin,currentTrap);
    p.lookAt(-90,0);
    eat();
    walkPreciseTo(xEast+trapMargin,currentTrap);
    currentTrap+=trapdoorDist;
    walkPreciseTo(xEast+trapMargin,currentTrap);
    walkPreciseTo(xWest-trapMargin,currentTrap);
    currentTrap+=trapdoorDist;
    KeyBind.keyBind("key.sprint", false);
    compact();
}

function harvestKelp() { //Harvest and compact the kelp
    currentTrap = zNorth-trapdoorDist ;
    while (currentTrap<(zSouth+2*trapdoorDist)) {
        harvestTwoLine();
    }
}

function farmMain() {
    cutKelp(); // Cut the kelp
    walkTo(xWest,zNorth); //Go upstairs
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(3);
    KeyBind.keyBind("key.jump", false);
    walkTo(xWest-trapdoorDist,zNorth);
    walkTo(xWest-trapdoorDist,zNorth-trapdoorDist);
    compactorOn = false ;
    currentChest = 1;
    harvestKelp();
    harvestKelp(); //Do it two times so it can take what was left
}

function finishFarm() {
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. It'll be ready again in "+regrowTime+" hours. Now logging out") 
    Chat.say("/logout")
}

function start() {
    //First check the position
    //Chat.log("X is "+);
    if (((Math.floor(p.getX())==xWest))&&((Math.floor(p.getZ())==zNorth))) { // Check if you are inside the farm
        equipStick();
        eat();
        refreshSpeed();
        farmMain();
        finishFarm();
     } else {
        Chat.log("Please, start in the lodestone")
    }
}

start();