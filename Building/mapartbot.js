/*
MAP ART SCHEMATIC AUTOMATION SCRIPT 

This script automates canvas patrolling, inventory refilling, and crash recovery for map art printing.

!!! IMPORTANT CONFIGURATION NOTES !!!

1. PRINTER RANGE: This script CANNOT change Litematica's printer range. 
   You must set the Printer Placement Range in your Litematica settings (usually 1 or 2 blocks) 
   to match the speed and placement stability needed.

2. PRINTER KEY: Change the LITEMATICA_PRINTER_KEY below to your actual keybind.
*/


// --- CONFIGURATION: MOVEMENT, RELOG, AND CHEST LOCATION ---

const lagTick = 9; // Delay ticks (adjust for your connection/lag)
const abortKey = "s"; // The key to press to stop the script

// --- LITEMATICA PRINTER SETTINGS ---
const LITEMATICA_PRINTER_KEY = "key.keyboard.p"; // <-- CHANGE THIS to your Litematica Printer Toggle Key!

// Canvas Patrol Boundaries (X and Z area the bot moves within)
const xEast = 4842;
const xWest = 4711;
const zNorth = -6729;
const zSouth = -6673;

// Movement Settings
const pitchGoal = 20; 
const lineCompact = 2; // Refill trigger: Check inventory every 2 rows

// Auto-Relog Settings 
const SERVER_IP_PORT = "play.civmc.net"; 
const SERVER_PORT = 25565; 
const RELOG_CHECK_TICKS = 100; // Ticks to wait after reconnection attempt before checking position

// Chest Location 
const CHEST_STAND_X = 4712; 
const CHEST_STAND_Z = -6708; 
const CHEST_BLOCK_X = 4710; 
const CHEST_BLOCK_Z = -6709; 
const CHEST_BASE_Y = 64; // **Y-coordinate of the BOTTOM chest block**
const CHEST_Y_OFFSETS = [0, 1, 2, 3]; 

// Inventory Goal (All 16 colors)
const CARPET_COLORS = [
    { id: "minecraft:white_carpet", goalCount: 128 },
    { id: "minecraft:orange_carpet", goalCount: 128 },
    { id: "minecraft:magenta_carpet", goalCount: 128 },
    { id: "minecraft:light_blue_carpet", goalCount: 128 },
    { id: "minecraft:yellow_carpet", goalCount: 128 },
    { id: "minecraft:lime_carpet", goalCount: 128 },
    { id: "minecraft:pink_carpet", goalCount: 128 },
    { id: "minecraft:gray_carpet", goalCount: 128 },
    { id: "minecraft:light_gray_carpet", goalCount: 128 },
    { id: "minecraft:cyan_carpet", goalCount: 128 },
    { id: "minecraft:purple_carpet", goalCount: 128 },
    { id: "minecraft:blue_carpet", goalCount: 128 },
    { id: "minecraft:brown_carpet", goalCount: 128 },
    { id: "minecraft:green_carpet", goalCount: 128 },
    { id: "minecraft:red_carpet", goalCount: 128 },
    { id: "minecraft:black_carpet", goalCount: 128 } // Change these according to the mapart schematic.
];


// --- CORE GLOBAL STATE (Persists across crashes/relogs) ---


const p = Player.getPlayer();
var currentDirection = 1; 
var currentX; 
var currentZ; 
var lineFinished;
var currentCompact; 
var shouldTerminate = false; 
var isResuming = false; 

function togglePrinter(state) {
    KeyBind.keyBind(LITEMATICA_PRINTER_KEY, state); 
}

function lookAtCenter(x, z) {
    p.lookAt(x + 0.5, p.getY() + 0.5, z + 0.5);
}

function lookAtChest(y) {
    p.lookAt(CHEST_BLOCK_X + 0.5, p.getY() + 0.5, CHEST_BLOCK_Z + 0.5);
}

function checkManualAbort() {
    if (KeyBind.getPressedKeys().contains("key.keyboard." + abortKey)) {
        shouldTerminate = true
        Chat.log("🚨 Player has pressed abort key ('" + abortKey.toUpperCase() + "'). Terminating script now. 🚨")
    }
}

function walkTo(x, z) {
    lookAtCenter(x, z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.2 || Math.abs(p.getZ() - z - 0.5) > 0.2) && !shouldTerminate) {
        lookAtCenter(x, z);
        Client.waitTick();
        checkManualAbort();
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(lagTick);
}

function farmLine() {
    
    // Skip the long walkTo if we are resuming mid-line
    if (!isResuming) {
        walkTo(currentX, zSouth * currentDirection + zNorth * (1 - currentDirection));
    }
    isResuming = false; 
    
    if (shouldTerminate) return;

    lineFinished = false;
    let pitch = 90;
    const tapDuration = 4; 
    const tapWait = 5;     

    while (!lineFinished && !shouldTerminate) {
        
        // --- CRITICAL STATE SAVING ---
        currentZ = p.getZ(); 
        // -----------------------------
        
        Client.waitTick();
        checkManualAbort();
        if (shouldTerminate) break;

        while (Math.abs(pitch - pitchGoal) > 5 && !shouldTerminate) {
            pitch += (pitchGoal - pitch) / 10
            Client.waitTick();
            p.lookAt(currentDirection * 180, pitch);
            checkManualAbort();
        }

        if (shouldTerminate) break;

        // Walk Tapping Logic (W key)
        KeyBind.keyBind("key.forward", true);
        Client.waitTick(tapDuration);

        KeyBind.keyBind("key.forward", false);
        Client.waitTick(tapWait);

        // Check if line end reached
        if (currentDirection == 1) { 
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

function farmTwoLine() { 
    farmLine();
    if (shouldTerminate) return;

    currentX++;
    currentDirection = 1 - currentDirection;
    farmLine();
    if (shouldTerminate) return;

    currentX++;
    currentDirection = 1 - currentDirection;
    currentCompact += 2;

    if (currentCompact >= lineCompact) {
        refillMain(); 
        if (shouldTerminate) return;
        currentCompact = 0;
    }
}

function farmMain() { 
    // Chat.log is suppressed here for clean running
    while (currentX <= xEast && !shouldTerminate) {
        farmTwoLine();
        Client.waitTick(lagTick * 2); 
    }
}

function getPlayerItemCount(itemId) {
    const slots = Player.openInventory().getSlots('main', 'hotbar');
    let count = 0;
    for (const slot of slots) {
        const item = Player.openInventory().getSlot(slot);
        if (item && item.getItemId() === itemId) {
            count += item.getCount();
        }
    }
    return count;
}

function checkInventoryDeficit() {
    const deficitList = [];
    for (const itemData of CARPET_COLORS) {
        const currentCount = getPlayerItemCount(itemData.id);
        const required = itemData.goalCount - currentCount;
        if (required > 0) {
            deficitList.push({ id: itemData.id, required: required });
        }
        checkManualAbort();
        if (shouldTerminate) break;
    }
    return deficitList;
}

function refillFromChest(deficitList) {
    if (deficitList.length === 0) return;

    walkTo(CHEST_STAND_X, CHEST_STAND_Z);
    if (shouldTerminate) return;

    Chat.log("[REFILL] Starting transfer from chests.");

    for (const y_offset of CHEST_Y_OFFSETS) {
        const current_chest_y = CHEST_BASE_Y + y_offset;
        
        lookAtChest(current_chest_y); 
        Client.waitTick(lagTick);
        p.interact(); 
        Client.waitTick(lagTick * 2);

        const chestInv = Player.openInventory();
        if (!chestInv || !chestInv.getName().includes("Chest")) {
            continue; 
        }

        let needs_refill = false;
        for (const deficit of deficitList) { if (deficit.required > 0) { needs_refill = true; break; } }
        if (!needs_refill) { Player.openInventory().close(); break; }

        const chestSlots = chestInv.getSlots('container');
        
        for (let i = 0; i < deficitList.length; i++) {
            let deficit = deficitList[i];
            if (deficit.required <= 0) continue; 

            let needed = deficit.required;

            for (const slot of chestSlots) {
                const item = chestInv.getSlot(slot);
                if (item && item.getItemId() === deficit.id) {
                    const countInSlot = item.getCount();
                    const transferAmount = Math.min(needed, countInSlot);
                    
                    for (let j = 0; j < Math.ceil(transferAmount / 64); j++) {
                        chestInv.quick(slot);
                        Client.waitTick(lagTick / 2);
                        checkManualAbort();
                        if (shouldTerminate) break;
                    }

                    needed -= transferAmount;
                    deficitList[i].required = needed; 

                    if (needed <= 0) { break; }
                }
                if (shouldTerminate) break;
            }
            if (shouldTerminate) break;
        }

        Player.openInventory().close();
        Client.waitTick(lagTick);
        if (shouldTerminate) break;
    }
}

function refillMain() {
    let deficitList = checkInventoryDeficit();
    if (shouldTerminate) return;

    if (deficitList.length > 0) {
        refillFromChest(deficitList);
    }
}

function start() {
    currentCompact = 0;
    shouldTerminate = false;
    
    // --- INITIAL PRINTER ACTIVATION ---
    togglePrinter(true); 
    Client.waitTick(5);
    togglePrinter(false); 
    Chat.log(`[INFO] Printer toggled ON. Key: ${LITEMATICA_PRINTER_KEY}`);
    // ----------------------------------

    // Initial State Check/Reset
    if (currentX === undefined || currentX > xEast) {
        currentX = Math.floor(p.getX());
        currentDirection = 1;
        Chat.log(`[START] Starting new patrol cycle at X=${currentX}.`);
    } else {
        Chat.log(`[RESUME] Patrol resumed from last session.`);
        isResuming = true;
    }

    while (!shouldTerminate) {
        
        try {
            checkManualAbort();
            if (shouldTerminate) break;

            farmMain(); 

            if (!shouldTerminate) {
                Chat.log("[INFO] Patrol cycle finished. Checking refill.");
                currentCompact = lineCompact; 
                refillMain(); 
                
                currentX = xWest;
                currentDirection = 1; 
                Chat.log("[INFO] Restarting patrol cycle.");
            }

        } catch (e) {
            
            Chat.log("🔴 DISCONNECTED. Attempting reconnection...");
            KeyBind.keyBind("key.forward", false); 

            Client.waitTick(100); // Wait 5 seconds before attempting relog

            while (true) {
                checkManualAbort();
                if (shouldTerminate) break;
                
                World.connect(SERVER_IP_PORT, SERVER_PORT); 
                
                Client.waitTick(RELOG_CHECK_TICKS);

                try {
                    p.getX(); 
                    
                    // --- PRINTER ACTIVATION AFTER RELOG ---
                    Client.waitTick(10); 
                    togglePrinter(true); 
                    Client.waitTick(5);
                    togglePrinter(false); 
                    // --------------------------------------
                    
                    isResuming = true; 
                    Chat.log(`✅ RECONNECTED. Resuming patrol.`);
                    break; 

                } catch (relogError) {
                    Chat.log("Retry connection...");
                }
            }
        }
    }

    // --- FINAL ACTIONS ---
    togglePrinter(true); // Ensure it's off if running
    Client.waitTick(5);
    togglePrinter(false);

    if (shouldTerminate) {
        Chat.log("🚨 SCRIPT ABORTED. Final position saved (X=" + currentX + ", Z=" + currentZ + ").");
    } else {
        Chat.log("Script finished."); 
    }
}

start();
