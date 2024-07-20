//This script allows to craft stacks of logs into chests. You need to be in front of a crafting bench for it to work
const numberOfLog = 2;
const p = Player.getPlayer() ;
const logType = "minecraft:spruce"
const chestRecipe=[1,2,3,4,6,7,8,9]
var inv = Player.openInventory();
const lagTick = 2;


//Check if you have enough logs
var logList = inv.findItem((logType+"_log"));
if (logList.length<numberOfLog) {
    throw("You need at least "+numberOfLog+" stacks of logs. This value can be edited");
}
p.interact();
Client.waitTick(lagTick);

//Check if you are in a crafting table
inv = Player.openInventory();
if (inv.getType()!="Crafting Table") {
    throw("You need to face a crafting table");
}
logList = inv.findItem((logType+"_log")); //The slot needs to be calculated again after the crafting bench is open


//Craft the planks
for (let i=0;i<numberOfLog;i++) {
    Chat.log(logList[i]);
    inv.swap(logList[i],1);
    Client.waitTick(lagTick);
    inv.quick(0);
    Client.waitTick(lagTick);
}

//Craft the chests
var plankList = inv.findItem((logType+"_planks"));
if (plankList.length<8) {
    throw("Not enough planks")
}
Chat.log("Before for and list is "+plankList.length);
for (let i=0;i<(plankList.length/8);i++) {
    Chat.log("In the for");
    for (let j=0;j<8;j++){
        inv.swap(plankList[j+i*8],chestRecipe[j]);
    }
    inv.quick(0);
    Client.waitTick();
}

Client.waitTick(10);
Client.waitTick();
