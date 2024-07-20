/*
Script to harvest a square potato field, and compact the result. You might need to adjust const and compactor placement to be able to use it.
V1.0 by arthirob 07/07/2024

Definitions : A line is a line of melon
A plot is 2 line of melon
A side is all the plot in the same side
This farm is harvested, starting from the south of the west side, going north, then south of the east side, going north

Things to improve
*/

// Constant and variable declaration

const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
const inv = Player.openInventory();

//Coords declaration
const xEast = 8508;
const xWest = 8249;
const zNorth = -2736;
const zSouth = -2609;
const centerRow = 8377;
const centerRowWidth = 4;
const xFrontCompactor = 8381;
const zFrontCompactor = -2673; // Those two is where you stand. Two blocks away from the compactor is probably the best idea
const xChestCompactor = 8383
const zChestCompactor = -2673
const xFurnaceCompactor = 8383
const zFurnaceCompactor = -2671
const xCompactorLodeStone = 8379
const zCompactorLodeStone = -2673


//Misc declaration
const compactEveryPlot = 6; // The amount of plot you do before compacting
const lagTick = 12; //Add a little bit of delay when using the lodestone. With better internet, reduce this number to 6 approx
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
const damageTreshhold=20; //The damage at which you want to stop using your tool




var dir  ; // 0 for going west, 1 for going east
var side ; // 0 for west side, 1 for east side
var plotCount; // The number of plot harvested since last count
var currentPlot; // The plot you are currently farming
var pitch; //The angle at which you are cutting
var breakTime=6; //The break time of a melon

const startTime = Date.now();


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
    Client.waitTick(10);
    
}

function disableCtb() {
    Chat.say("/ctb");
    Client.waitTick(10);
    var textis = Chat.getHistory().getRecvLine(0).getText().getString();
    if (Chat.getHistory().getRecvLine(0).getText().getString() == "Bypass mode has been enabled. You will be able to break reinforced blocks if you are on the group.") { // You hav ctb activating
        Chat.say("/ctb");
    }
}

function toolSwitch() { // Function to equip a tool with the silk touch enchant
    const toolList = inv.findItem("minecraft:diamond_axe").concat(inv.findItem("minecraft:netherite_axe"))
    var usableSlot = 0;
    for (i=0;i<toolList.length;i++) { // This needs to be correct as well, it's not really efficient to check all tools
        if (((inv.getSlot(toolList[i]).getMaxDamage()-inv.getSlot(toolList[i]).getDamage())>=damageTreshhold)&&(inv.getSlot(toolList[i]).hasEnchantment("silk_touch"))) {// The tool has health remaining
            usableSlot = toolList[i];
        }
    }
    if (usableSlot==0) {
        throw("No more tools to use")
    }
    inv.swapHotbar(usableSlot,0);
    inv.setSelectedHotbarSlotIndex(0);
}

function equipStick() { // Equip a stick in the 9th slot
    listStick = inv.findItem("minecraft:stick");
    if (listStick.length==0) {
        throw("Have a stick in our inventory")
    }
    inv.swapHotbar(listStick[0],8);
}

function eat() {
    if (p.getFoodLevel()<16) {
        const foodList = inv.findItem(foodType);
        if (foodList.length==0) {
            throw("Out of food")
        }
        inv.swapHotbar(foodList[0],2);
        KeyBind.keyBind("key.use", true);
        inv.setSelectedHotbarSlotIndex(2);
        do {
            Client.waitTick(10);
        } while (p.getFoodLevel()<16)
        inv.setSelectedHotbarSlotIndex(0);
    }
}

function goFrontLine() { //Go in front of a line
    if ((side==0)&&(dir==0)) { // You are in the middle row, going west
        walkTo(centerRow,currentPlot-1);
    }
    if ((side==0)&&(dir==1)) { // You are at the end of a row, going east
        KeyBind.keyBind("key.attack", true);
        walkTo(xWest,currentPlot-2);
        KeyBind.keyBind("key.attack", false);
    }
    if ((side==1)&&(dir==0)) { // You are at the end of a row, going west
        KeyBind.keyBind("key.attack", true);
        walkTo(xEast,currentPlot-2);
        KeyBind.keyBind("key.attack", false);
    }
    if ((side==1)&&(dir==1)) { // You are in the middle row, going east
        walkTo(centerRow+(centerRowWidth-1),currentPlot-1);
    }
}

function harvestLine() { // Harvest a line of melon
    goFrontLine(); // Reach the front of the line
    p.lookAt(90+dir*180,28);
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(3*breakTime); //Break the first 3 melon to prevent block bumping
    KeyBind.keyBind("key.forward", true);
    p.lookAt(90+dir*180,18);
    Client.waitTick(10); //This allows to bot to enter a line and prevent instant stop
    while ((Math.floor(p.getX())!=centerRow)&&(Math.floor(p.getX())!=xWest)&&(Math.floor(p.getX())!=xEast)&&(Math.floor(p.getX())!=centerRow+(centerRowWidth-1))) {
        prevX = p.getX();
        Client.waitTick(2);
        if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
            toolSwitch();
        }
        if (Math.abs((p.getX()-prevX))<0.1) { // This allows to wait if you bump into a melon, to prevent lag
            KeyBind.keyBind("key.forward", false);
            p.lookAt(90+dir*180,28);
            Client.waitTick(breakTime);
            p.lookAt(90+dir*180,18);
            Client.waitTick(breakTime);
            KeyBind.keyBind("key.forward", true);
        }
    }
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.forward", false);
}

function harvestPlot() { //Harvest a plot of melon
    harvestLine();
    dir = 1-dir;
    harvestLine();
    plotCount++;
    eat();
}

function compact() { // Go to the compactor and compac !
    //Reach the underground compactor and open the door
    walkTo(xCompactorLodeStone,zCompactorLodeStone);
    KeyBind.keyBind("key.sneak", true);
    Client.waitTick(lagTick);
    KeyBind.keyBind("key.sneak", false);
    lookAtCenter(xCompactorLodeStone,zCompactorLodeStone);
    Client.waitTick(lagTick)
    im.interact();
    Client.waitTick(lagTick)
    walkTo(xFrontCompactor,zFrontCompactor);

    //Open the chest and empty your things
    lookAtCenter(xChestCompactor,zChestCompactor);
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);

    const inv = Player.openInventory();
    const slots = inv.getSlots('main', 'hotbar', 'offhand');

    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item == "minecraft:stone") {
            Client.waitTick(5);
            inv.quick(slot);
            Client.waitTick(5);
        }
    }

    Client.waitTick();
    Player.openInventory().close();
    inv.setSelectedHotbarSlotIndex(8);
    Client.waitTick(lagTick);
    lookAtCenter(xFurnaceCompactor-0.3,zFurnaceCompactor);
    p.attack();
    Client.waitTick(lagTick);
    inv.setSelectedHotbarSlotIndex(0);
    walkTo(xCompactorLodeStone,zCompactorLodeStone);
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(lagTick);
    KeyBind.keyBind("key.jump", false);
    plotCount=0;
}

function harvestSide() { // Harvest a full melon side
    while (currentPlot>zNorth) {
        harvestPlot();
        Chat.log("Harvesting a plot")
        if (plotCount>=compactEveryPlot) { // Go to the compactor if you harvested the good number of melon
            compact();
            plotCount = 0;
        }
        currentPlot-=4;
    }
    }

function harvestMain() { //
    while (side<=1) {
        harvestSide();
        side+=1;
        currentPlot=zSouth;
    }
}


function start(){
    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());

    //First check the position
    if ((xWest<=currentX)&&(currentX<=xEast)&&(zNorth<=currentZ)&&(currentZ<=zSouth)) { // Check if you are inside the farm
        if ((currentX==centerRow)||(currentX==centerRow+centerRowWidth-1)) { // Start in front of a plot
            toolSwitch();
            equipStick();
            if (currentX==centerRow) {
                side = 0;
                dir = 0;
            }
            if (currentX==centerRow+centerRowWidth-1) {
                side = 1;
                dir = 1;
            }
            currentPlot = currentZ-(currentZ+1)%4;
            disableCtb();
            harvestMain();
            Chat.log("Farm is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. Now logging out") 
            Chat.say("/logout")
        } else {
            Chat.log("Please, start in front of a plot, in the middle row")
        }
     }else{
        Chat.log("You are not in the farm, cannot proceed");
    }
}

start();