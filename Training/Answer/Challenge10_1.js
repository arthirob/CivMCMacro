const p = Player.getPlayer() ;
const inv = Player.openInventory();

const slots = inv.getSlots('main', 'hotbar', 'offhand');
for (const slot of slots) {
    if (slots.includes(slot+1)) {
        inv.swap(slot,slot+1)
        Client.waitTick(4);
    }
}
Chat.log("Script over");
