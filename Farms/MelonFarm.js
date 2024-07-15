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


const xEast = 8508;
const xWest = 8249;
const zNorth = -2736;
const zSouth = -2609;
const centerRow = 8377;
const centerRowWidth = 4;
const xCompactor = 8379
const yCompactor = 86;
const zCompactor = -2673

const compactEveryPlot = 6; // The amount of plot you do before compacting
const lagTick = 8; //Add a little bit of delay when using the lodestone. With better internet, reduce this number




var dir = 0 ; // 0 for going west, 1 for going east
var side = 0 ; // 0 for west side, 1 for east side
var plotCount; // The number of plot harvested since last count
var currentPlot; // The plot you are currently farming
var pitch; //The angle at which you are cutting
var breakTime=6; //The break time of a melon

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

function disableCtb() {
    Chat.say("/ctb");
    Client.waitTick(10);
    var textis = Chat.getHistory().getRecvLine(0).getText().getString();
    if (Chat.getHistory().getRecvLine(0).getText().getString() == "Bypass mode has been enabled. You will be able to break reinforced blocks if you are on the group.") { // You hav ctb activating
        Chat.say("/ctb");
    }
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

function equiStick() { // Equip a stick in the 9th slot
    listStick = inv.findItem("minecraft:stick");
    if (listStick.length==0) {
        throw("Have a stick in our inventory")
    }
    inv.swapHotbar(listStick[0],8);
}

function goFrontLine() { //Go in front of a line
    if ((side==0)&&(dir==0)) { // You are in the middle row, going west
        walkTo(centerRow,currentPlot-1);
    }
    if ((side==0)&&(dir==1)) { // You are at the end of a row, going east
        walkTo(xWest,currentPlot-2);
    }
    if ((side==1)&&(dir==0)) { // You are at the end of a row, going west
        walkTo(xEast,currentPlot-2);
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
        if (Math.abs((p.getX()-prevX))<0.1) { // This allows to wait if you bump into a melon, to prevent lag
            KeyBind.keyBind("key.forward", false);
            p.lookAt(90+dir*180,28);
            Client.waitTick(breakTime*2);
            p.lookAt(90+dir*180,18);
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
}

function compact() { // Go to the compactor and compac !
    //Reach the underground compactor and open the door
    
    /*walkTo(xCompactor,zCompactor);
    KeyBind.keyBind("key.sneak", true);
    Client.waitTick(lagTick);
    KeyBind.keyBind("key.sneak", false);
    p.lookAt(xCompactor+0.5,yCompactor,zCompactor+0.5);
    Client.waitTick(lagTick)
    im.interact();
    Client.waitTick(lagTick)
    walkTo(xCompactor+2,zCompactor);
    */
    //Open the chest and empty your things
    p.lookAt(xCompactor+4.5,yCompactor+0.5,zCompactor+0.5)
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);

    const inv = Player.openInventory();
    const slots = inv.getSlots('main', 'hotbar', 'offhand');

    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item == "minecraft:stone") {
            Chat.log("In the if "+slot);
            Client.waitTick(5);
            inv.quick(slot);
            Client.waitTick(5);
        }
    }

    Client.waitTick();
    Player.openInventory().close(); 
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
            equipTool();
            equiStick();
            if (currentX==centerRow) {
                side = 0;
            }
            if (currentX==centerRow+centerRowWidth-1) {
                side = 1;
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

compact();