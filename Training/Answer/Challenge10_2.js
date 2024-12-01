const inv = Player.openInventory();

for (let i=9;i<44;i++) {
        inv.swap(i,i+1)
        Client.waitTick(4);
}
Chat.log("Script over");
