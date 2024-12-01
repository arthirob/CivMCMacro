const p = Player.getPlayer() ;

p.interact();
Client.waitTick(5);
inv = Player.openInventory();

const slots = inv.getSlots('container', 'main', 'hotbar');

for (const slot of slots) {
    if (slots.includes(slot+1)) {
        inv.swap(slot,slot+1)
        Client.waitTick(4);
    }
}

inv.close();
Chat.log("Script over");



