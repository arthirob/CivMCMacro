/*Script to harvest a tree farm, and replant
V1.3 by arthirob, 27/07/2024 

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
const inv = Player.openInventory();

//Farm borders and properties
const xEast = 6375; //Easter row
const xWest = 6326; // Western row
const zNorth = -6279; // North limit
const zSouth = -6125; // South limit
const firstLevel = 94; //First level of the farm
const farmNumberLevel = 4; //Number of farm level
const rowSpace = 7; //Space between rows
const treeSpace = 7; //Space between trees in a row
const levelSpace = 10; //Space between two levels
const woodType = "spruce"

const damageTreshhold=20; //The damage at which you want to stop using your tool
const toDump = [`minecraft:${woodType}_sapling`,`minecraft:${woodType}_log`,`minecraft:stripped_${woodType}_log`,`minecraft:${woodType}_leaves`,`minecraft:stick`];
const fastMode = true; //Switch to true for faster harvest. Will consume more shears
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
var wait = 2; //This allows to use shears instead of the axe when cutting leaves. Reduce to 2 if you have good connection, 4 for bad
var breakTime;

//Information to send the message in a discord relay
const discordGroup = 'FU-Bot';
const farmName = "Spruce tree farm in farmingrad"
const regrowTime = 12;

//Variable of the script, no touching as well
var currentRow; //Current row, in Z cords
var currentX; //X at the start of the script
var currentZ; //Z at the start of the script
var currentY; //Y at the start of the script
var dir; // 1 for north, 0 for south
var prevZ ;
var stuck ; //Check if you are stuck in a tree
var toolList ; //The list of tools that could be used
var lowestToolDamage ; //The lowest health of the tool used
var currentToolDamage ; // The health of the tool when looping the inv


const startTime = Date.now();
var plantedSapling = 0;

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
            Client.waitTick(10);
        } while (p.getFoodLevel()<16)
        inv.setSelectedHotbarSlotIndex(0);
        KeyBind.keyBind("key.use", false);
    }
}

function placeFill(item) {
    im.interact();
    Client.waitTick(2);
    if (inv.findFreeHotbarSlot()==37) { //2nd slot = saplings slot is empty
        list = inv.findItem(item);
        if (list.length==0) {
            Chat.log("Out of saplings")
            throw("No more mats")
        }
        inv.swapHotbar(list[0],1);
        Client.waitTick();
    }
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
    Client.waitTick(10);
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
    breakTime = Math.ceil(1/damage)+8 // Needs correction I guess...;
}

function dumpSpruce() //Throw the spruce in the water, keep up to 10 stacks of saplings
{
    //Clear the leaves
    p.lookAt((xEast+xWest)/2,p.getY()+1.8,p.getZ());
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(30);
    KeyBind.keyBind("key.attack", false);


    let saplingCount = 0; // Keep some saplings
    for (let i = 9; i < 45 ; i++)    {
        if (toDump.includes(inv.getSlot(i).getItemID())) {
            if (inv.getSlot(i).getItemID() == "minecraft:spruce_sapling") {
                {
                    if (saplingCount>10) {
                        inv.dropSlot(i,true);
                        Client.waitTick();
                    } else {
                        saplingCount++;
                    }
                }
            } else {
                inv.dropSlot(i,true)
            }
    }
    }
    Client.waitTick();
    
}

function reachLog(z,dir) { // Break the leaves to reach the log
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
    
    
    
    while (Math.floor(p.getZ())!=(z-1+dir*2)){
        prevZ = p.getZ();
        Client.waitTick(2);
        if (Math.abs((p.getZ()-prevZ))<0.1) { // This allows to wait if you bump into leaves, to prevent lag
            KeyBind.keyBind("key.forward", false);
            Client.waitTick(15);
            KeyBind.keyBind("key.forward", true);
        }
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.attack", false);
}

function shearsSwitch() {
    const shearList = inv.findItem("minecraft:shears");
    if (shearList.length==0) {
        Chat.log("You are out of shears");
        throw("Out of shears")
    }
    inv.swapHotbar(inv.findItem("minecraft:shears")[0],3);//Take a new one
}


function sortLeaves() {
    for (let i=0;i<2;i++){
        inv.setSelectedHotbarSlotIndex(3);
        Client.waitTick(wait);
        im.attack();
        Client.waitTick(wait);
        inv.setSelectedHotbarSlotIndex(0);
        KeyBind.keyBind("key.attack",true);
        Client.waitTick(breakTime);
        KeyBind.keyBind("key.attack",false);
        Client.waitTick(2);
        if (inv.findFreeHotbarSlot()==39) { //The shears are broken
            shearsSwitch();
        }
    }
}

function harvestLog(z,dir){ // When in front of a tree,cut 2 logs, walk forward and cut upward
    p.lookAt(dir*180+6,35) // If a tree isn't grown, the +6 avoid the glass pane
    // Select slot 1 the tool   
    inv.setSelectedHotbarSlotIndex(0);
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(breakTime*2); // Break the 2 bottom logs
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.forward", true);
    p.lookAt(dir*180,35)
    stuck = 0;
    while (Math.floor(p.getZ())!=z){ // Reach under the remaining logs
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
    Client.waitTick(breakTime*3);
    KeyBind.keyBind("key.attack",false);
    sortLeaves();
    p.lookAt(dir*180,90);
    Client.waitTick(2);
    inv.setSelectedHotbarSlotIndex(1);
    placeFill("minecraft:spruce_sapling");
    plantedSapling+=1;
    //Client.waitTick(2);
    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
        toolCheck();
    }
}


function farmLine(dir){ // Farm a line in a specified direction
    var nextLog = (Math.floor(p.getZ())+(treeSpace*(1-dir)-treeSpace*dir));//Next log coords
    while ((nextLog !=zNorth)&&(nextLog!=zSouth)) {
        reachLog(nextLog,dir); //Reach the next log
        Client.waitTick(10); // To prevent lag
        harvestLog(nextLog,dir);//Harvest the log
        nextLog+=treeSpace*(1-dir)-treeSpace*dir;
    }
    dumpSpruce();
    eat();
    reachLog(nextLog+1-2*dir,dir); //Allows to break the leaves if we are stuck on last tree
}

function farmLevel(currentX,currentZ,dir) { // Farm your current level
    currentRow = currentX;// To improve, but I don't know enough about global/local variable declaration
    while (currentRow < xEast) {
        farmLine(dir);
        currentRow+=rowSpace;
        walkTo(currentRow,zSouth*(1-dir)+zNorth*dir);
        dir=(dir+1)%2
      }
    farmLine(dir);
    dir=(dir+1)%2
    Chat.log("Level finished !")

}

function farmMain(currentX,currentZ,dir) { //Farm all the levels
    Chat.log("Starting main function")
    currentY = Math.floor(p.getY());
    for (i=currentY;i<=(firstLevel+levelSpace*(farmNumberLevel-1));i+=levelSpace) {
        currentX = Math.floor(p.getX());
        currentY = Math.floor(p.getY());
        currentZ = Math.floor(p.getZ());
        Chat.log("Starting level "+currentY);
        farmLevel(currentX,currentZ,dir);
        walkTo(xWest,zNorth);// Go to the lodestone
        Client.waitTick(10);// Wait
        KeyBind.keyBind("key.jump",true);
        Client.waitTick(5);
        KeyBind.keyBind("key.jump",false);
        Client.waitTick(10);
        dir = 0;
      }
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.log("Farm is finished to harvest. Choped "+plantedSapling+" trees in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. Now logging out")
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
                if (((currentZ-zNorth)%treeSpace)==0) {
                dir = (Math.floor((p.getYaw()+450)/180))%2; //The 450 is too get a positive yaw
                //Now prepare the hotbar
                saplingList = inv.findItem("minecraft:spruce_sapling");
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
                farmMain(currentX,currentZ,dir);
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
