//This script allows to craft stacks of logs into chests. You need to be in front of a crafting bench for it to work, with enough inventory space
var numberofBlock = 4; //The number of logs stacks you want to turn into chest
const fullInv = true;
const p = Player.getPlayer() ;
const blockType = ["minecraft:cobbled_deepslate","minecraft:polished_deepslate","minecraft:deepslate_bricks","minecraft:deepslate_tiles"]
const chestRecipe=[1,2,3,4]
var inv = Player.openInventory();
const goalType = 3;

//Check if you have enough logs
const itemMap = inv.getItemCount();
for (const [key,value] of itemMap) {
    if (key==blockType[0]) {
        if (fullInv) {
            numberofBlock = Math.floor(value/256)*4
        }        
        if (value<(64*numberofBlock)) {
            throw("You need at least "+numberofBlock+" stacks of logs. This value can be edited")
        }
    }
}
//Craft the planks
for (let craftType=0;craftType<goalType;craftType++) {
    Chat.log("Crafting the block "+blockType[craftType+1])
    var deepslateList = inv.findItem(blockType[craftType]);
    for (let i=0;i<=((deepslateList.length/4)-1);i++) {
        for (let j=0;j<4;j++){
            Time.sleep(10);
            inv.swap(deepslateList[(j+i*4)],chestRecipe[j]);
        }
        inv.quick(0);
        Client.waitTick();
    }
    Client.waitTick(10);
}