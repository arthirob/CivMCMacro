/*Script to harvest a tree farm, and replant. This version has lots of chat prompt for an easier debbuging, it'll ruin your chat history
V1.7 by arthirob, 14/10/2024 

Conditions for the farm as as follow
A compactor a placed in the north wall, with a lever on the furnace
An odd number of row
All tree with the same distance, all rows with the same distance. The distance to the first tree is the same as the distance to the other tree

Things to improve
Last layer, no saplings on lodestone tree
Change level is fucked up
*/


// Variable and constant declaration

//JS Macro stuff, no touching
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
var inv = Player.openInventory();

//Farm borders and properties
var yLevelCorrector;

yLevelCorrector = 3+(142-p.getY())/8

const originalXEast = 5782;
const originalXWest = 5687;
var xEast = originalXEast - yLevelCorrector; //Easter row
var xWest = originalXWest - yLevelCorrector; // Western row
const zNorth = 1792; // North limit
const zSouth = 1887; // South limit
const firstLevel = 110; //First level of the farm
const farmNumberLevel = 5; //Number of farm level
const rowSpace = 5; //Space between rows
const treeSpace = 5; //Space between trees in a row
const levelSpace = 8; //Space between two levels
const woodType = "oak"
const lagTick = 4; //Lag safeguard. Reduce to 4 or less with good connection
const runningPause = 10;// The amount of time you stop when bumping leaves
const dumpSpot = 1837;
const shearsNeeded = 4; //The amount of shears you have in hand
const saplingStack = Math.floor(((xEast-xWest)/rowSpace)*((zSouth-zNorth)/treeSpace)/64)+2; //How many stack of sapling you need to run a level

const damageTreshhold=20; //The damage at which you want to stop using your tool
const toDump = [`minecraft:${woodType}_log`,`minecraft:stripped_${woodType}_log`,`minecraft:${woodType}_leaves`,`minecraft:stick`];
const fastMode = true; //Switch to true for faster harvest. Will consume more shears
const foodType = "minecraft:cooked_beef"; // Change the food to be whatever you prefer to use !
const toolType = "minecraft:diamond_hoe"
var breakTime;

//Information to send the message in a discord relay
const discordGroup = 'Rivia';
const farmName = "Spruce tree farm in Rivia"
const regrowTime = 24;

//Variable of the script, no touching as well
var currentRow; //Current row, in Z cords
var currentX; //X at the start of the script
var currentZ; //Z at the start of the script
var currentY; //Y at the start of the script
var dir; // 1 for north, 0 for south or -1 for facing east
var prevZ ;
var stuck ; //Check if you are stuck in a tree
var toolList ; //The list of tools that could be used
var lowestToolDamage ; //The lowest health of the tool used
var currentToolDamage ; // The health of the tool when looping the inv
var underLog ; //Boolean to check if you are under the logs
var previousSlot ;
var previousItem ;


const startTime = Date.now();
var plantedSapling = 0;


function equipFood() {
    const foodList = inv.findItem(foodType);
    if (foodList.length==0) {
        Chat.log("You are out of food")
        throw("Out of food")
    }
    inv.swapHotbar(foodList[0],2);
}

function eat() {
    if (p.getFoodLevel()<16) {
        if (inv.getSlot(38).getItemId()!=foodType) {
            equipFood();
        }
        inv.setSelectedHotbarSlotIndex(2);
        KeyBind.keyBind("key.use", true);
        do {
            Client.waitTick(lagTick);
        } while (p.getFoodLevel()<16)
        inv.setSelectedHotbarSlotIndex(0);
        KeyBind.keyBind("key.use", false);
    }
}

function placeFill(slot) {
    previousItem = inv.getSlot(36+slot).getItemId();
    previousSlot = inv.getSelectedHotbarSlotIndex();
    inv.setSelectedHotbarSlotIndex(slot);
    Client.waitTick();
    im.interact();
    Client.waitTick();
    if (inv.getSlot(36+slot).getItemId()!=previousItem) {
        Chat.log("in if")
        list = inv.findItem(previousItem);
        if (list.length==0) {
            Chat.log("Out of mats")
            throw("No more mats")
        }
        inv.swapHotbar(list[0],1);
        Client.waitTick();
    }
    inv.setSelectedHotbarSlotIndex(previousSlot);
}

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.2 || Math.abs(p.getZ() - z - 0.5 ) > 0.2)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);
    
}

function disableCtb() {
    Chat.say("/ctb");
    Client.waitTick(lagTick);
    var textis = Chat.getHistory().getRecvLine(0).getText().getString();
    if (Chat.getHistory().getRecvLine(0).getText().getString() == "Bypass mode has been enabled. You will be able to break reinforced blocks if you are on the group.") { // You hav ctb activating
        Chat.say("/ctb");
    }
}

function toolCheck() { // Check if your tool can be used, and if not, switch it
    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
        toolSwitch();
    }
}

function toolSwitch(){ //Function to switch to the lowest durability axe still usable
    toolList = inv.findItem("minecraft:diamond_axe")  
    var usableSlot = 0;
    lowestToolDamage = 10000 ;
    for (i=0;i<toolList.length;i++) { // This needs to be correct as well, it's not really efficient to check all tools
        currentToolDamage = inv.getSlot(toolList[i]).getMaxDamage()-inv.getSlot(toolList[i]).getDamage() 
        if (currentToolDamage>=damageTreshhold) { // The tool has health remaining
            if (currentToolDamage<lowestToolDamage) {
                usableSlot = toolList[i];
                lowestToolDamage = currentToolDamage;
            }
            
        } 
    }
    if (usableSlot==0) {
        Chat.log("You are out of tools")
        throw("No more tools to use")
    }
    inv.swapHotbar(usableSlot,0);
    var effBonus = 0; //Bonus given by efficiency
    const axe = inv.getSlot(36);
    const enchantHelper = axe.getEnchantment("Efficiency");
    if (enchantHelper != null) {
        effBonus = (enchantHelper.getLevel())**2+1;
    }
    var damage = (8+effBonus)/60 // See breaking calculation for details, assuming diamond axe
    breakTime = Math.ceil(1/damage)+6 // Needs correction I guess...;
}

function dumpWood() //Throw the wood in the water, keep up to 10 stacks of saplings
{
    //Clear the leaves
    if (currentRow==xWest) {
        p.lookAt(-160,40)
    } else {
        p.lookAt(160,40);
    }
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(30);
    KeyBind.keyBind("key.attack", false);
    let saplingCount = 0; // Keep some saplings
    for (let i = 9; i < 45 ; i++)    {
        if (toDump.includes(inv.getSlot(i).getItemID())) {
            inv.dropSlot(i,true)
        }
    }
    Client.waitTick();
    
}

function reachLog(z) { // Break the leaves to reach the log. return true is a tree is here, false otherwise
    lookAtCenter(currentRow,z);
    KeyBind.keyBind("key.attack", true);
    KeyBind.keyBind("key.forward", true);
    if (fastMode==true) {
        inv.setSelectedHotbarSlotIndex(3);
        KeyBind.keyBind("key.sprint", true);
        Client.waitTick();
        KeyBind.keyBind("key.sprint", false);
    } else {
        inv.setSelectedHotbarSlotIndex(2); // Select slot 3, not the tool, not the saplings
    }   
    while (Math.abs(p.getZ()-z-dir)>0.350){
        prevZ = p.getZ();
        Client.waitTick();
        if (Math.abs((p.getZ()-prevZ))<0.1) { // This allows to wait if you bump into leaves, to prevent lag
            KeyBind.keyBind("key.forward", false);
            Client.waitTick(runningPause);
            KeyBind.keyBind("key.forward", true);
            Client.waitTick(lagTick);
        }
    }
    Client.waitTick();
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.attack", false);
    if (Math.abs(p.getZ()-z-dir)>0.3){
        return true
    } else {
        return false
    }
}

function shearsSwitch() {
    const shearList = inv.findItem(toolType);
    if (shearList.length==0) {
        Chat.log("You are out of leaf tool");
        throw("Out of leaf tool")
    }
    inv.swapHotbar(shearList[0],3);//Take a new one
}


function sortLeaves() { //Check if you cut leaves at some point. If yes, there's no more logs to cut
    originalDamage = inv.getSlot(39).getDamage()
    leafTry = 0;
    while ((originalDamage==inv.getSlot(39).getDamage())&&(leafTry<3)){
        inv.setSelectedHotbarSlotIndex(3);
        Client.waitTick(lagTick);
        im.attack();
        Client.waitTick(lagTick);
        inv.setSelectedHotbarSlotIndex(0);
        KeyBind.keyBind("key.attack",true);
        Client.waitTick(breakTime);
        KeyBind.keyBind("key.attack",false);
        Client.waitTick();
        leafTry++;
        if (inv.findFreeHotbarSlot()==39) { //The shears are broken
            shearsSwitch();
        }
    }
}

function notUnderLog(coord,axisX) {//Return true if you are not under the log
    if (axisX) {
        return (Math.floor(p.getX())!=coord)
    } else {
        return (Math.floor(p.getZ())!=coord)
    }
}

function harvestLog(coord,axisX){ // When in front of a tree,cut 2 logs, walk forward and cut upward. If axisX is true, run along the x axis
    if (axisX) {
        p.lookAt(90+6,35) // If a tree isn't grown, the +6 avoid the glass pane
    } else {
        p.lookAt(dir*180+6,35) // If a tree isn't grown, the +6 avoid the glass pane
    }
    // Select slot 1 the tool   
    inv.setSelectedHotbarSlotIndex(0);
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(breakTime*2); // Break the 2 bottom logs
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.forward", true);
    if (axisX) {
        p.lookAt(90,35) // If a tree isn't grown, the +6 avoid the glass pane
    } else {
        p.lookAt(dir*180,35) // If a tree isn't grown, the +6 avoid the glass pane
    }
    stuck = 0;
    while (notUnderLog(coord,axisX)){ // Reach under the remaining logs
        Client.waitTick();
        stuck+=1;
        if (stuck > 30) { // If you are stuck
            stuck = 0;
            KeyBind.keyBind("key.attack", true);
            Client.waitTick(breakTime); // Break the remaining log
            KeyBind.keyBind("key.attack", false);
        }
    }
    KeyBind.keyBind("key.forward", false);
    p.lookAt(dir*180,-90);
    KeyBind.keyBind("key.attack",true);
    Client.waitTick(breakTime*2);
    KeyBind.keyBind("key.attack",false);
    sortLeaves();
    p.lookAt(dir*180,90);
    Client.waitTick(5);
    placeFill(1);
    plantedSapling+=1;
    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
        toolCheck();
    }
}

function lineFinished() { // Return true if a line is finished, false otherwise
    if (dir==1) {
        return (Math.floor(p.getZ()) ==zNorth)
    } else {
        return (Math.floor(p.getZ()) == zSouth)
    }
}

function farmLine(){ // Farm a line in a specified direction
    currentZ = Math.floor(p.getZ());
    nextLog = currentZ+treeSpace*(1-2*dir);
    while (!lineFinished()) {
        Chat.log("finished bool is "+lineFinished())
        treeBool = reachLog(nextLog); //Reach the next log
        if (treeBool) { //Only harvest when the tree is grown
            Client.waitTick(lagTick); // To prevent lag
            harvestLog(nextLog,false);//Harvest the log
        } else { //If there is no tree, try to plant a sapling
            p.lookAt(currentRow+0.5,p.getY(),nextLog+0.5);
            placeFill(1);
        }
        if (nextLog == dumpSpot) {
            dumpWood();
        }
        nextLog = nextLog + treeSpace*(1-2*dir);
        }
    eat();
}

function changeLine(newLevel){ //Change the line you are in. If newLevel is set to true, you just started the level
    if (!newLevel) {
        currentRow-=rowSpace;
    }
    //ReachLog function on the x axis
    currentZ = Math.floor(p.getZ());
    Chat.log("aiming for "+currentRow);
    lookAtCenter(currentRow,currentZ);
    KeyBind.keyBind("key.attack", true);
    KeyBind.keyBind("key.forward", true);
    inv.setSelectedHotbarSlotIndex(2); // Select slot 3, not the tool, not the saplings
    while (p.getX()>(currentRow+1.5)) {
        Client.waitTick();
    }
    Chat.log("cerise");
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.forward", false);
    harvestLog(currentRow,true);
    if (!newLevel) { //Change direction if you are not in a new level
            dir=(dir+1)%2
    } else {
        Chat.log("in else")
        currentRow = xEast;
    }
    Chat.log("New dir is "+dir);
}

function farmLevel(currentX,currentZ) { // Farm your current level
    //If you are on a lodestone, start the first row 
    if (currentX==originalXEast) {//You are on the lodestone
        currentRow = xEast;
        changeLine(true);
    } else {
        currentRow = currentX;
    }
    while (currentRow >= xWest) {
        farmLine();
        if (currentRow>xWest) {
            changeLine(false);
        } else {
            currentRow-=rowSpace; //Prevent infinite loops, cause you'd never see you are finished
        }
      }
    Chat.log("Level finished !")

}

function refillSapling(){
    p.lookAt(originalXEast-0.5,p.getY(),zSouth+1.5);

    const InvSlots = inv.getSlots('main', 'hotbar', 'offhand');
    let saplingCount = 0;
    let shearsCount = 0;
    for (const slot of InvSlots) {
            if (inv.getSlot(slot).getItemID() == `minecraft:${woodType}_sapling`) {
                saplingCount+=inv.getSlot(slot).getCount();
            }
            if (inv.getSlot(slot).getItemID() == `minecraft:shears`) {
                shearsCount++;
            }
    }
    var neededStack = Math.floor(saplingStack-saplingCount/64);
    Client.waitTick();
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    Client.waitTick(lagTick);
    for (slot=0;slot<54;slot++) {
        if (inv.getSlot(slot).getItemID() == `minecraft:${woodType}_sapling`) {
            if (neededStack>0) {
                inv.quick(slot);
                neededStack--;
                Client.waitTick();
            }
        }
        if (inv.getSlot(slot).getItemID() == `minecraft:shears`) {
            if (shearsCount<shearsNeeded) {
                inv.quick(slot);
                shearsCount++;
                Client.waitTick();
            }
        }
    }
    Player.openInventory().close();    
    Client.waitTick(lagTick);
}

function farmMain(currentX,currentZ) { //Farm all the levels
    currentY = Math.floor(p.getY());
    for (i=currentY;i<=(firstLevel+levelSpace*(farmNumberLevel-1));i+=levelSpace) {
        currentX = Math.floor(p.getX());
        currentY = Math.floor(p.getY());
        currentZ = Math.floor(p.getZ());
        Chat.log("Starting level "+currentY);
        farmLevel(currentX,currentZ);
        walkTo(originalXEast,zSouth);
        p.lookAt(originalXEast+0.2,p.getY(),zSouth+0.2);
        inv.setSelectedHotbarSlotIndex(0);
        Client.waitTick(lagTick);
        p.interact();
        Client.waitTick(lagTick);
        refillSapling();
        dir = 1;
        yLevelCorrector = 3+(142-p.getY())/8
        xEast = originalXEast - yLevelCorrector; 
        xWest = originalXWest - yLevelCorrector;
      }
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.log("Farm is finished to harvest. Choped "+plantedSapling+" trees in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. Now logging out")
    Chat.say("/logout")    
}

function start() { //Allows to start back where you were. Finish the row, and place yourself at the start of the new row

    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());

    //First check the position
    if (((xWest<=currentX)&&(currentX<=xEast)&&(zNorth<=currentZ)&&(currentZ<=zSouth))||(currentX==originalXEast)) { // Check if you are inside the farm
        if (currentZ == zNorth) { // Correct the yaw if you are at the end of a row
            p.lookAt(0,0);
        }
        if (currentZ == zSouth) {
            p.lookAt(180,0);
        }
        if ((((currentX-xWest)%rowSpace)==0)||(currentX==originalXEast)) { // Start in a row
                if (((currentZ-zNorth)%treeSpace)==0) {
                dir = (Math.floor((p.getYaw()+450)/180))%2; //The 450 is too get a positive yaw
                //Now prepare the hotbar
                saplingList = inv.findItem(`minecraft:${woodType}_sapling`);
                var totalSapling = 0;
                for (let i=0;i<saplingList.length;i++) {
                    totalSapling += inv.getSlot(saplingList[i]).getCount();
                    required = farmNumberLevel*((xEast-xWest)/rowSpace)*((zSouth-zNorth)/treeSpace)
                }
                Chat.log("You have "+totalSapling+" saplings. The full farm should require "+required);
                inv.swapHotbar(saplingList[0],1);
                toolSwitch();
                shearsSwitch();
                disableCtb();
                equipFood();
                farmMain(currentX,currentZ);
            } else {
                Chat.log("Start in a tree spot or at the end of the line")
            }
        } else {
            Chat.log("Please, start in a row");
        }
     }else {
        Chat.log("You are not in the farm, cannot proceed");
    }
}


start();