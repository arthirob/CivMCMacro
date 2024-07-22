/*
Script to harvest a square potato field, and compact the result. You might need to adjust const and compactor placement to be able to use it.
V1.1 by arthirob 21/07/2024

Definitions : A line is a line of melon
A plot is 2 line of melon
A side is all the plot in the same side
This farm is harvested, starting from the south of the west side, going north, then south of the east side, going north

Things to improve
Put food in the 3rd slot
Correct the go to haste function
Auto redrink potion
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
const xEastBeacon = 8429;
const zEastBeacon = -2660;
const xWestBeacon = 8326;
const zWestBeacon = -2660;
const beaconRange = 45;


//Misc declaration
const compactEveryPlot = 4; // The amount of plot you do before compacting
const lagTick = 4; //Add a little bit of delay when using the lodestone. With better internet, reduce this number to 6 approx
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
const damageTreshhold=20; //The damage at which you want to stop using your tool
const discordGroup = 'FU-Bot';
const farmName = "Melon farm in exyria"
const regrowTime = 27;
const pitchValue = 10;

var dir  ; // 0 for going west, 1 for going east
var side ; // 0 for west side, 1 for east side
var plotCount; // The number of plot harvested since last count
var currentPlot; // The plot you are currently farming
var currentX ;
var currentZ ;
var pitch; //The angle at which you are cutting
var breakTime=1; //The break time of a melon
var effectMap ;
var gotBuff;
var speedPotAvailable;

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
    Client.waitTick(lagTick);
    
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
        inv.setSelectedHotbarSlotIndex(0);
    }
}

function checkHaste() { //Function that return a bool if you have the haste debuff
    gotBuff = false;
    effectMap = p.getStatusEffects();
    for (let i=0;i<effectMap.length;i++) {
        if ((effectMap[i].getId()=="minecraft:haste")&&(effectMap[i].getStrength()==1)) {
            gotBuff=true;
        }
    }
    return gotBuff;
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

function refreshHaste() { //Refresh the haste debuff, only if you are in the northern part, in the range  of the farm
    if (currentPlot<zWestBeacon-beaconRange) {
        KeyBind.keyBind("key.attack", false);
        currentX = p.getX();
        currentZ = p.getZ();
        if (side==0) {
            if (currentX<xWestBeacon-beaconRange) {
                p.lookAt(xWestBeacon-beaconRange,p.getY(),zWestBeacon-beaconRange);
            } else {
                p.lookAt(xWestBeacon,p.getY(),zWestBeacon);
            }
        } else {
            if (currentX>xEastBeacon+beaconRange) {
                p.lookAt(xEastBeacon+beaconRange,p.getY(),zWestBeacon-beaconRange);
            } else {
                p.lookAt(xEastBeacon,p.getY(),zEastBeacon);
            }
        }
        KeyBind.keyBind("key.forward", true);
        toogleSprint();
        while (p.getZ()<zWestBeacon-beaconRange) {
            Client.waitTick();
        }
        KeyBind.keyBind("key.forward", false);
        eat();
        while (!checkHaste()) {
            Client.waitTick();
        }
        while ((Math.abs(p.getX()-currentX) > 0.2 || Math.abs(p.getZ()-currentZ) > 0.2)) {
            KeyBind.keyBind("key.sprint", true);
            walkTo(currentX-0.5,currentZ-0.5);
        }
    }
}

function goFrontLine() { //Go in front of a line, and attack to clear melon that might be there
    if ((side==0)&&(dir==0)) { // You are in the middle row, going west
        objX = centerRow;
        objZ = currentPlot-1;
    }
    if ((side==0)&&(dir==1)) { // You are at the end of a row, going east
        objX = xWest;
        objZ = currentPlot-2;
    }
    if ((side==1)&&(dir==0)) { // You are at the end of a row, going west
        objX = xEast;
        objZ = currentPlot-2;
    }
    if ((side==1)&&(dir==1)) { // You are in the middle row, going east
        objX = centerRow+(centerRowWidth-1);
        objZ = currentPlot-1;
    }
    KeyBind.keyBind("key.attack", true);
    walkTo(objX,objZ)
    KeyBind.keyBind("key.attack", false);
    Client.waitTick();
    if ((Math.abs(p.getX() - objX - 0.5) > 0.2 || Math.abs(p.getZ() - objZ - 0.5 ) > 0.2)) { // If for some reason, you are at the wrong spot, move again
        goFrontLine();
    }
}

function toogleSprint() {
    KeyBind.keyBind("key.sprint", true);
    Client.waitTick();
    KeyBind.keyBind("key.sprint", false);
}
function lineFinished() { //Return true if the line is finished
    if ((side==0)&&(dir==0)) { // You started in the middle row, going west
        return(Math.floor(p.getX())<=xWest)
    }
    if ((side==0)&&(dir==1)) { // You started at the end of a row, going east
        return(Math.floor(p.getX())>=centerRow)
    }
    if ((side==1)&&(dir==0)) { // You started at the end of a row, going west
        return(Math.floor(p.getX())<=centerRow+(centerRowWidth-1))
    }
    if ((side==1)&&(dir==1)) { // You started in the middle row, going east
        return(Math.floor(p.getX())>=xEast)
    }
}

function harvestLine() { // Harvest a line of melon
    goFrontLine(); // Reach the front of the line
    if (speedPotAvailable) {
        if (!checkSpeed()) {
            refreshSpeed();
        }
    }
    p.lookAt(90+dir*180,28);
    KeyBind.keyBind("key.attack", true);
    KeyBind.keyBind("key.forward", true);
    p.lookAt(90+dir*180,pitchValue);
    while (!lineFinished()) {
        toogleSprint();
        if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) { //change tool if needed
            toolSwitch();
        }
        if (!checkHaste()) { //Refresh the haste buff if you haven't got it
            refreshHaste();
            KeyBind.keyBind("key.attack", true);
            p.lookAt(90+dir*180,pitchValue);
            KeyBind.keyBind("key.forward", true);
        }
        prevX = p.getX();
        Client.waitTick(2);
        if (Math.abs((p.getX()-prevX))<0.1) { // This allows to wait if you bump into a melon, to prevent lag
            KeyBind.keyBind("key.forward", false);
            p.lookAt(90+dir*180,28);
            Client.waitTick(breakTime*2);
            p.lookAt(90+dir*180,pitchValue);
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
    dir = 1-dir;
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
        if (item == "minecraft:melon") {
            inv.quick(slot);
            Client.waitTick();
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
        dir = 1;
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
            plotCount=0;    
            disableCtb();
            eat();
            refreshSpeed();
            harvestMain();
            finishFarm();
        } else {
            Chat.log("Please, start in front of a plot, in the middle row")
        }
     }else{
        Chat.log("You are not in the farm, cannot proceed");
    }
}

refreshSpeed();