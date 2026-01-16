/*Script to harvest a spruce tree farm, and replant.
Hotbar would be set to exactly : 0 = axe, 1 saplings ; 2 = food ; 3 = shovel ; 4 = log ; 5 = leaves
V1.0 by arthirob, 12/12/2025 
*/


// Variable and constant declaration

//JS Macro stuff, no touching
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
var inv = Player.openInventory();

//Farm borders and properties
const farmY = 64;

const lagTick = 6; //Lag safeguard. Reduce to 4 or less with good connection
const damageTreshhold=20; //The damage at which you want to stop using your tool
const minimumHeight = 9;//The minimum height a tree can have 

//Variable of the script, no touching as well
var currentX; //X at the start of the script
var currentZ; //Z at the start of the script
var dir; // 
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

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
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
    Chat.log("eff bonus is "+effBonus)
    var damage = (8+effBonus)/60 // See breaking calculation for details, assuming diamond axe
    breakTime = Math.ceil(1/damage)+lagTick // Needs correction I guess...;
    Chat.log("break time is "+breakTime)
}


function mine3Up(x,z,dir,first){ //Mine 3 blocks up in the tree and jump to the next tree. First is a boolean to know if you are in the first log
    if (first){
        p.lookAt(0,-90);
        KeyBind.keyBind("key.attack", true);
        Client.waitTick(15);
        KeyBind.keyBind("key.attack", false);
    }
    p.lookAt(dir,-60);
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(breakTime*3);
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(3);
    KeyBind.keyBind("key.jump", false);
    walkTo(x,z);
    if (!first){
        p.lookAt(dir-90,0);//Look to your left
    } else {
        p.lookAt(dir,0);//Look straigth (but not too much)
    }
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(10);
    KeyBind.keyBind("key.forward", false);
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

function checkTop() { //Check if you are at the top of a tree. To do that, do a middle click, and check which inventory slot is selected
    if (p.getY()<(farmY+minimumHeight)) {
        return false
    } else {
        p.lookAt(0,-90);
        Client.waitTick();
        KeyBind.keyBind("key.pickItem", true);
        Client.waitTick(3);
        KeyBind.keyBind("key.pickItem", false);
        Client.waitTick();
        top = (inv.getSelectedHotbarSlotIndex()==5) ;//The next part would be a leaf
        inv.setSelectedHotbarSlotIndex(0);
        return(top);
    }
}

function getNorthWest(x,z,dir){//Gets which block is at the northwest of tree depending on actual dir and coords
    Chat.log("dir is "+dir)
    if (dir==-90) {
        return ([x,z+1])
    } else if (dir==0) {
        return([x,z])
    } else if (dir==90) {
        return([x-1,z])
    } else {
        return([x-1,z-1])
    }
}

function clearTop(currentX,currentZ,dir){ //Once you are at almost at the top, clear the middle of the tree
    mine3Up(currentX,currentZ,dir,false); //Go up one more row
    dir = (dir-180)%360+90;//If dir=-180,puts it back to +180
    KeyBind.keyBind("key.attack", true);
    p.lookAt(dir,15);
    Client.waitTick(breakTime*2);
    p.lookAt(dir-45,15);
    Client.waitTick(breakTime);
    [xTop,zTop]=getNorthWest(currentX,currentZ,dir)
    p.lookAt(xTop+0.5,p.getY()+2,zTop+0.5);
    Client.waitTick(lagTick+2); //+2 Because you take time to rotate camera
    KeyBind.keyBind("key.attack", false);
    walkTo(xTop+0.5,zTop+0.5);
}

function mineDown(dir){
    KeyBind.keyBind("key.attack", true);
    while (p.getY()!=farmY) {
        p.lookAt(dir,80);
        dir = (dir+270)%360-180;//If dir=-180,puts it back to +180
        Client.waitTick(breakTime);
        Client.waitTick(5);
    }
    KeyBind.keyBind("key.attack", false);

}

function harvestTree(x,z,dir){ //Harvest a 2x2 spruce tree, standing in front of the right log, with coords x and z, facing the dir
    KeyBind.keyBind("key.sneak", true);
    mine3Up(x,z,dir,true);
    [currentX,currentZ] = nextValue(x,z,dir)
    while (!checkTop()){
        mine3Up(currentX,currentZ,dir,false);
        dir = (dir-180)%360+90;//If dir=-180,puts it back to +180
        [currentX,currentZ] = nextValue(currentX,currentZ,dir)
    }
    clearTop(currentX,currentZ,dir);
    mineDown(dir+45);   
}



toolSwitch();
harvestTree(25,165,90);
