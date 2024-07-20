//This script allows to craft stacks of logs into chests. You need to be in front of a crafting bench for it to work, with enough inventory space
const numberOfLog = 4; //The number of logs stacks you want to turn into chest
const p = Player.getPlayer() ;
const woodType = "oak"
const chestRecipe=[1,2,3,4,6,7,8,9]
var inv = Player.openInventory();


//Check if you have enough inventory room
if ((36-inv.getItems('main', 'hotbar', 'offhand').length-3*numberOfLog)<1) {//Each stacks of log is going to take 3 more spot when turned into planks
    throw("Not enough inventory space");
}
//Check if you have enough logs
const logType = "minecraft:"+woodType+"_log";
const itemMap = inv.getItemCount();
for (const [key,value] of itemMap) {
    if (key==logType) {
        if (value<(64*numberOfLog)) {
            throw("You need at least "+numberOfLog+" stacks of logs. This value can be edited")
        }
    }
}

//Open the crafting table
p.interact();
Client.waitTick(5);

//Check if you are in a crafting table
inv = Player.openInventory();

if (inv.getType()!="Crafting Table") {
    throw("You need to face a crafting table");
}
const logList = inv.findItem(logType); //The slot needs to be calculated again after the crafting bench is open

//Craft the planks
for (let i=0;i<logList.length;i++) {
    inv.swap(logList[i],1);
    Client.waitTick();
    inv.quick(0);
    Client.waitTick();
}

//Craft the chests
const plankType = "minecraft:"+woodType+"_planks";
var plankList = inv.findItem(plankType);
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