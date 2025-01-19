/*Script to dig a 3x3 tunnel
V1.0 by arthirob, 06/12/2024 

Things to improve
*/


// Variable and constant declaration

// JS macro stuff, don't touch
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
const inv = Player.openInventory();

//What you should modify, your holes coordinate.
const dir = 0; // -1 for east, 0 for south, 1 for west and 2 for north
const tunnelLength = 100;

const damageTreshhold=20; //The damage at which you want to stop using your tool
const lagBreak = 8;//Add a little delay to compensate the lag. You can try to play with this one

const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
const toolType = "pickaxe"; // Can be "shovel" or "pickaxe" depending on what you dig
const blockHardness = 3; // 1.5 for stone like, 0.5 for dirt like
const solidBlock = "minecraft:cobbled_deepslate" // The block you'll use to fill the holes under you
const toDump = ["minecraft:stone","minecraft:cobblestone","minecraft:tuff","minecraft:moss_block","minecraft:diorite","minecraft:granite","minecraft:smooth_basalt","minecraft:cobbled_deepslate","minecraft:calcite","minecraft:andesite","minecraft:deepslate"]

/*4x3 wall
const pitchList = [-70,0,70,-70,0,70,-70,0,70,-70,0,70,];
const yawList = [-70,-82,-70,-50,-75,-50,0,0,0,35,70,35,];
*/

/* 3x3 wall*/
const pitchList = [-70,0,70,-70,0,70,-70,0,70,];
const yawList = [-50,-75,-50,0,0,0,35,70,35,];



// Don't touch those variables, they are used during the script to track execution
var currentX; //X at the start of the script
var currentY; //Y at the start of the script
var prevX ; //Allows to check if X changed
var prevZ ; //Allows to check if Z changed
var stuck ; //Check if you are stuck in a block
var stuckHit=0 ;// If you are stuck on a block you need to break, make the breaktime higher each try
var breakTime; //The break time for a regular block
const startTime = Date.now();

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==0) {
        throw("No more mats")
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick();
}

function placeFill(i) { //Autofill the i slot
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
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x, z,sneak) { // Walk to the center of a block
    lookAtCenter(x,z);
    if (sneak) {
        KeyBind.keyBind("key.sneak", true);

    }
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(3);
    
}

function toolSwitch(){ //Function to switch to the lowest durability axe still usable

    toolList = inv.findItem("minecraft:diamond_pickaxe")  
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
    const tool = inv.getSlot(36);
    const enchantHelper = tool.getEnchantment("Efficiency");
    if (enchantHelper != null) {
        effBonus = (enchantHelper.getLevel())**2+1;
    }
    var damage = (8+effBonus)/60 // See breaking calculation for details, assuming diamond axe
    breakTime = Math.ceil(1/damage)+lagBreak // Needs correction I guess...;
}

function silkTouchSwitch(){ //Function to switch to the lowest durability axe still usable
    toolList = inv.findItem("minecraft:diamond_pickaxe")  
    var usableSlot = 0;
    lowestToolDamage = 10000 ;
    for (i=0;i<toolList.length;i++) { // This needs to be correct as well, it's not really efficient to check all tools
        if ((inv.getSlot(toolList[i]).getEnchantment("Silk Touch")!=null)&&(toolList[i]!=36)) {
            currentToolDamage = inv.getSlot(toolList[i]).getMaxDamage()-inv.getSlot(toolList[i]).getDamage() 
            if (currentToolDamage>=damageTreshhold) { // The tool has health remaining
                if (currentToolDamage<lowestToolDamage) {
                    usableSlot = toolList[i];
                    lowestToolDamage = currentToolDamage;
                }
                
            }
        }
    }
    if (usableSlot==0) {
        Chat.log("You are out of silk touch tools")
        throw("No more tools to use")
    }
    inv.swapHotbar(usableSlot,2);
}

function dumpBlock() { //Throw the useless blocks behind you
    KeyBind.keyBind("key.forward", false);
    p.lookAt(90*(dir+2),pitch);
    Client.waitTick(3);
    for (let i = 9; i < 45 ; i++) {
        if ((toDump.includes(inv.getSlot(i).getItemID()))&&(inv.getSlot(i).getItemID()!=solidBlock)){
            inv.dropSlot(i,true)
            Client.waitTick();
        }
    }
    p.lookAt(90*dir,pitch);   
    KeyBind.keyBind("key.forward", true);
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


function mineAWall(){
    KeyBind.keyBind("key.attack", true);
    KeyBind.keyBind("key.sneak", true);

    for (let i=0;i<pitchList.length;i++) {
        p.lookAt(dir*90+pitchList[i],yawList[i]);
        Client.waitTick(breakTime)
        var textString = Chat.getHistory().getRecvLine(0).getText().getString();
        if (textString.startsWith("A SimpleAdmin")) {
            Chat.log("Switching");
            inv.setSelectedHotbarSlotIndex(2);
            Client.waitTick(breakTime)
            inv.setSelectedHotbarSlotIndex(0);
        }

    }
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.forward", true);
    
}

function stuckType() { // Tell if you are bumping on a block or stuck on the edge of a block
    Chat.log("checktype")
    if (dir==0) {
        currentZ = p.getZ();
        if ((currentZ-Math.floor(currentZ))>0.5){
            type = "wall"
        } else {
            type = "hole"
        }
    }
    if (dir==2) {
        currentZ = p.getZ();
        if ((currentZ-Math.floor(currentZ))<0.5){
            type = "wall"
        } else {
            type = "hole"
        }
    }
    if (dir==1) {
        currentX = p.getX();
        if ((currentX-Math.floor(currentX))<0.5){
            type = "wall"
        } else {
            type = "hole"
        }
    }
    if (dir==-1) {
        currentX = p.getX();
        if ((currentX-Math.floor(currentX))>0.5){
            type = "wall"
        } else {
            type = "hole"
        }
    }
    Chat.log(type);
    return type

}

function unstuck() { //If you are stuck, you are either hitting a block, or on the edge of a block
    KeyBind.keyBind("key.forward", false);
    Chat.log("youstuck")
    if (stuckType()=="hole") {
        p.lookAt((dir-2)*90,80);
        Client.waitTick();
        inv.setSelectedHotbarSlotIndex(1);
        Client.waitTick();
        placeFill(1);
        p.lookAt(dir*90,0);
        Client.waitTick();
        inv.setSelectedHotbarSlotIndex(0);
    } else {
        KeyBind.keyBind("key.attack", true);
        p.lookAt(dir*90,35);
        Client.waitTick(breakTime*stuckHit);
        var textString = Chat.getHistory().getRecvLine(0).getText().getString();
        if (textString.startsWith("A SimpleAdmin")) {
            Chat.log("In here")
            inv.setSelectedHotbarSlotIndex(2);
            Client.waitTick(breakTime*stuckHit)
            inv.setSelectedHotbarSlotIndex(0);
        }
        KeyBind.keyBind("key.attack", false);
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", true);
}


function walkForward(){
    KeyBind.keyBind("key.sneak", true);

    p.lookAt(dir*90,0);
    originX = p.getX();
    originZ = p.getZ();
    prevX = originX;
    prevZ = originZ;
    KeyBind.keyBind("key.forward", true);
    Client.waitTick();
    while ((Math.abs(originX-p.getX())<0.95)&&(Math.abs(originZ-p.getZ())<0.95)) {
        prevZ = p.getZ();
        prevX = p.getX();
        Client.waitTick();
        if ((p.getZ()==prevZ)&&(p.getX()==prevX)) {
            stuckHit ++;
            unstuck();
        } else {
            stuckHit = 0;
        }
    }
    KeyBind.keyBind("key.forward", false);
}

function placePerfect(){
    walkTo(Math.floor(p.getX()),Math.floor(p.getZ()),true);
    p.lookAt(dir*90,0);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(10);
    KeyBind.keyBind("key.forward", false);
}

function start() { //Allows to start back where you were. Finish the row, and place yourself at the start of the new row
    placePerfect();
    toolSwitch();
    silkTouchSwitch();

    inv.setSelectedHotbarSlotIndex(0);
    equip(solidBlock,1);// Put the solid block in the second slot
    for (let i=0;i<tunnelLength;i++) {
        mineAWall();
        walkForward();
    }
}

start();