/*Script to dig a rectangle to bedrock
V1.1 by arthirob, 25/10/2024 

Things to improve
*/


// Variable and constant declaration

// JS macro stuff, don't touch
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
const inv = Player.openInventory();

//What you should modify, your holes coordinate.
const xWest = -32; // The X coordinate of your starting point
const zSouth = -50; // The Z coordinate of your starting point
const yStop = -55; // The y layer at which you want to stop
const North = 28; // The number of block you want to dig to the north of the startpoint
const East = 25; // The number of block you want to dig to the east of the startpoint

const damageTreshhold=20; //The damage at which you want to stop using your tool
const lagBreak = 7;//Add a little delay to compensate the lag. You can try to play with this one


const torchGridX = 4; //The x distance between your torches
const torchGridZ = 4; //The z distance between your torches
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
const toolType = "pickaxe"; // Can be "shovel" or "pickaxe" depending on what you dig
const blockHardness = 1.5; // 1.5 for stone like, 0.5 for dirt like
const solidBlock = "minecraft:cobblestone" // The block you'll use to fill the holes under you
const toDump = ["minecraft:stone","minecraft:cobblestone","minecraft:tuff","minecraft:moss_block","minecraft:diorite","minecraft:granite","minecraft:smooth_basalt","minecraft:cobbled_deepslate","minecraft:calcite","minecraft:andesite","minecraft:deepslate"]



// Don't touch those variables, they are used during the script to track execution
var currentX; //X at the start of the script
var currentZ; //Z at the start of the script
var currentY; //Y at the start of the script
var dir; // 1 for north, 0 for south
var keepSolid;//The number of solid blocks stacks you want to keep
var oldDir; //Store the old direction when you need to modify the dir variable (at the end of a line)
var prevX ; //Allows to check if X changed
var prevY ; //Allows to check if Y changed
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
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function lookAtBlock(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.8, z+0.5);
}

function placeTorch(x,z){ // Place a torch if it follows the torch grid
    if (((x-xWest)%torchGridX==0)&&((z-zSouth)%torchGridZ==0)) {
        p.lookAt(x+0.5,p.getY(),z+0.5);
        placeFill(2);
        inv.setSelectedHotbarSlotIndex(0);  
    }
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
    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) { // If you first tool isn't usable, switch it
        const toolList = inv.findItem("minecraft:diamond_"+toolType).concat(inv.findItem("minecraft:netherite_"+toolType))
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

function dumpBlock() { //Throw the useless blocks, keep a few stacks of the item you need
    p.lookAt(xWest+East,p.getY()+1.5,zSouth-(North/2));
    Client.waitTick(3);
    keepSolid = 0;
    for (let i = 9; i < 45 ; i++) {
        if (toDump.includes(inv.getSlot(i).getItemID())){
            if ((inv.getSlot(i).getItemID()==solidBlock)) {
                if ((keepSolid>5)&&(i!=37)) {
                    inv.dropSlot(i,true)
                    Client.waitTick();
                } else {
                    keepSolid++;
                }
            } else {
                inv.dropSlot(i,true)
                Client.waitTick();
            }
        }
    }    
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

function mineOne(x,z) { // Mine the block at this z value and walk to it
    lookAtBlock(x,z);
    toolSwitch();
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(breakTime);
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.sneak", true);
    stuck = 0 // Check if we are stuck on the edge of a block
    stuckHit = 1; // Reinitialize the stuckHit counter
    while ((Math.abs(p.getZ()-0.5-z)>0.2)||(Math.abs(p.getX()-0.5-x)>0.2)) {
        prevZ = p.getZ();
        prevX = p.getX();
        Client.waitTick()
        if ((Math.abs(p.getZ()-prevZ)<0.05)&&((Math.abs(p.getX()-prevX)<0.05))){ // You are almost not moving
            stuck++;
            if (stuck==5) {
                unstuck(x,z);
                stuckHit++;
                stuck = 0;
            }
        } else {
            stuck = 0
        }
    }
    placeTorch(x,z);
}

function unstuck(x,z) { //If you are stuck, you are either hitting a block, or on the edge of a block
    KeyBind.keyBind("key.forward", false);
    if ((dir==0)||(dir==1)) {
        var dist = (Math.abs(p.getZ()-0.5-z))
    } else {
        var dist = (Math.abs(p.getX()-0.5-x))
    }
    if (dist <0.5) {
        p.lookAt((dir-1)*180,80);
        Client.waitTick(2);
        inv.setSelectedHotbarSlotIndex(1);
        Client.waitTick();
        placeFill(1);
        p.lookAt(dir*180,35);
        Client.waitTick();
        inv.setSelectedHotbarSlotIndex(0);
    } else {
        KeyBind.keyBind("key.attack", true);
        Client.waitTick(breakTime*stuckHit);
        KeyBind.keyBind("key.attack", false);
        Client.waitTick(3);
    }
    KeyBind.keyBind("key.forward", true);
}

function mineLine() { //Mine a line
    nextBlock = Math.floor(p.getZ())+1-2*dir; // Calculte the next block to break depending on the direction
    while ((nextBlock!=zSouth)&&(nextBlock!=(zSouth+1-North))) {
        nextBlock = Math.floor(p.getZ())+1-2*dir; // Calculte the next block to break depending on the direction
        mineOne(Math.floor(p.getX()),nextBlock);
    }

}

function mineLevel() { // Mine a full level
    dir = 1;
    for (let i=0;i<East;i++) {
        mineLine() // Mine the line
        if (i<(East-1)) {
            oldDir = dir;
            dir = -0.5;
            mineOne(xWest+i+1,Math.floor(p.getZ())) // Mine a block to the east
            dir = 1-oldDir;
        }
    }
    KeyBind.keyBind("key.sneak", false);
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.forward", false);
    dumpBlock();
    eat();
}

function downLevel() { //Go down a level
    walkTo(xWest+1,zSouth);
    prevY = p.getY();
    p.lookAt(xWest,p.getY()-1,zSouth);
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(breakTime*2); //Multiply by 2, just in case it's a tougher block
    KeyBind.keyBind("key.attack", false);
    p.lookAt(90,0);
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.sneak", true);
    do {
        prevX = p.getX();
        Client.waitTick()
    } while (prevX!=p.getX())
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(15);
    placeTorch(xWest,zSouth);
    if (prevY-1!=p.getY()) {
        throw("You are at the wrong height")
    }
}


function mineAll() {
    while (p.getY()>yStop) {
        mineLevel();
        downLevel();
    }
    mineLevel(); //Not nice to do the same call out of the loop, but I can't find a better solution yet
    walkTo(xWest,zSouth);
    const mineTime = Math.floor((Date.now()-startTime)/1000);
    Chat.log("Mining is finished in "+(Math.floor(mineTime/60))+" minutes and "+(mineTime%60)+" seconds. Now logging out");
    Chat.say("/logout");
}

function start() { //Allows to start back where you were. Finish the row, and place yourself at the start of the new row
    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());

    //First check the position
    if ((xWest<=currentX)&&(currentX<=xWest+East)&&(zSouth-North<=currentZ)&&(currentZ<=zSouth)) { // Check if you are inside the farm
        if ((currentX==xWest)&&(currentZ==zSouth)) {
            toolSwitch();
            inv.setSelectedHotbarSlotIndex(0);
            equip(solidBlock,1);// Put the solid block in the second slot
            equip("minecraft:torch",2);
            mineAll();
        } else {
            Chat.log("Please, start in the south west corner, and dig one block down");
        }
     } else {
        Chat.log("You are not in the area, make sure you entered the good values in the variable");
    }
}

start();