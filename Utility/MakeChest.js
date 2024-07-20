//This script allows to craft stacks of logs into chests. You need to be in front of a crafting bench for it to work, with enough inventory space
const numberOfLog = 4; //The number of logs you want to turn into chest
const p = Player.getPlayer() ;
const logType = "oak"
const chestRecipe=[1,2,3,4,6,7,8,9]
var inv = Player.openInventory();
const lagTick = 2;


//Check if you have enough inventory room
if ((36-inv.getItems('main', 'hotbar', 'offhand').length-3*numberOfLog)<1) {//Each stacks of log is going to take 3 more spot when turned into planks
    throw("Not enough inventory space");
}
//Check if you have enough logs
const blockType = "minecraft:"+logType;
var logList = inv.findItem((blockType+"_log"));
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
logList = inv.findItem((blockType+"_log")); //The slot needs to be calculated again after the crafting bench is open

//Craft the planks
for (let i=0;i<numberOfLog;i++) {
    inv.swap(logList[i],1);
    Client.waitTick(lagTick);
    inv.quick(0);
    Client.waitTick(lagTick);
}

//Craft the chests
var plankList = inv.findItem((blockType+"_planks"));
if (plankList.length<8) {
    throw("Not enough planks")
}

for (let i=0;i<(plankList.length/8);i++) {
    for (let j=0;j<8;j++){
        inv.swap(plankList[j+i*8],chestRecipe[j]);
    }
    inv.quick(0);
    Client.waitTick();
}

Client.waitTick(10);
Client.waitTick();
