//This script allows to craft stacks of logs into chests. You need to be in front of a crafting bench for it to work, with enough inventory space
const numberOfLog = 4; //The number of logs stacks you want to turn into chest
const p = Player.getPlayer() ;
const woodTypes = ["spruce", "jungle", "oak"]; // Add all you want to craft
const chestRecipe=[1,2,3,4,6,7,8,9]
var inv = Player.openInventory();


//Check if you have enough inventory room
if ((36-inv.getItems('main', 'hotbar', 'offhand').length-3*numberOfLog)<1) {//Each stacks of log is going to take 3 more spot when turned into planks
    throw("Not enough inventory space");
}
//Check if you have enough logs
var woodType = woodTypes[0];
var logType = "minecraft:"+woodType+"_log";
var logTypes = [];
for (let i = 0; i < woodTypes.length; i++) {
	logTypes.push("minecraft:"+woodTypes[i]+"_log");
}

const itemMap = inv.getItemCount();
var foundLog = false;
for (const [key,value] of itemMap) {
	if (logTypes.includes(key)) {
		logType = key;
		foundLog = true ;
        if (value<(64*numberOfLog)) {
            throw("You need at least "+numberOfLog+" stacks of logs. This value can be edited")
        }
	}
}
if (!foundLog) {
    throw("You forgot to took any log !")
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
for (let i=0;i<numberOfLog;i++) {
    inv.swap(logList[i],1);
    Client.waitTick();
    inv.quick(0);
    Client.waitTick();
}

Client.waitTick(5);
// Get the list of full stacks of planks
const plankType = "minecraft:"+woodType+"_planks";
var plankTypes = [];
for (let i = 0; i < woodTypes.length; i++) {
	plankTypes.push("minecraft:"+woodTypes[i]+"_planks");
}

var plankList = [];
const slots = inv.getSlots('main', 'hotbar', 'offhand');
for (const slot of slots) {
    const item = inv.getSlot(slot);
    //if (item.getItemId() == plankType) {
	if (plankTypes.includes(item.getItemId())) {
        if (item.getCount()==64) {
            plankList.push(slot);
        }
    }
}

//This shouldn't happen
if (plankList.length<8) {
    throw("Not enough planks")
}

//Craft the chests

for (let i=0;i<=((plankList.length/8)-1);i++) {
    for (let j=0;j<8;j++){
        Time.sleep(10);
        inv.swap(plankList[(j+i*8)],chestRecipe[j]);
    }
    inv.quick(0);
    Client.waitTick();
}

Client.waitTick(5);

inv.close();
