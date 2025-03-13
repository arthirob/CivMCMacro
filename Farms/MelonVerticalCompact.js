//Only edit those five variable, the rest don't touch
const xLodestone = 4888;
const zLodestone = -6316; 
const lodestoneZDist = 3;
const lodestoneBigZDist = 30;
const yFirstlodestone = 139;
const lastLevel = 319;
const xFrontCompactor = 4893;
const zFrontCompactor = -6316
const xChestCompactor= 4891;
const zChestCompactor= -6314;
const xFurnaceCompactor = 4894;
const zFurnaceCompactor = -6314;
const bunkerY = -62;
const lagTick = 5;
const compactEveryLevel = 4;
const foodType = "minecraft:baked_potato";
const damageTreshhold = 40;
const discordGroup = 'FU-Bot';
const farmName = "Melon farm east of Moscow"
const regrowTime = 16;

//NO TOUCH AFTER THIS POINT
const p = Player.getPlayer() ;
var inv = Player.openInventory();
const steps = 20;
const coeff = makeArray(steps);
const sleepTime = 30;


var originX;
var originZ;
var slots;
var currentLevel;
var harvestedLevel;
var dir;

const startTime = Date.now();

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY(), z+0.5);
}

function equip(item,slot) { // Equip an item in a certain slot
    inv = Player.openInventory();
    list = inv.findItem(item);
    if (list.length==0) {
        World.playSound("entity.elder_guardian.curse", 200);
        throw("No more mats")
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick(lagTick);
}

function toolCheck() { // Check if your tool can be used, and if not, switch it
    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
        throw("No more tool")
    }
}

function eat() {
    if (p.getFoodLevel()<19) {
        inv.setSelectedHotbarSlotIndex(1);
        KeyBind.keyBind("key.use", true);
        do {
            Client.waitTick(10);
        } while (p.getFoodLevel()<19)
        KeyBind.keyBind("key.use", false);
        inv.setSelectedHotbarSlotIndex(0);
    }
}

function walkTo(x, z) { // Walk to the center of a block. If boolean attack is true, make an attack if you are stuck
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.1){
        oldX = p.getX();
        oldZ = p.getZ();
        lookAtCenter(x,z);//Correct the trajectory if needed
        Client.waitTick();
        if (p.distanceTo(oldX,p.getY(),oldZ)<0.01) {//You are stuck in a block
            KeyBind.keyBind("key.forward", false);
            p.attack();
            Client.waitTick(lagTick);
            KeyBind.keyBind("key.forward", true);


        }
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);

    Client.waitTick(3);
    
}

function move(x,z,attack) { //Make you move in a x and z direction
    walkTo(Math.floor(p.getX())+x,Math.floor(p.getZ()+z),attack)
}

function align(){
    move(0,0,true)
}

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

function lodestoneUp(goingUp) {//If true, go up, otherwise go down

    p.lookAt(Math.floor(p.getX())+0.8,p.getY(),Math.floor(p.getZ())+0.8);
    Client.waitTick(lagTick);
    if (goingUp) {
        p.interact();
    } else {
        p.attack();
    }
    Client.waitTick(lagTick)
}


function refill() {
    if (inv.getSlot(45).getCount()==0) { //i slot empty
            equip(seed,45);
    }
}

function toogleSprint() {
    KeyBind.keyBind("key.sprint", true);
    Client.waitTick();
    KeyBind.keyBind("key.sprint", false);
}

function toolCheck() { // Check if your tool can be used, and if not, switch it
    if ((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())<damageTreshhold) {
        toolSwitch();
    }
}

function toolSwitch() { // Function to equip a tool with the silk touch enchant
    const toolList = inv.findItem("minecraft:diamond_axe").concat(inv.findItem("minecraft:netherite_axe"))
    var usableSlot = 0;
    lowestToolDamage = 10000 ;
    for (i=0;i<toolList.length;i++) { // This needs to be correct as well, it's not really efficient to check all tools
        currentToolDamage = inv.getSlot(toolList[i]).getMaxDamage()-inv.getSlot(toolList[i]).getDamage();
        if (currentToolDamage>=damageTreshhold) { // The tool has health remaining
            if (currentToolDamage<lowestToolDamage) {
                usableSlot = toolList[i];
                lowestToolDamage = currentToolDamage;
            }
        } 
    }
    if (usableSlot==0) {
        throw("No more tools to use")
    }
    inv.swapHotbar(usableSlot,0);
    inv.setSelectedHotbarSlotIndex(0);
}


function harvestLine(length,dir){ //Harvest a line in a dir
    align();
    originX = Math.floor(p.getX())
    originZ = Math.floor(p.getZ());
    KeyBind.keyBind("key.attack", true);
    p.lookAt(dir*90,45);
    softLook(dir*90,8);
    KeyBind.keyBind("key.forward", true);
    toogleSprint();
    while (p.distanceTo(originX,p.getY(),originZ)<(length-1)){
        currentX = p.getX();
        currentZ = p.getZ();
        if (p.distanceTo(originX,p.getY(),originZ)>(length-4)){
            KeyBind.keyBind("key.attack", false);
        }
        Client.waitTick();
        if (p.distanceTo(currentX,p.getY(),currentZ)<0.01) {
            Chat.log("You got stucked")
            KeyBind.keyBind("key.forward", false);
            KeyBind.keyBind("key.attack", false);
            KeyBind.keyBind("key.sneak", true);
            Client.waitTick(lagTick);
            KeyBind.keyBind("key.sneak", false);

            p.lookAt(dir*90,45);
            Client.waitTick(lagTick);
            KeyBind.keyBind("key.attack", true);
            softLook(dir*90,8);
            Client.waitTick();
            KeyBind.keyBind("key.forward", true);

        }
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.attack", false);
    toolCheck();
}

function harvestLevel(){//Harvest a full level, line by line
    currentLevel = p.getY();
    walkTo(xLodestone,zLodestone);
    move(-7,0);
    move(0,-2);
    harvestLine(25,1);
    move(-10,4);
    harvestLine(41,-1);
    move(-2,1);
    harvestLine(40,1);
    move(0,4);
    harvestLine(41,-1);
    move(0,1);
    harvestLine(40,1);
    move(0,4);
    harvestLine(41,-1);
    move(-2,-12);
    harvestLine(29,2);
    move(1,0);
    harvestLine(29,0);
    move(4,0);
    harvestLine(31,2);
    move(1,0)
    harvestLine(32,0);
    move(4,0);
    harvestLine(31,2);
    move(1,0);
    harvestLine(28,0);
    move(4,-7);
    harvestLine(20,2);
    move(1,0);
    harvestLine(20,0);
    harvestedLevel++;
    eat();
    walkTo(xLodestone,zLodestone-1);
    walkTo(xLodestone,zLodestone);
    if (harvestedLevel==compactEveryLevel){
        compact(true);
        harvestedLevel=0;
    } else {
        lodestoneUp(true);
    }

}

function goDown(){
    while (p.getY()>=yFirstlodestone){
        if ((p.getY()-yFirstlodestone)%lodestoneBigZDist==0){
            walkTo(xLodestone+1,zLodestone);
        }
        lodestoneUp(false);
        Client.waitTick(lagTick);
    }
    while (p.getY()!=bunkerY){
        lodestoneUp(false);
        Client.waitTick(lagTick);
    }
}

function goUp(){
    while (p.getY()<=(currentLevel-lodestoneBigZDist)) {
        lodestoneUp(true);
        Client.waitTick(lagTick)
    }
    Chat.log("Second walking")
    walkTo(xLodestone,zLodestone)
    while (p.getY()<=currentLevel) {
        lodestoneUp(true);
        Client.waitTick(lagTick)
    }
}

function compact(notFinished){ //Compact the farm. If finished is true, farm is not finished and continue farming
    goDown();
    p.lookAt(-90,0);
    Client.waitTick();
    p.interact();
    walkTo(xFrontCompactor,zFrontCompactor);
    lookAtCenter(xChestCompactor,zChestCompactor);
    Client.waitTick();
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    const slots = inv.getSlots('main', 'hotbar', 'offhand');
    // Put the potatoes in the chest
    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item == "minecraft:melon") {
            inv.quick(slot);
            Client.waitTick();
        }
    }
    inv.close();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    inv.setSelectedHotbarSlotIndex(2);
    lookAtCenter(xFurnaceCompactor,zFurnaceCompactor);
    Client.waitTick(lagTick);
    p.attack();
    Client.waitTick(lagTick);
    if (notFinished) {
        inv.setSelectedHotbarSlotIndex(0);
        walkTo(xLodestone+1,zLodestone);
        goUp();
    }
}


function finishFarm() {
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. It'll be ready again in "+regrowTime+" hours. Now logging out") 
    Chat.say("/logout")
}

function farmMain(){
    while (p.getY()<lastLevel) {
        harvestLevel();
    }
    harvestLevel();
    walkTo(xLodestone,zLodestone-1);
    walkTo(xLodestone,zLodestone);
    compact(false);
    finishFarm();
}

function init(){ //Initialize the hotbar with tool in the first slot, food in the second, stick in the third
    toolSwitch();
    Client.grabMouse();
    equip(foodType,1);
    equip("minecraft:stick",2);
    harvestedLevel=0;
}

function start(){
    if ((Math.floor(p.getX())==xLodestone)&&(Math.floor(p.getZ())==zLodestone)) {
        init();
        currentLevel = p.getY();
        farmMain();
    } else {
        Chat.log("You need to start in the lodestone")
    }
}

start();
