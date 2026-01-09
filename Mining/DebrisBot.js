/*Script to dig a debris tunnel
V1.1 by arthirob & Jaydon_, 27/12/2025 
You need at least one stack of netherrack to start the script, and usable tools
You need to have the script which triggers on event message

Mssage on heart loss

Things to improve
*/


// Variable and constant declaration

// JS macro stuff, don't touch
const p = Player.getPlayer();
const im = Player.getInteractionManager();
const inv = Player.openInventory();

//What you should modify
const dir = ((Math.floor((p.getYaw() + 225) / 90))) % 4 - 2;; // -1 for east, 0 for south, 1 for west and -2 for north
const rotationSpeed = 15;//The speed at which you turn. Lower will make you rotate faster, but loose more stone
const discordGroup = 'FU-Bot';
const discordId = 246680603100053504;
const damageTreshhold = 25; //The damage at which you want to stop using your tool
const abortKey = "o";
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
const toolType = "minecraft:diamond_pickaxe"; // Can be "shovel" or "pickaxe" depending on what you dig
const toDump = ["minecraft:basalt", "minecraft:netherrack", "minecraft:blackstone"]
const messageOnPick = false; //Also sends a message when you are switching pick
const alignAndEmpty = 5;//Empty your inv every this amount of block.
const rackSwitch = false; //Stop when you are outside of a netherrack trench

// Don't touch those variables, they are used during the script to track execution
GlobalVars.putInt("debris",0);
var shouldTerminate = false;
const steps = 10;
const sleepTime = 10;
const coeff = makeArray(steps);
var currentX; //X at the start of the script
var currentZ; //Y at the start of the script
var prevX; //Allows to check if X changed
var prevZ; //Allows to check if Z changed
var stuck; //Check if you are stuck in a block
var stuckHit = 0;// If you are stuck on a block you need to break, make the breaktime higher each try
var inBasalt = false;
var toolRemains = true;
var fullHealth = true;
var toolDura;
var currentAlign;
var remainingTools;
const breakTime = 1;
const solidBlock = "minecraft:netherrack"
const startTime = Date.now();

//Smooth looking stuff, no touchin !
function binomial(n, k) {
    if ((typeof n !== 'number') || (typeof k !== 'number')) 
 return false; 
   var coeff = 1;
   for (var x = n-k+1; x <= n; x++) coeff *= x;
   for (x = 1; x <= k; x++) coeff /= x;
   return coeff;
}

function makeArray(size){
    var coefficient = Array(size);
    for (let i=0;i<size;i++) {
        coefficient[i] = binomial(size-1,i)/(2**(size-1)) ;
    }
    return coefficient
}

function softLook(yawGoal,pitchGoal) {
    currentYaw=p.getYaw();
    difYaw = yawGoal - currentYaw ;
    if (difYaw>180) {
        difYaw-=360;
    }
    if (difYaw<-180) {
        difYaw+=360;
    }
    currentPitch = p.getPitch();
    difPitch = pitchGoal - currentPitch;
    for (let i=0;i<steps;i++) {
        currentYaw+=difYaw*coeff[i];
        currentPitch += difPitch*coeff[i];
        p.lookAt(currentYaw,currentPitch);
        Time.sleep(sleepTime);
    }
}

function equip(item, slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length == 0) {
        throw ("No more mats")
    }
    inv.swapHotbar(list[0], slot);
    Client.waitTick();
}

function checkManualAbort() { // Function to check if the abort key is pressed
    if (KeyBind.getPressedKeys().contains("key.keyboard." + abortKey)) {
        shouldTerminate = true
        Chat.log(" Player has pressed abort key ('" + abortKey.toUpperCase() + "'). Terminating script now")
    }
}


function eat() {
    if (p.getFoodLevel()<16) {
        if (inv.getSlot(38).getItemId()!=foodType) {
            equip(foodType,2);
        }
        inv.setSelectedHotbarSlotIndex(2);
        KeyBind.keyBind("key.use", true);
        do {
            Client.waitTick();
        } while (p.getFoodLevel()<16)
        inv.setSelectedHotbarSlotIndex(0);
        KeyBind.keyBind("key.use", false);
    }
}

function placeFill(i) { //Autofill the i slot
    item = inv.getSlot(36 + i).getItemId();
    inv.setSelectedHotbarSlotIndex(i);
    Client.waitTick();
    p.interact();
    Client.waitTick();
    if (inv.getSlot(36 + i).getCount() == 0) { //i slot empty
        list = inv.findItem(item);
        Chat.log(list.length);
        if (list.length == 0) {
            Chat.log("Out of materials")
            throw ("No more mats")
        }
        inv.swapHotbar(list[0], i);
        Client.waitTick();
    }
}

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x + 0.5, p.getY() + 0.5, z + 0.5);
}

function walkTo(x, z, sneak) { // Walk to the center of a block
    lookAtCenter(x, z);
    if (sneak) {
        KeyBind.keyBind("key.sneak", true);

    }
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x + 0.5, p.getY(), z + 0.5) > 0.05) {
        lookAtCenter(x, z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(3);

}

function pickSwitch() { //Function to switch to the lowest durability pickaxe still usable
    toolList = inv.findItem(toolType)
    var usableSlot = 0;
    remainingTools = 0;
    lowestToolDamage = 10000;
    for (i = 0; i < toolList.length; i++) { // This needs to be correct as well, it's not really efficient to check all tools
        currentToolDamage = inv.getSlot(toolList[i]).getMaxDamage() - inv.getSlot(toolList[i]).getDamage()
        if (currentToolDamage >= damageTreshhold) { // The tool has health remaining and doesn't have silktouch
            remainingTools++;
            if (currentToolDamage < lowestToolDamage) {
                usableSlot = toolList[i];
                lowestToolDamage = currentToolDamage;
            }
        }
    }
    if (usableSlot == 0) {
        toolRemains = false;
        Chat.say("/g " + discordGroup + " You are out of tools")
    } else {
        if (messageOnPick) {
            Chat.say("/g " + discordGroup + " You switched pick")
        }
    }
    inv.swapHotbar(usableSlot, 0);
}

function toolCheck() { // Check if your tool can be used, and if not, switch it, but keep some dura on your last pick
    if (remainingTools>=2) { //You have more than 2 tools remaining, use it until the end
        if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
           pickSwitch();
        }
    } else {
        if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold*inv.findItem(toolType).length) {
            toolRemains = false ;
            Chat.say("/g " + discordGroup + " You are out of tools")
        }
    }
}

function dumpBlock() { //Throw the useless blocks behind you
    softLook(90 * (dir + 2), 0);
    Client.waitTick(3);
    for (let i = 9; i < 35; i++) {
        if (toDump.includes(inv.getSlot(i).getItemId())) {
            inv.dropSlot(i, true)
            Client.waitTick();
        }
    }
    softLook(90 * dir, 0);
}

function mineAWall() { //Mine a wall and set the basalt variable to true if you are hitting basalt
    toolDura = inv.getSlot(36).getDamage();
    KeyBind.keyBind("key.attack", true);
    KeyBind.keyBind("key.sneak", true);
    currentX = Math.floor(p.getX());
    currentZ = Math.floor(p.getZ());
    for (let j = -1; j <= 1; j = j + 2) {//Do one side, then the other
        for (let i = -90; i < 60; i++) {
            p.lookAt((dir + j) * 90, i);
            Time.sleep(rotationSpeed);
        }
    }

    KeyBind.keyBind("key.attack", false);
    if (rackSwitch) {
        if ((inv.getSlot(36).getDamage() - toolDura) < 10) { //Your item dura didn't change
            softLook(0, 90);//Look at your feet
            Client.waitTick();
            KeyBind.keyBind("key.pickItem", true);
            Client.waitTick(3);
            KeyBind.keyBind("key.pickItem", false);
            Client.waitTick(3);
                if ((inv.getSelectedHotbarSlotIndex() != 1)||(inv.getSlot(37).getItemId()!=solidBlock)) { //You are not in netherrack !!!
                Chat.log("selected slot is"+inv.getSelectedHotbarSlotIndex());
                Chat.log("ID block is ")
                Chat.log("You are not in netherrack")
                inBasalt = true;
                Chat.say("/g " + discordGroup + " You are not in netherrack anymore")
            }
            inv.setSelectedHotbarSlotIndex(0);
            Client.waitTick();

        }
    }
}

function stuckType() { // Tell if you are bumping on a block or stuck on the edge of a block
    Chat.log("checktype")
    if (dir == 0) {
        currentZ = p.getZ();
        if ((currentZ - Math.floor(currentZ)) > 0.5) {
            type = "wall"
        } else {
            type = "hole"
        }
    }
    if (dir == -2) {
        currentZ = p.getZ();
        if ((currentZ - Math.floor(currentZ)) < 0.5) {
            type = "wall"
        } else {
            type = "hole"
        }
    }
    if (dir == 1) {
        currentX = p.getX();
        if ((currentX - Math.floor(currentX)) < 0.5) {
            type = "wall"
        } else {
            type = "hole"
        }
    }
    if (dir == -1) {
        currentX = p.getX();
        if ((currentX - Math.floor(currentX)) > 0.5) {
            type = "wall"
        } else {
            type = "hole"
        }
    }
    return type

}

function unstuck() { //If you are stuck, you are either hitting a block, or on the edge of a block
    KeyBind.keyBind("key.forward", false);
    if (stuckType() == "hole") {
        softLook((dir - 2) * 90, 80);
        Client.waitTick();
        inv.setSelectedHotbarSlotIndex(1);
        Client.waitTick();
        placeFill(1);
        softLook(dir * 90, 0);
        Client.waitTick();
        inv.setSelectedHotbarSlotIndex(0);
    } else {
        softLook(dir * 90, 14);
        im.attack(); //Try to hit a quick punch
        Client.waitTick();
        prevX = p.getX();
        prevZ = p.getZ();
        KeyBind.keyBind("key.forward", true);
        Client.waitTick(5);
        KeyBind.keyBind("key.forward", false); //Move forward a bit. If you didn't move, the block is harder
        if (p.distanceTo(prevX, p.getY(), prevZ) < 0.1) {
            Chat.log("You bumped into an hard block")
            softLook(dir * 90, 14);
            KeyBind.keyBind("key.attack", true);
            Client.waitTick(50);
            KeyBind.keyBind("key.attack", false);
        }
    }
    KeyBind.keyBind("key.forward", true);
}

function checkHealth(){
    if (p.getHealth()!=20) {
        fullHealth = false;
        Chat.say(`/g ${discordGroup} <@${discordId}> Watch out ! You took damage`)
    }
}

function walkForward() {
    KeyBind.keyBind("key.sneak", true);

    softLook(dir * 90, 14);
    Client.waitTick();
    originX = Math.floor(p.getX())+0.5;
    originZ = Math.floor(p.getZ())+0.5;
    prevX = originX;
    prevZ = originZ;
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.attack", true);
    Client.waitTick(10  );
    KeyBind.keyBind("key.attack", false);
    Client.waitTick();
    while (p.distanceTo(originX, p.getY(), originZ) < 0.9) {
        prevZ = p.getZ();
        prevX = p.getX();
        Client.waitTick(2);
        if (p.distanceTo(prevX, p.getY(), prevZ) < 0.05) {
            stuckHit++;
            if (stuckHit > 5) {
                unstuck();
            }
        } else {
            stuckHit = 0;
        }
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick();
}

function placePerfect() {
    walkTo(Math.floor(p.getX()), Math.floor(p.getZ()), true);
    softLook(dir*90, 0);
}

function init() {
    placePerfect();
    pickSwitch();
    inv.setSelectedHotbarSlotIndex(0);
    equip(solidBlock, 1);// Put the solid block in the second slot
    currentAlign = 0;
}

function finishBot(){
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" Your debris bot is finished in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. You harvested "+ GlobalVars.getInt("debris") +" debris. Now logging out") 
    Chat.say("/logout")
}

function start() { //Allows to start back where you were. Finish the row, and place yourself at the start of the new row
    init();
    while ((!inBasalt) && toolRemains && fullHealth && (!shouldTerminate)) {
        mineAWall();
        toolCheck();
        walkForward();
        eat();
        checkHealth();
        checkManualAbort();
        if (currentAlign>=alignAndEmpty) {
            placePerfect();
            dumpBlock();
            currentAlign = 1 ;
        } else {
            currentAlign ++;
        }
  
    }
    finishBot();
}

start();