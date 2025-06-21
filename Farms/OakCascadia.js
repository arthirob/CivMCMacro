/*Script to harvest a tree farm, and replant. This version has lots of chat prompt for an easier debbuging, it'll ruin your chat history
V1.8 by arthirob, 21/06/2024 

How to set up the farm :
Make sure the refill chests are filled with saplings and leaf tools.
Take in your inventory :
6 axes, 2 stacks of food, 12 stacks of saplings, 10 iron hoe. Don't forget to set up your food type.
Start anywhere in the tree farm, on a spot where the bot should start (end of a row, or a dirt block), look in the direction you want to start 
*/


// Variable and constant declaration

//JS Macro stuff, no touching
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
var inv = Player.openInventory();

//Farm borders and properties
const xEast = 3914; //Easter row
const xWest = 3604; // Western row
const zNorth = -5394; // North limit
const zSouth = -5250; // South limit
const dumpSpot = -5324; // Where to dumb the wood
const firstTreeDist = 2;//The distance between the first tree and the edge of the farm
const rowSpace = 5; //Space between rows
const treeSpace = 4; //Space between trees in a row
const woodType = "oak"
const lagTick = 6; //Lag safeguard. Reduce to 4 or less with good connection
const saplingChest = 20 ; //Have a chest full of saplings every this number of line
const saplingStack = Math.floor((zSouth-zNorth)*saplingChest/(treeSpace*64))+2; //How many stack of sapling you need to run the farm
const toolNeeded = 10; //The amout of hoes nedded between chest refill

const damageTreshhold=20; //The damage at which you want to stop using your tool
const toDump = [`minecraft:${woodType}_log`,`minecraft:stripped_${woodType}_log`,`minecraft:${woodType}_leaves`,`minecraft:stick`];
const fastMode = true; //Switch to true for faster harvest. Will consume more shears
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
const toolType = "minecraft:iron_hoe"
const runningPause = 4;
var breakTime;

//Information to send the message in a discord relay
const discordGroup = 'FU-Bot';
const farmName = "Cascadia Oak"
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

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        throw("No more "+item);
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick();
}

function eat() {
    p.lookAt(0,90); 
    if (p.getFoodLevel()<16) {
        if (inv.getSlot(38).getItemId()!=foodType) {
            equip(foodType,2);
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
    breakTime = Math.ceil(1/damage)+lagTick // Needs correction I guess...;
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
        Client.waitTick(2);
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

function notUnderLog(coord,axisX) {//Return true if you are not under the log
    if (axisX) {
        return (Math.floor(p.getX())!=coord)
    } else {
        return (Math.floor(p.getZ())!=coord)
    }
}

function sortLeaves() { //Check if you cut leaves at some point. If yes, there's no more logs to cut
    originalDamage = inv.getSlot(39).getDamage()
    leafTry = 0;
    while ((originalDamage==inv.getSlot(39).getDamage())&&(leafTry<3)){
        inv.setSelectedHotbarSlotIndex(3);
        Client.waitTick(lagTick);
        im.attack();
        Client.waitTick(lagTick);
        if (originalDamage==inv.getSlot(39).getDamage()) {
            inv.setSelectedHotbarSlotIndex(0);
            KeyBind.keyBind("key.attack",true);
            Client.waitTick(breakTime+lagTick);
            KeyBind.keyBind("key.attack",false);
            Client.waitTick();
            leafTry++;
        }
        if (inv.getSlot(39).getItemID()!=toolType) { //The hoes are broken
            shearsSwitch();
        }
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
    Client.waitTick(breakTime*2+lagTick); // Break the 2 bottom logs
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
    Client.waitTick(breakTime*2+lagTick);
    KeyBind.keyBind("key.attack",false);
    sortLeaves();
    p.lookAt(dir*180,90);
    Client.waitTick(lagTick);
    placeFill(1);
    Client.waitTick(lagTick);
    plantedSapling+=1;
    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
        toolCheck();
    }
}

function lineFinished() { // Return true if a line is finished, false otherwise
    if (dir==1) {
        return (nextLog < zNorth)
    } else {
        return (nextLog > zSouth)
    }
}

function refillSapling(){
    Client.waitTick(10); //Wait a long time, to make sure you are in the lodestone and not moving
    p.lookAt(currentRow-0.5,p.getY(),zSouth+1.5);
    Client.waitTick(lagTick);
    const InvSlots = inv.getSlots('main', 'hotbar', 'offhand');
    let saplingCount = 0;
    let toolCount = 0;
    for (const slot of InvSlots) {
            if (inv.getSlot(slot).getItemID() == `minecraft:${woodType}_sapling`) {
                saplingCount+=inv.getSlot(slot).getCount();
            }
            if (inv.getSlot(slot).getItemID() == toolType) {
                toolCount++;
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
        if (inv.getSlot(slot).getItemID() == toolType) {
            if (toolCount<toolNeeded) {
                inv.quick(slot);
                toolCount++;
                Client.waitTick();
            }
        }
    }
    Player.openInventory().close();    
    Client.waitTick(lagTick);
    inv = Player.openInventory();
}

function farmLine(){ // Farm a line in a specified direction
    currentZ = Math.floor(p.getZ());
    if ((currentZ==zNorth)||(currentZ==zSouth)) { //Check if you are on the edge of the farm or not
        nextLog = currentZ+firstTreeDist*(1-2*dir);
    } else {
        nextLog = currentZ+treeSpace*(1-2*dir);
    }
    while (!lineFinished()) {
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
    nextLog+=(firstTreeDist-treeSpace)*(1-2*dir);
    reachLog(nextLog); //Allows to break the leaves if we are stuck on last tree
    eat();
}

function farmMain(currentX,currentZ) { // Farm your current level
    currentRow = currentX;
    while (currentRow >= xWest) {
        farmLine();
        currentRow-=rowSpace;
        if (currentRow >= xWest) {
            walkTo(currentRow,zSouth*(1-dir)+zNorth*dir);
            if (((((xEast-currentRow)/rowSpace)%saplingChest)==0)&&(currentRow!=xEast)&&((currentRow-xWest)>20)) {// Don't refill on first or last row
                refillSapling();
            }
        }
        dir=(dir+1)%2
      }
}

function finishFarm(){
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" is finished to harvest. Choped "+plantedSapling+" trees in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. Now logging out")
    Chat.say("/logout")   
}

function start() { //Allows to start back where you were. Finish the row, and place yourself at the start of the new row
    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());
    //First check the position
    if (((xWest<=currentX)&&(currentX<=xEast)&&(zNorth<=currentZ)&&(currentZ<=zSouth))||(currentX==woolSpot)) { // Check if you are inside the farm
        if (currentZ == zNorth) { // Correct the yaw if you are at the end of a row
            p.lookAt(0,0);
        }
        if (currentZ == zSouth) {
            p.lookAt(180,0);
        }
        if ((((currentX-xWest)%rowSpace)==0)) { // Start in a row
            if ((((currentZ-zNorth)%treeSpace)==firstTreeDist)||(currentZ==zNorth)||(currentZ==zSouth)) {
                dir = (Math.floor((p.getYaw()+450)/180))%2; //The 450 is too get a positive yaw
                //Now prepare the hotbar
                equip(`minecraft:${woodType}_sapling`,1);
                toolSwitch();
                shearsSwitch();
                disableCtb();
                equip(foodType,2);
                farmMain(currentX,currentZ);
                finishFarm();
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
