/*Script to dig a 2x1 tunnel
V1.0 by arthirob, 22/07/2024 

Things to improve
*/


// Variable and constant declaration

// JS macro stuff, don't touch
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
const inv = Player.openInventory();

//What you should modify, your holes coordinate.
const dir = 0; // -1 for east, 0 for south, 1 for west and 2 for north
const xObjectiv = 60; // The X coordinate where you want to stop. Only use if dir is 0 or 2
const zObjectiv = -6500; // The Z coordinate where you want to stop. Only use if dir is -1 or 1

const damageTreshhold=20; //The damage at which you want to stop using your tool
const lagBreak = 7;//Add a little delay to compensate the lag. You can try to play with this one

const pitch = 15;// the pitch at which you mine
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
const toolType = "pickaxe"; // Can be "shovel" or "pickaxe" depending on what you dig
const blockHardness = 1.5; // 1.5 for stone like, 0.5 for dirt like
const solidBlock = "minecraft:cobblestone" // The block you'll use to fill the holes under you
const toDump = ["minecraft:stone","minecraft:cobblestone","minecraft:tuff","minecraft:moss_block","minecraft:diorite","minecraft:granite","minecraft:smooth_basalt","minecraft:cobbled_deepslate","minecraft:calcite","minecraft:andesite","minecraft:deepslate"]



// Don't touch those variables, they are used during the script to track execution
var currentX; //X at the start of the script
var currentY; //Y at the start of the script
var prevX ; //Allows to check if X changed
var prevZ ; //Allows to check if Z changed
var stuck ; //Check if you are stuck in a block
var stuckHit ;// If you are stuck on a block you need to break, make the breaktime higher each try
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

function placeFill(item) { //Place an item, and refill your inv if you have some left
    im.interact();
    Client.waitTick(2);
    if (inv.findFreeHotbarSlot()==37) { //2nd slot
        equip(item,1)
    }
}

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
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

function toolSwitch(){ //This is to be corrected... For some reasons, maths don't check with the wiki
    if (((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold)||(inv.getSlot(36).getItemId()!="minecraft:diamond_"+toolType)) { // If you first tool isn't usable, switch it
        const toolList = inv.findItem("minecraft:diamond_"+toolType)
        var usableSlot = 0;
        for (i=0;i<toolList.length;i++) { // This needs to be correct as well, it's not really efficient to check all tools
            if ((inv.getSlot(toolList[i]).getMaxDamage()-inv.getSlot(toolList[i]).getDamage())>=damageTreshhold) {// The tool has health remaining
                usableSlot = toolList[i];
            } 
        }
        if (usableSlot==0) {
            throw("No more tools to use")
        }
        inv.swapHotbar(usableSlot,0);
        inv.setSelectedHotbarSlotIndex(0);
        Chat.log("Tool switched");
    }
    var effBonus = 0; //Bonus given by efficiency
    const tool = inv.getSlot(36);
    const enchantHelper = tool.getEnchantment("Efficiency");
    if (enchantHelper != null) {
        effBonus = (enchantHelper.getLevel())**2+1;
    }
    breakTime = Math.ceil(1/((8+effBonus)/(30*blockHardness)))+lagBreak //
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

function isFinished(){
    finished = false
    if (dir==0) {
        if (p.getZ()>zObjectiv) {
            finished = true
        }
    }
    if (dir==2) {
        if (p.getZ()<zObjectiv) {
            finshed = true
        }
    }
    if (dir==-1) {
        if (p.getX()>xObjectiv) {
            finished = true
        }
    }
    if (dir==1) {
        if (p.getX()>zObjectiv) {
            finished = true
        }
    }
    return finished
}

function mineForward() { // Mine the block at this z value and walk to it
    p.lookAt(90*dir,pitch);
    toolSwitch();
    KeyBind.keyBind("key.attack", true);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.forward", true);
    stuck = 0 // Check if we are stuck on the edge of a block
    stuckHit = 1; // Reinitialize the stuckHit counter
    while (!isFinished()) {
        prevZ = p.getZ();
        prevX = p.getX();
        Client.waitTick(2)
        if ((Math.abs(p.getZ()-prevZ)<0.05)&&((Math.abs(p.getX()-prevX)<0.05))){ // You are almost not moving
            stuck++;
            if (stuck==5) {
                unstuck();
                stuckHit++;
                stuck = 0;
            }
        } else {
            stuck = 0
        }
    }
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.sneak", false);
    KeyBind.keyBind("key.forward", false);
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
        KeyBind.keyBind("key.attack", false);
        p.lookAt((dir-2)*90,80);
        Client.waitTick();
        inv.setSelectedHotbarSlotIndex(1);
        Client.waitTick();
        placeFill(solidBlock);
        p.lookAt(dir*90,pitch);
        Client.waitTick();
        inv.setSelectedHotbarSlotIndex(0);
        KeyBind.keyBind("key.attack", true);
    } else {
        Client.waitTick(breakTime*stuckHit);
        Client.waitTick(3);
    }
    KeyBind.keyBind("key.forward", true);
}

function start() { //Allows to start back where you were. Finish the row, and place yourself at the start of the new row
    toolSwitch();
    inv.setSelectedHotbarSlotIndex(0);
    equip(solidBlock,1);// Put the solid block in the second slot
    mineForward();
}

start();