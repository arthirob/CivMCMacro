/*Script to harvest a spruce tree farm, and replant.
Hotbar would be set to exactly : 0 = axe, 1 saplings ; 2 = food ; 3 = leaf tool ; 4 = log ; 5 = leaves
V1.0 by arthirob, 12/12/2025 
*/


// Variable and constant declaration

//JS Macro stuff, no touching
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
var inv = Player.openInventory();

//Farm borders and properties
const farmY = 189;
const lagTick = 6; //Lag safeguard. Reduce to 4 or less with good connection
const damageTreshhold=20; //The damage at which you want to stop using your tool
const minimumHeight = 9;//The minimum height a tree can have 
const xEast = 3259 ; //Easter row
const xWest = 3209 ; // Western row
const zNorth = -8628; // North limit
const zSouth = -8569; // South limit
const rowSpace = 5; //Space between rows
const treeSpace = 5; //Space between trees in a row
const firstTreeDist = 4;//The distance between the first tree and the edge of the farm
const woodType = "spruce"
const runningPause = 10;// The amount of time you stop when bumping leaves
const dumpSpot = -8599;
const shearsNeeded = 4; //The amount of shears you have in hand
const shearDamageTreshold= 10;
const toDump = [`minecraft:${woodType}_log`,`minecraft:${woodType}_leaves`,`minecraft:stripped_${woodType}_log`,`minecraft:stick`];
const fastMode = true; //Switch to true for faster harvest. Will consume more shears
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
const toolType = "minecraft:shears"
const farmName = "Giant spruce"
const discordGroup = "MordheimFarms"
var breakTime;

//Variable of the script, no touching as well
var currentX; //X at the start of the script
var currentZ; //Z at the start of the script
var currentYaw;
var dir= Math.floor(Math.abs(p.getYaw()/90)); // The direction of the farm you are harvestin 1 for north, 0 for south
var treeDir; //The current direction when staircasing in the tree
var toolList ; //The list of tools that could be used
var lowestToolDamage ; //The lowest health of the tool used
var currentToolDamage ; // The health of the tool when looping the inv
var breakTime;

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
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);
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


function mine3Up(x,z,treeDir,first){ //Mine 3 blocks up in the tree and jump to the next tree. First is a boolean to know if you are in the first log
    // Cause the north west log is always one block higher, if you are in the north west part, dig one block up before checking the end to see if you bump a leaf
    if (first){
        p.lookAt(0,-90);
        KeyBind.keyBind("key.attack", true);
        Client.waitTick(15);
        KeyBind.keyBind("key.attack", false);
    }
    inv.setSelectedHotbarSlotIndex(0);
    p.lookAt(treeDir,-60);
    KeyBind.keyBind("key.attack", true);
    if ((treeDir==0)&&(!first)){
        Client.waitTick(breakTime*2);
    } else {
        Client.waitTick(breakTime*3);
    }
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(3);
    KeyBind.keyBind("key.jump", false);
    Client.waitTick(10);
    walkTo(x,z);
    if (first) {
        if (treeDir==180) { //You are coming from the south
            treeDir=180 ; //Go straight
        } else {
            treeDir=90 ; //Mine to your right
        }
    } else {
        treeDir = (treeDir-180)%360+90;//If dir=-180,puts it back to +180
    }
    p.lookAt(treeDir,0);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(10);
    KeyBind.keyBind("key.forward", false);
    if (treeDir==0) {
        p.lookAt(treeDir,-75);
        KeyBind.keyBind("key.attack", true);
        Client.waitTick(breakTime);
        KeyBind.keyBind("key.attack", false);
    }
    return (treeDir)
}

function nextValue(x,z,dir){// Give the value of the coords of the block in front of you if you are at x,z, facing dir
    if (dir==-90) {
        return ([x+1,z])
    } else if (dir==0) {
        return([x,z+1])
    } else if (dir==90) {
        return([x-1,z])
    } else {
        return([x,z-1])
    }
}

function checkTop(treeDir) { //Check if you are at the top of a tree. To do that, do a middle click, and check which inventory slot is selected
    if (p.getY()<(farmY+minimumHeight)) {
        return false
    } else {
        if (treeDir==0) { //Look
            p.lookAt(treeDir,-75);
        } else {    
            p.lookAt(0,-90);
        }
        Client.waitTick();
        KeyBind.keyBind("key.pickItem", true);
        Client.waitTick(3);
        KeyBind.keyBind("key.pickItem", false);
        Client.waitTick(2);
        top = (inv.getSelectedHotbarSlotIndex()==5) ;//The next part would be a leaf
        inv.setSelectedHotbarSlotIndex(0);
        if (inv.getSelectedHotbarSlotIndex()==0) {
            return(top);
        } else {
            Chat.log("Switched fail, waiting a bit")
            Client.waitTick(lagTick)
            inv.setSelectedHotbarSlotIndex(0);
            Client.waitTick(lagTick)
            return(top);


        }
    }
}
function getNorthWest(x,z,treeDir){//Gets which block is at the northwest of tree depending on actual dir and coords
    if (treeDir==-90) {
        return ([x,z+1])
    } else if (treeDir==0) {
        return([x,z])
    } else if (treeDir==90) {
        return([x-1,z])
    } else {
        return([x-1,z-1])
    }
}
function clearTop(currentX,currentZ,treeDir){ //Once you are at almost at the top, clear the middle of the tree
    if (treeDir==0) {
        KeyBind.keyBind("key.attack", true);
        p.lookAt(0,-90);
        Client.waitTick(breakTime);
        p.lookAt(0,25);
        Client.waitTick(breakTime*2);
        p.lookAt(0,25);
        Client.waitTick(breakTime*2);
        p.lookAt(-45,-40);
        Client.waitTick(breakTime*2);
        p.lookAt(-90,-40);
        Client.waitTick(breakTime);
        walkTo(currentX+0.5,currentZ-0.5);
    } else {      
        mine3Up(currentX,currentZ,treeDir,false); //Go up one more row
        treeDir = (treeDir-180)%360+90;//If dir=-180,puts it back to +180
        KeyBind.keyBind("key.attack", true);
        p.lookAt(treeDir,15);
        Client.waitTick(breakTime*2);
        p.lookAt(treeDir-45,15);
        Client.waitTick(breakTime);
        [xTop,zTop]=getNorthWest(currentX,currentZ,treeDir)
        p.lookAt(xTop+0.5,p.getY()+2,zTop+0.5);
        Client.waitTick(lagTick+2); //+2 Because you take time to rotate camera
        KeyBind.keyBind("key.attack", false);
        walkTo(xTop+0.5,zTop+0.5);
    }
}


function mineDown(dir){
    KeyBind.keyBind("key.attack", true);
    while (p.getY()!=farmY) {
        p.lookAt(dir,80);
        dir = (dir+270)%360-180;//If dir=-180,puts it back to +180
        Client.waitTick(breakTime+3);
    }
    KeyBind.keyBind("key.attack", false);
}

function harvestTree(x,z,treeDir){ //Harvest a 2x2 spruce tree, standing in front of the right log, with coords x and z, facing the dir
    KeyBind.keyBind("key.sneak", true);
    treeDir = mine3Up(x,z,treeDir,true);
    [currentX,currentZ] = nextValue(x,z,treeDir)
    while (!checkTop(treeDir)){
        treeDir = mine3Up(currentX,currentZ,treeDir,false);
        [currentX,currentZ] = nextValue(currentX,currentZ,treeDir)
    }
    clearTop(currentX,currentZ,treeDir);
    mineDown(treeDir+45);
    replantTree();
    KeyBind.keyBind("key.sneak", false);

}

function replantTree(){
    for (let i=0;i<4;i++) {
        p.lookAt(-135+90*i,65);
        placeFill(1);
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

function dumpWood(){ //Throw the wood and broken shears in the water
    //Clear the leaves
    p.lookAt(-160,40)
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(30);
    KeyBind.keyBind("key.attack", false);
    let saplingCount = 0; // Keep some saplings
    for (let i = 9; i < 36 ; i++)    {
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
    } else {
        inv.setSelectedHotbarSlotIndex(2); // Select slot 3, not the tool, not the saplings
    }   
    while (Math.abs(p.getZ()-z-dir)>0.350){
        prevZ = p.getZ();
        Client.waitTick();
        if (Math.abs((p.getZ()-prevZ))<0.1) { // This allows to wait if you bump into leaves, to prevent lag
            KeyBind.keyBind("key.forward", false);
            currentYaw = p.getYaw();
            for (let i=4;i<10;i++){
                p.lookAt(currentYaw,90-10*i);
                Client.waitTick(runningPause/10);
            }
            KeyBind.keyBind("key.forward", true);
            Client.waitTick(lagTick);
        }
    }
    KeyBind.keyBind("key.sprint", false);
    Client.waitTick();
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.attack", false);
    if (Math.abs(p.getZ()-z-dir)>0.3){
        return true
    } else {
        return false
    }
}

function lineFinished() { // Return true if a line is finished, false otherwise
    if (dir==1) {
        return (nextLog==zNorth)
    } else {
        return (nextLog == zSouth)
    }
}

function farmLine(){ // Farm a line in a specified direction
    currentZ = Math.floor(p.getZ());
    if ((currentZ==zNorth)||(currentZ==zSouth)) { //Check if you are on the edge of the farm or not
        nextLog = currentZ+firstTreeDist*(1-2*dir);
    } else {
        nextLog = currentZ+treeSpace*(1-2*dir);
    }
    var treeBool;
    while (!lineFinished()) {
        treeBool = reachLog(nextLog); //Reach the next log
        if (treeBool) { //Only harvest when the tree is grown
            Client.waitTick(lagTick); // To prevent lag
            harvestTree(currentRow,nextLog,dir*180);//Harvest the log
        } else { //If there is no tree, try to plant a sapling
            KeyBind.keyBind("key.sneak", true);
            KeyBind.keyBind("key.attack", true);

            if (dir==0) {
                walkTo(currentRow-0.5,nextLog+0.5)
            } else {
                walkTo(currentRow-0.5,nextLog-0.5)
            }
            KeyBind.keyBind("key.sneak", false);
            KeyBind.keyBind("key.attack", false);
            replantTree();
        }
        walkTo(currentRow,nextLog);
        if (Math.abs(nextLog-dumpSpot)<=2) {
            dumpWood();
        }
        nextLog = nextLog + treeSpace*(1-2*dir);
    }
    nextLog+=(firstTreeDist-treeSpace)*(1-2*dir);
    reachLog(nextLog); //Allows to break the leaves if we are stuck on last tree
    walkTo(currentRow,dir*zNorth+(1-dir)*zSouth);
    eat();
}

function farmLevel(currentX) { // Farm your current level
    //If you are on a lodestone, start the first row 
    currentRow = currentX;
    while (currentRow <= xEast) {
        farmLine();
        currentRow+=rowSpace;
        if (currentRow <= xEast) {
            walkTo(currentRow,zSouth*(1-dir)+zNorth*dir);
        }
        dir=(dir+1)%2
    }
    Chat.log("Level finished !")
}

function finishFarm(){
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. Now logging out")
    Chat.say("/logout")   
}

function start(){
    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());
    if ((xWest<=currentX)&&(currentX<=xEast)&&(zNorth<=currentZ)&&(currentZ<=zSouth)) { // Check if you are inside the farm
        toolSwitch();
        equip(`minecraft:${woodType}_sapling`,1);
        equip(foodType,2);
        shearsSwitch();
        equip(`minecraft:${woodType}_log`,4);
        equip(`minecraft:${woodType}_leaves`,5);
        inv.setSelectedHotbarSlotIndex(0);
        farmLevel(currentX);
        finishFarm();
    } else {
        Chat.log("You are not in the farm")
    }
}

start();