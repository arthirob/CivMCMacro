const lagTick = 10;
Chat.say("/config");
Client.waitTick(lagTick);
var inv = Player.openInventory();
inv.click(10,0);
Client.waitTick(lagTick);
inv = Player.openInventory();
inv.click(14,0);
Client.waitTick(lagTick);
if (inv.getSlot(14).getItemID()=="minecraft:red_dye") {
    Chat.log("Lodestone config is now jumping")
} else if ((inv.getSlot(14).getItemID()=="minecraft:lime_dye")){
    Chat.log("Lodestone config is now hitting the lodestone")
} else {
    Chat.log("Couldn't change the config")
}
inv.close();