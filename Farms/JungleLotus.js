/*Script to harvest a tree farm, and replant
V1.5 by arthirob, 20/08/2024 

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
const xEast = 4324; //Easter row
const xWest = 4179; // Western row
const zNorth = 65; // North limit
const zSouth = 248; // South limit
const middleTree = 154; // Where to dumb the wood
const firstTreeDist = 4;//The distance between the first tree and the edge of the farm
const rowSpace = 5; //Space between rows
const treeSpace = 5; //Space between trees in a row
const woodType = "jungle"
const lagTick = 6; //Lag safeguard. Reduce to 4 or less with good connection

const damageTreshhold=20; //The damage at which you want to stop using your tool
const toDump = [`minecraft:${woodType}_log`,`minzecraft:stripped_${woodType}_log`,`minecraft:${woodType}_leaves`,`minecraft:stick`];
const fastMode = true; //Switch to true for faster harvest. Will consume more hoes
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
const replant = true; //True if you want to replant, false otherwise
var wait = 1; //This allows to use hoes instead of the axe when cutting leaves. Reduce to 2 if you have good connection, 4 for bad
var breakTime;

//Information to send the message in a discord relay
const discordGroup = 'KR-Farms';
const farmName = "Jungle tree farm "
const regrowTime = 12;

//Variable of the script, no touching as well
var currentRow; //Current row, in Z cords
var currentX; //X at the start of the script
var dir; // 1 for north, 0 for south
var prevZ ;
var stuck ; //Check if you are stuck in a tree
var toolList ; //The list of tools that could be used
var lowestToolDamage ; //The lowest health of the tool used
var currentToolDamage ; // The health of the tool when looping the inv
var nextLog ; //The distance to the next log

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
        const foodList = inv.findItem(foodType);
        if (foodList.length==0) {
            Chat.log("You are out of food")
            throw("Out of food")
        }
        inv.swapHotbar(foodList[0],2);
        KeyBind.keyBind("key.use", true);
        inv.setSelectedHotbarSlotIndex(2);
        do {
            Client.waitTick(lagTick);
        } while (p.getFoodLevel()<16)
        inv.setSelectedHotbarSlotIndex(0);
        KeyBind.keyBind("key.use", false);
    }
}

function equipSapling() {
    saplingList = inv.findItem(`minecraft:${woodType}_sapling`);
    if (saplingList.length==0) {
        Chat.log("You forgot to took saplings");
        throw("No saplings");
    }
    inv.swapHotbar(saplingList[0],1);
}
function placeFill(i) { //Autofill the i slot
    item = inv.getSlot(36+i).getItemID();
    hotbarSlot = inv.getSelectedHotbarSlotIndex();
    inv.setSelectedHotbarSlotIndex(i);
    Client.waitTick();
    if (inv.getSlot(36+i).getCount()==1) { //i slot empty
        refill = true;
    } else {
        refill = false;
    }
    p.interact();
    Client.waitTick();
    if (refill) { //i slot empty
        list = inv.findItem(item);
        if (list.length==0) {
            Chat.log("Out of materials")
            throw("No more mats")
        }
        inv.swapHotbar(list[0],i);
        Client.waitTick();
    }
    inv.setSelectedHotbarSlotIndex(hotbarSlot);
}

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.1 || Math.abs(p.getZ() - z - 0.5 ) > 0.1)){
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
    p.lookAt(160,40);
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(30);
    KeyBind.keyBind("key.attack", false);
    for (let i = 9; i < 45 ; i++)    {
        if (toDump.includes(inv.getSlot(i).getItemID())) {
            inv.dropSlot(i,true)
    }
    }
    Client.waitTick(); 
}

function reachLog(z) { // Break the leaves to reach the log, return true if a log is here
    Chat.log("Starting reach log with value "+z)
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
    while (p.distanceTo(p.getX(),p.getY(),z+0.5)>0.81){
        prevZ = p.getZ();
        Client.waitTick(2);
        if (Math.abs((p.getZ()-prevZ))<0.1) { // This allows to wait if you bump into leaves, to prevent lag
            KeyBind.keyBind("key.forward", false);
            Client.waitTick(lagTick);
            KeyBind.keyBind("key.forward", true);
        }
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.attack", false);
    if (p.distanceTo(p.getX(),p.getY(),z+0.5)<0.8) {
        return false
    } else {
        return true
    }
}

function hoesSwitch() {
    hoeList = inv.findItem("minecraft:iron_hoe")  
    var usableSlot = 0;
    lowestToolDamage = 10000 ;
    for (i=0;i<hoeList.length;i++) { // This needs to be correct as well, it's not really efficient to check all tools
        currentToolDamage = inv.getSlot(hoeList[i]).getMaxDamage()-inv.getSlot(hoeList[i]).getDamage() 
        if (currentToolDamage<lowestToolDamage) {
            usableSlot = hoeList[i];
            lowestToolDamage = currentToolDamage;
        }
    }
    if (hoeList.length==0) {
        Chat.log("You are out of hoes");
        throw("Out of hoes")
    }
    inv.swapHotbar(usableSlot,3);//Take a new one
}


function harvestLog(z,dir){ // When in front of a tree,cut 2 logs, walk forward and cut upward
    if ((inv.getSlot(39).getItemID()=="minecraft:air")&&fastMode){
        hoesSwitch();
    }
    p.lookAt(dir*180+6,35) //The +6 avoid the glass pane if something would occur
    // Select slot 1 the tool   
    inv.setSelectedHotbarSlotIndex(0);
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(breakTime*2+lagTick); // Break the 2 bottom logs
    p.lookAt(dir*180,35)
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.forward", true);
    stuck = 0;
    while (p.distanceTo(p.getX(),p.getY(),z+0.5)>0.2){ // Reach under the remaining logs
        Client.waitTick();
        stuck+=1;
        if (stuck > 30) { // If you are stuck
            stuck = 0;
            KeyBind.keyBind("key.attack", true);
            Client.waitTick(breakTime+lagTick); // Break the remaining log
            KeyBind.keyBind("key.attack", false);
        }
    }
    KeyBind.keyBind("key.forward", false);
    p.lookAt(dir*180,-90);
    KeyBind.keyBind("key.attack",true);
    Client.waitTick(breakTime*2+lagTick );
    KeyBind.keyBind("key.attack",false);
    p.lookAt(dir*180,90);
    Client.waitTick(3);
    if (replant){
        placeFill(1);
        plantedSapling+=1;
    }
    Client.waitTick(3);
    toolCheck();
}


function farmLine(dir){ // Farm a line in a specified direction
    currentZ = Math.floor(p.getZ());
    if ((currentZ==zNorth)||(currentZ==zSouth)) { //Check if you are on the edge of the farm or not
        nextLog = currentZ+firstTreeDist*(1-2*dir);
    } else {
        nextLog = currentZ+treeSpace*(1-2*dir);
    }
    while ((nextLog > zNorth)&&(nextLog < zSouth)) {
        treeBool = reachLog(nextLog); //Reach the next log
        if (treeBool) { //Only harvest when the tree is grown
            Client.waitTick(lagTick); // To prevent lag
            harvestLog(nextLog,dir);//Harvest the log
        } else { //If there is no tree, try to plant a sapling
            if (replant){
                p.lookAt(currentRow+0.5,p.getY(),nextLog+0.5);
                Client.waitTick();
                placeFill(1);
            }
        }
        if (nextLog == middleTree) {
            dumpWood();
        }
        nextLog+=treeSpace*(1-2*dir);
    }
    nextLog+=(firstTreeDist-treeSpace)*(1-2*dir);
    reachLog(nextLog); //Allows to break the leaves if we are stuck on last tree
    eat();
}

function farmMain(currentX,currentZ,dir) { //Farm all the line
    currentRow = currentX;
    while (currentRow < xEast) {
        farmLine(dir);   
        currentRow+=rowSpace;
        walkTo(currentRow,zSouth*(1-dir)+zNorth*dir);
        dir=(dir+1)%2
      }
    farmLine(dir);
    finishFarm();
}

function finishFarm() {
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. It'll be ready again in "+regrowTime+" hours. Now logging out") 
    Chat.say("/logout")
}


function start() { //Allows to start back where you were. Finish the row, and place yourself at the start of the new row
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
            if ((currentZ==zNorth)||(currentZ==zSouth)||((zSouth-currentZ)%treeSpace==firstTreeDist)) {
                dir=(Math.floor((p.getYaw()+450)/180))%2; //The 450 is too get a positive yaw
                //Now prepare the hotbar
                if (replant) {
                    equipSapling();
                }
                equipFood();
                toolSwitch();
                if (fastMode){
                    hoesSwitch();
                }
                disableCtb();
                farmMain(currentX,currentZ,dir)
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