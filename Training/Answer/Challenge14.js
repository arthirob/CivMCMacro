//This must be executed when facing a crafting bench

const p = Player.getPlayer() ;
var inv = Player.openInventory();
const chestRecipe=[1,2,3,4,6,7,8,9]
logSlot = inv.findItem("minecraft:birch_log")[0];

//Craft the planks
inv.click(logSlot,0) //Take the logs
Client.waitTick(3);
inv.click(1,1)
inv.click(1,1)//Place two in the crafting square
Client.waitTick(3);
inv.quick(0); //Take the plank
inv.click(logSlot,0) //Put back the remaining logs

Client.waitTick(10);
p.interact()
Client.waitTick(10);

inv = Player.openInventory();

if (inv.getType()!="Crafting Table") {
    throw("You need to face a crafting table");
}
plankSlot = inv.findItem("minecraft:birch_planks")[0];
inv.click(plankSlot,0) //Take the planks

for (let j=0;j<8;j++){
    Time.sleep(10);
    inv.click(chestRecipe[j],1);
}
inv.click(plankSlot,0) //Put back the planks remaining
inv.quick(0);

Chat.log("Script over");