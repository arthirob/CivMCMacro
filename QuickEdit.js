/*
Script to harvest a square potato field, and compact the result. You might need to adjust const and compactor placement to be able to use it.
V1.3 by arthirob 07/07/2024

Things to improve
*/

// Constant and variable declaration

const p = Player.getPlayer() ;
const inv = Player.openInventory();

const xEast = 5776;
const xWest = 5697;
const zNorth = -7343;
const zSouth = -7138;

const xCompactor = 5719
const zCompactor = -7137

const timePerRow = ((zSouth-zNorth)/4.31) + 3 ; // Count the time to harvest a row and the wait ticks
const startTime = Date.now();


function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.2 || Math.abs(p.getZ() - z - 0.5 ) > 0.2)){
        lookAtCenter(x,z);// Allow trajectory correction
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(10);
    
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

function equiStick() {
    listStick = inv.findItem("minecraft:stick");
    if (listStick.length==0) {
        throw("Have a stick in our inventory")
    }
    inv.swapHotbar(listStick[0],8);
}

function farmLine(dir) { // Farm a line to the north, or to the south. This needs to be corrected, but I don't know how
    pitch = 90
    KeyBind.keyBind("key.forward", true);
    if (dir==180) { // It'd be cool to regroup the two while in a single one, but my dumbass can't find how
        while ((Math.floor(p.getZ()) >= zNorth + 4) ) {
            p.lookAt(dir, pitch);
            p.interact();
            Client.waitTick();
            if (pitch != 19) {
                pitch += (19 - pitch) / 25
            }
        }
    } else {
        while ((Math.floor(p.getZ()) <= zSouth - 3 ) ) {
            p.lookAt(dir, pitch);
            p.interact();
            Client.waitTick();
            if (pitch != 19) {
                pitch += (19 - pitch) / 25
            }
        }
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(10);
}


function farmMain() { // Main farming functions
    var row = Math.floor(p.getX());
    if (row != xWest) {
        Chat.log("Resuming at "+ (row-xWest)+"th row")
    }
    while (row <= xEast) {
        walkTo(row, zSouth)
        var rowRemaining = xEast-row+1;
        var timeRemaining = Math.floor(rowRemaining*timePerRow);//Count the time to harvest the rows and add the time to go to the compactor
        Chat.log(rowRemaining +" row remainings");
        Chat.log("Time remaining : "+ Math.floor(timeRemaining/60)+ " minutes and "+(timeRemaining%60)+" seconds");
        
        // Select slot 1
        inv.setSelectedHotbarSlotIndex(0);
                            
        // Collect potatoes towards the north first
        farmLine(180);

        // Change row
        row += 1;
        walkTo(row, zNorth);

        // Collect potatoes towards the south then
        farmLine(0);

        // Change row
        row += 1;

        // Go back to the compactor
        walkTo(xCompactor,zCompactor );

        // Look at the chest and open it
        p.lookAt(-65, 25);
        Client.waitTick(5);
        p.interact();
        Client.waitTick(5);

        const inv = Player.openInventory();
        const slots = inv.getSlots('main', 'hotbar', 'offhand');
        // Put the potatoes in the chest
        for (const slot of slots) {
            const item = inv.getSlot(slot).getItemId();
            if (item === "minecraft:potato" || item === "minecraft:poisonous_potato") {
                Client.waitTick();
                inv.quick(slot);
                
            }
        }
        Client.waitTick();
        Player.openInventory().close(); 

        // Look at the furnace and hit it
        p.lookAt(60,30);
        inv.setSelectedHotbarSlotIndex(8);
        Client.waitTick(10);
        KeyBind.keyBind("key.attack", true);
        Client.waitTick(3);
        KeyBind.keyBind("key.attack", false);
        Client.waitTick(5);

        inv.setSelectedHotbarSlotIndex(0);
    }
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.log("Farm is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. Now logging out")
    Chat.say("/logout")    
}


function start(){
    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());

    //First check the position
    if ((xWest<=currentX)&&(currentX<=xEast)&&(zNorth<=currentZ)&&(currentZ<=zSouth)) { // Check if you are inside the farm
        equipTool();
        equiStick();
        farmMain();
        Chat.log("Job is finished. Now logging logging out.");
        Chat.say("/logout")
     }else {
        Chat.log("You are not in the farm, cannot proceed");
    }
}

start();


