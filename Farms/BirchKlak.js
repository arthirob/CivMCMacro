/*Script to harvest a tree farm, and replant. This version has lots of chat prompt for an easier debbuging, it'll ruin your chat history
V1.7 by arthirob, 14/10/2024 

Conditions for the farm as as follow
A compactor a placed in the north wall, with a lever on the furnace
An odd number of row
All tree with the same distance, all rows with the same distance. The distance to the first tree is the same as the distance to the other tree

Things to improve
*/


// Variable and constant declaration

//JS Macro stuff, no touching
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
var inv = Player.openInventory();

//Farm borders and properties

const xEast = 7972 ; //Easter row
const xWest = 7902 ; // Western row
const zNorth = -4494; // North limit
const zSouth = -4384; // South limit
const rowSpace = 5; //Space between rows
const treeSpace = 4; //Space between trees in a row
const firstTreeDist = 4;//The distance between the first tree and the edge of the farm
const woodType = "birch"
const lagTick = 4; //Lag safeguard. Reduce to 4 or less with good connection
const runningPause = 10;// The amount of time you stop when bumping leaves
const dumpSpot = -4439;
const leafTool = "minecraft:iron_hoe"
const saplingStack = Math.floor(((xEast-xWest)/rowSpace)*((zSouth-zNorth)/treeSpace)/64)+2; //How many stack of sapling you need to run a level
const damageTreshhold=20; //The damage at which you want to stop using your tool
const shearDamageTreshold= 10;
const toDump = [`minecraft:${woodType}_log`,`minecraft:stripped_${woodType}_log`,`minecraft:${woodType}_leaves`,`minecraft:stick`,`minecraft:shears`];
const fastMode = true; //Switch to true for faster harvest. Will consume more shears
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
var breakTime;

//Information to send the message in a discord relay
const discordGroup = 'Khalkedon';
const farmName = "birch farm"
const regrowTime = 12;

//Variable of the script, no touching as well
var currentRow; //Current row, in Z cords
var currentX; //X at the start of the script
var currentZ; //Z at the start of the script
var nextLog;
var dir; // 1 for north, 0 for south or -1 for facing east
var prevZ ;
var stuck ; //Check if you are stuck in a tree
var toolList ; //The list of tools that could be used
var lowestToolDamage ; //The lowest health of the tool used
var currentToolDamage ; // The health of the tool when looping the inv
var underLog ; //Boolean to check if you are under the logs
var boolFarmFinished = false;


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
    Chat.log("Starting function eat")
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

function placeFill(i) { //Autofill the i slot
    Chat.log("Starting function placefill")
    item = inv.getSlot(36+i).getItemID();
    inv.setSelectedHotbarSlotIndex(i);
    Client.waitTick();
    p.interact();
    Client.waitTick();
    if (inv.getSlot(36+i).getCount()==0) { //i slot empty
        list = inv.findItem(item);
        Chat.log(list.length);
        if (list.length==0) {
            KeyBind.keyBind("key.back", false);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.forward", true);
            Client.waitTick(3);
            KeyBind.keyBind("key.forward", false);
            KeyBind.keyBind("key.sneak", false);
            Chat.log("Out of materials")
            throw("No more mats")
        }
        inv.swapHotbar(list[0],i);
        Client.waitTick();
    }
}

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    Chat.log("Starting function walkTO")
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
    Chat.log("Starting function toolcheck")

    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
        toolSwitch();
    }
}

function toolSwitch(){ //Function to switch to the lowest durability axe still usable
    Chat.log("Starting function toolswitch")

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
    breakTime = Math.ceil(1/damage)+4 // Needs correction I guess...;
}

function dumpWood() //Throw the wood and broken shears in the water
{
    Chat.log("Starting function dumpWood")

    //Clear the leaves
    p.lookAt(-160,40)
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(30);
    KeyBind.keyBind("key.attack", false);
    let saplingCount = 0; // Keep some saplings
    for (let i = 9; i < 45 ; i++)    {
        if (toDump.includes(inv.getSlot(i).getItemID())) {
            if (inv.getSlot(i).getItemID()==leafTool) {
              if ((inv.getSlot(i).getMaxDamage()-inv.getSlot(i).getDamage())<shearDamageTreshold) {
                inv.dropSlot(i,true)

              }
            } else {
              inv.dropSlot(i,true)
            }
        }
    }
    Client.waitTick();
    
}

function reachLog(z) { // Break the leaves to reach the log. return true is a tree is here, false otherwise
    Chat.log("Starting function reachLog with z value "+z);

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

function shearsSwitch() { //Take a usable shear 
    Chat.log("Starting function shearSwitch")
    var shearList = inv.findItem(leafTool);
    foundShear = false ;
    for (shear of shearList) {
        if ((inv.getSlot(shear).getMaxDamage()-inv.getSlot(shear).getDamage())>shearDamageTreshold) {
            if (!foundShear) {
                foundShear = true;
                inv.swapHotbar(shear,3);//Take a new one
            }
        }
    }
    if (!foundShear) {
        throw("Out of shears")
    }
  }
  
  


function sortLeaves() { //Check if you cut leaves at some point. If yes, there's no more logs to cut
    Chat.log("Starting function sort leaves")
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
        if ((inv.getSlot(39).getMaxDamage()-inv.getSlot(39).getDamage())<shearDamageTreshold) { //The shears are almost broken
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
    Chat.log("Starting function harvest log")
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
    Client.waitTick(6);
    placeFill(1);
    plantedSapling+=1;
    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
        toolCheck();
    }
}

function lineFinished() { // Return true if a line is finished, false otherwise
    if (dir==1) {
        return (nextLog == (zNorth+firstTreeDist))
    } else {
        return (nextLog == (zSouth-firstTreeDist))
    }
}


function farmLine(){ // Farm a line in a specified direction
    currentZ = Math.floor(p.getZ());
    if ((currentZ==zNorth)||(currentZ==zSouth)) { //Check if you are on the edge of the farm or not
        nextLog = currentZ+firstTreeDist*(1-2*dir);
        Chat.log("First line "+nextLog)
    } else {
        nextLog = currentZ+treeSpace*(1-2*dir);
    }
    var treeBool;
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
    reachLog(nextLog);
    harvestLog(nextLog,false);
    KeyBind.keyBind("key.attack",true);
    walkTo(currentRow,zNorth*dir+(1-dir)*zSouth);//If there is no grown tree, allow you to walk precisely there
    KeyBind.keyBind("key.attack",false);

    eat();
}


function farmLevel(currentX,currentZ) { // Farm your current level
    Chat.log("Starting function farmlevel")
    //If you are on a lodestone, start the first row 
    currentRow = currentX;
    while (currentRow <= xEast) {
        farmLine();
        currentRow+=rowSpace;
        if (currentRow<=xEast) {
            walkTo(currentRow,zSouth*(1-dir)+zNorth*dir);
        }
        dir=(dir+1)%2
      }
    Chat.log("Level finished !")

}

function finishFarm() {
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. It'll be ready again in "+regrowTime+" hours. Now logging out") 
    Chat.say("/logout")
}

function farmMain(currentX,currentZ) { //Farm all the levels
    Chat.log("Starting main function")
    farmLevel(currentX,currentZ);
    finishFarm();
}

function start() { //Allows to start back where you were. Finish the row, and place yourself at the start of the new row
    Chat.log("Starting function start")

    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());

    //First check the position
    if ((xWest<=currentX)&&(currentX<=xEast)&&(zNorth<=currentZ)&&(currentZ<=zSouth)) { // Check if you are inside the farm
        if (currentZ == zNorth) { // Correct the yaw if you are at the end of a row
            p.lookAt(0,0);
        }
        if (currentZ == zSouth) {
            p.lookAt(180,0);
        }
        if (((currentX-xWest)%rowSpace)==0) { // Start in a row
            if ((((currentZ-zNorth)%treeSpace)==(firstTreeDist%treeSpace))||(currentZ==zNorth)||(currentZ==zSouth)) {
                dir = (Math.floor((p.getYaw()+450)/180))%2; //The 450 is too get a positive yaw
                //Now prepare the hotbar
                inv.swapHotbar(inv.findItem(`minecraft:${woodType}_sapling`)[0],1);
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