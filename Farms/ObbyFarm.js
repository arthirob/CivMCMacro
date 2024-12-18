/*
Script to harvest an obby farm
V1.0 by arthirob 12/12/2024

Things to improve
*/

// Constant and variable declaration

const p = Player.getPlayer() ;
var inv = Player.openInventory();
const lagTick = 6; // Edit this depending on your internet connection
const startTime = Date.now();
const destructionX = 4909;
const destructionZ = -2037;
const railStartX = 4902;
const railStartZ = -2042;
const refillX = 4901;
const refillZ = -2049;
const refillChestX = 4904;
const refillChestZ = -2049;
const lodestoneX = 4897;
const lodestoneZ = -2037;
const damageTreshhold = 20 ; //The damage at which point you stop using the tool
const discordGroup = "arthirob"
const hasteLevel = 2;
const appearingLag = 28; //The time it takes for an obby to appear

var emptyBucket;
var bucketRemaining; //A boolean if some bucket remains
var messageSent;
var lavaBucketRemaining;
var thrownBucket;
var totalObby = 0;

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x, z,sneak) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    if (sneak) {
        KeyBind.keyBind("key.sneak", true);

    }
    while ((Math.abs(p.getX() - x - 0.5) > 0.1 || Math.abs(p.getZ() - z - 0.5 ) > 0.1)){
        lookAtCenter(x,z);// Allow trajectory correction
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);

    Client.waitTick(lagTick);
    
}

function move(x,z,sneak) { //Make you move in a x and z direction
    walkTo(Math.floor(p.getX())+x,Math.floor(p.getZ()+z),sneak)
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
    const axe = inv.getSlot(36);
    const enchantHelper = axe.getEnchantment("Efficiency");
    if (enchantHelper != null) {
        effBonus = (enchantHelper.getLevel())**2+1;
    }
    var damage = (8+effBonus)*(1+0.2*hasteLevel)/1500 // See breaking calculation for details, assuming diamond pick
    breakTime = Math.ceil(1/damage)+appearingLag // Needs correction I guess...;
}

function toolCheck() { // Check if your tool can be used, and if not, switch it
    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
        KeyBind.keyBind("key.attack", false);
        toolSwitch();
        KeyBind.keyBind("key.attack", true);

    }
}

function equip(item,slot) { // Equip an item in a certain slot
    list = inv.findItem(item);
    if (list.length==1) {
        bucketRemaining = false;
    }
    if (list.length==0) {
        Chat.log("No more buckets !")
        KeyBind.keyBind("key.use", false);
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick();
}

function lodestoneUp(goingUp) {//If true, go up, otherwise go down
    p.lookAt(0,90);
    Client.waitTick();
    if (goingUp) {
        p.interact();
    } else {
        p.attack();
    }
    Client.waitTick(lagTick)
}

function mine(){ //The function to mine the
    p.lookAt(90,0);
    inv.setSelectedHotbarSlotIndex(0);
    miningTime = Math.ceil(emptyBucket *((breakTime/20)));
    Chat.log(`Starting mining. It should take ${(Math.floor(miningTime/60))} minutes and ${(miningTime%60)} seconds`);
    KeyBind.keyBind("key.attack", true);
    while (p.distanceTo(destructionX+0.5,p.getY(),destructionZ+0.5)<0.5) {
        KeyBind.keyBind("key.attack", true);
        Client.waitTick(10);
        toolCheck();
    }
    KeyBind.keyBind("key.attack", false);
    World.playSound("entity.elder_guardian.curse", 200);
    totalObby+=emptyBucket;
}

function railFinished(){ //Return true if the rail collection is finished
    return (p.distanceTo(railStartX+0.5,p.getY(),railStartZ+0.5)<0.3);
}

function refillBucket() {
    walkTo(refillX+1,refillChestZ,false);
    walkTo(refillX,refillChestZ,false);
    inv.quick(37);
    inv.setSelectedHotbarSlotIndex(1);
    KeyBind.keyBind("key.sneak", true);
    p.lookAt(refillChestX,p.getY()+0.5,refillChestZ);
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    Client.waitTick(lagTick);
    for (slot=0;slot<54;slot++) {
        if (inv.getSlot(slot).getItemID() == `minecraft:bucket`) {
            inv.quick(slot);
        }
    }
    Player.openInventory().close();    
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    emptyBucket = inv.getItemCount().get("minecraft:bucket");
    KeyBind.keyBind("key.sneak", false);
}

function throwLavaBucket(slow) { //Empty all the lava buckets you have. If slow is set to true, wait a bit between each throw
    for (let i = 9; i < 45 ; i++)    {
        if (inv.getSlot(i).getItemID()=="minecraft:lava_bucket") {
            inv.dropSlot(i,true)
            if (slow) {
                Client.waitTick(5);
            }
        }
    }
    Client.waitTick();
}

function collect() { //The function to collect the lava buckets
    walkTo(railStartX,railStartZ-1,false);
    p.lookAt(railStartX+0.5,p.getY()+0.5,railStartZ+0.5);
    Client.waitTick();
    p.interact();
    Client.waitTick(lagTick);
    inv.setSelectedHotbarSlotIndex(1);
    p.lookAt(90,-90);
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.use", true);
    equip("minecraft:bucket",1);
    bucketRemaining = true;
    messageSent = false;
    Client.waitTick(40);
    KeyBind.keyBind("key.forward", false);
    while (!railFinished()) {
        if ((inv.getSlot(37).getItemID()!="minecraft:bucket")&&bucketRemaining) {
            KeyBind.keyBind("key.use", false);
            equip("minecraft:bucket",1);
            KeyBind.keyBind("key.use", true);

        }
        if ((!bucketRemaining)&&(inv.getSlot(37).getItemID()!="minecraft:bucket")&&(!messageSent)) {//You use the last stack of bucket
            KeyBind.keyBind("key.use", false);
            Chat.log("No more buckets !")
            messageSent = true;
            p.lookAt(90,0);
            throwLavaBucket(true);
        }
        Client.waitTick();
    }
    KeyBind.keyBind("key.use", false);
    KeyBind.keyBind("key.sneak", true);

    Client.waitTick(lagTick);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(lagTick);
    p.lookAt(-180,0);   
    Client.waitTick(10);
    throwLavaBucket(false);
    if (!messageSent) { //If no mssage wassent, you still have buckets,so remove them from the count
        emptyBucket = emptyBucket - inv.getItemCount().get("minecraft:bucket");
    }

}



function toCollectFromMine() {
    walkTo(railStartX-2,railStartZ);
    p.lookAt(0,0);
    Client.waitTick();
    p.interact();
    move(0,1.5,false);
    move(-3,0,false);
    walkTo(lodestoneX,lodestoneZ,false);
    lodestoneUp(false);
    move(0,4,false);
    move(14,0,false)
    move(0,-3,false);
    walkTo(destructionX,destructionZ,true);
}

function toMineFromCollect() {
    walkTo(destructionX,destructionZ,true);
    move(2,0,false);
    move(0,4,false);
    move(-14,0,false);
    move(0,-4,false);
    lodestoneUp(true);
    move(0,-3,false);
    move(3,0,false);
    KeyBind.keyBind("key.jump", true);
    move(0,-2,false);
    KeyBind.keyBind("key.jump", false);
    p.lookAt(0,-90);
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
    walkTo(railStartX,railStartZ-1,false);
}

function canceled() {
    return (inv.getSelectedHotbarSlotIndex()==8)
}

function finishFarm() {
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" Obby farm harvested for "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. I mined "+totalObby+" obsidian block") 
    Chat.say("/logout")
}

function main(){
    while (!canceled()) {
        refillBucket();
        collect();
        toCollectFromMine();
        mine();
        toMineFromCollect();
    }
    finishFarm();
}

function start() {
    if (p.distanceTo(railStartX+0.5,p.getY(),railStartZ+0.5)<2) {
        toolSwitch();
        main()
    } else {
        Chat.log("Start near the minecart")
    }

}

start();