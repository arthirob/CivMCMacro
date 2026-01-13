// Script to Harvest a wheat farm and compact efficiently
// original script by arthirob edited by SUBLIME
// should have a stick in 9th slot and food in 8th
// your farm should be 3 blocks bigger than the out put you want 
//put the north(can also do south if no water stream) coordinate 1 block bigger than the actual farm there should be walkway at that block
// it yeets seeds only at south because i have a water stream at south which collects those seeds for bonemeal,you can comment that part out to make itbyeet seeds at end of row regardless of direction
const p = Player.getPlayer();
const inv = Player.openInventory();
const lagTick = 12; 
const abortKey = "s"; 

// Farm Borders 
const xEast = 7698; 
const xWest = 7566; 
const zNorth = -2277;
const zSouth = -2144;

// Compactor Placement
const xFrontCompactor = 7567;
const zFrontCompactor = -2276;
const xChestCompactor = 7568;
const zChestCompactor = -2278;
const xFurnaceCompactor = 7566;
const zFurnaceCompactor = -2278;

var dir = 0; 
var row;
var currentCompact = 0;
const lineCompact = 8; // no of lined to harvest before compacting
const pitchGoal = 14; 
var shouldTerminate = false;

// Misc
const discordGroup = 'maius-bots';
const farmName = 'wheatfarm-big';
const regrowTime = '16';

function checkManualAbort() {
    if (KeyBind.getPressedKeys().contains("key.keyboard." + abortKey)) {
        shouldTerminate = true;
        KeyBind.keyBind("key.forward", false);
        Chat.log("🚨 MANUAL ABORT: Script Terminated.");
    }
}

function eatwhenHungry() {
    if (shouldTerminate) return;
    if (p.getFoodLevel() <= 14) {
        const oldSlot = Player.openInventory().getSelectedHotbarSlotIndex();
        Player.openInventory().setSelectedHotbarSlotIndex(7); // Slot 8
        Client.waitTick(10);
        while (p.getFoodLevel() < 20 && !shouldTerminate) {
            KeyBind.keyBind("key.use", true);
            checkManualAbort();
            Client.waitTick(2);
        }
        KeyBind.keyBind("key.use", false);
        Player.openInventory().setSelectedHotbarSlotIndex(oldSlot);
        Client.waitTick(lagTick);
    }
}

function lookAtCenter(x, z) {
    p.lookAt(x + 0.5, p.getY() + 0.5, z + 0.5);
}

function walkTo(x, z) {
    lookAtCenter(x, z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.2 || Math.abs(p.getZ() - z - 0.5) > 0.2) && !shouldTerminate) {
        lookAtCenter(x, z);
        checkManualAbort();
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(lagTick);
}

function yeetSeeds() {
    if (shouldTerminate) return;
    if (Math.abs(p.getZ() - zSouth) < 2) { // can remove this if no waterstream to collect seeds
        p.lookAt(0, -25); 
        Client.waitTick(lagTick);
        const currentInv = Player.openInventory();
        const slots = currentInv.getSlots('main', 'hotbar', 'offhand');
        for (const slot of slots) {
            checkManualAbort();
            if (shouldTerminate) break;
            if (currentInv.getSlot(slot).getItemId() === "minecraft:wheat_seeds") {
                currentInv.dropSlot(slot, true);
                Client.waitTick(2); 
            }
        }
        Client.waitTick(lagTick);
    }
}

function farmLine() {
    if (shouldTerminate) return;
    let lineFinished = false;
    let tickCounter = 0;
    let pitch = 90; // can edit this as needed

    while (!lineFinished && !shouldTerminate) {
        checkManualAbort();
        p.interact(); 

        if (tickCounter % 4 < 2) { // can change this too according to need.
            KeyBind.keyBind("key.forward", true);
        } else {
            KeyBind.keyBind("key.forward", false);
            p.interact(); 
        }
        tickCounter++;

        if (Math.abs(pitch - pitchGoal) > 1) {
            pitch += (pitchGoal - pitch) / 5;
        }
        p.lookAt((dir === 0 ? 0 : 180), pitch);
        Client.waitTick();

        if (dir === 0) { 
            if (p.getZ() >= zSouth - 1) lineFinished = true;
        } else { 
            if (p.getZ() <= zNorth + 1) lineFinished = true;
        }
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(lagTick);
}

function compact() {
    if (shouldTerminate) return;
    walkTo(xFrontCompactor, zFrontCompactor);
    lookAtCenter(xChestCompactor, zChestCompactor);

    let attempts = 0;
    let chestOpen = false;
    while (attempts < 5 && !chestOpen && !shouldTerminate) {
        p.interact(); 
        Chat.log("Opening chest... (Attempt " + (attempts + 1) + ")");
        Client.waitTick(35); 
        if (Player.openInventory().getType() !== "container.inventory") { 
            chestOpen = true; 
        }
        attempts++;
    }

    if (chestOpen) {
        const chestInv = Player.openInventory();
        const slots = chestInv.getSlots('main', 'hotbar', 'offhand');
        for (const slot of slots) {
            checkManualAbort();
            if (shouldTerminate) break;
            if (chestInv.getSlot(slot).getItemId() === "minecraft:wheat") {
                chestInv.quick(slot);
                Client.waitTick(2); 
            }
        }
        chestInv.close();
        Client.waitTick(lagTick);
    }

    lookAtCenter(xFurnaceCompactor, zFurnaceCompactor);
    Player.openInventory().setSelectedHotbarSlotIndex(8); 
    Client.waitTick(15);
    p.attack(); 
    Client.waitTick(lagTick);
    Player.openInventory().setSelectedHotbarSlotIndex(0); 
}

function finishFarm() {
    if (!shouldTerminate) {
        Chat.log("✅ Full farm harvested.");
        World.playSound(p.getX(), p.getY(), p.getZ(), "random.orb", 1.0, 1.0); 
        Chat.say("/g " + discordGroup + " " + farmName + " is finished it will be ready again in " + regrowTime + " hours.");
        Chat.log("Logging out in 3 seconds...");
        Client.waitTick(60); 
        
        Chat.say("/logout");
    }
}

function start() {
    row = Math.floor(p.getX());

    // Main loop
    while (row >= xWest && !shouldTerminate) {
        eatwhenHungry(); 
        farmLine();   
        yeetSeeds();  

        row--; 
        dir = 1 - dir; 
        currentCompact++;
        if (row >= xWest && !shouldTerminate) {
            if (currentCompact >= lineCompact) {
                compact();
                currentCompact = 0;
                walkTo(row, (dir === 0) ? zNorth : zSouth); 
            } else {
                walkTo(row, p.getZ());
            }
        }
    }
    
    finishFarm();
}

start();


