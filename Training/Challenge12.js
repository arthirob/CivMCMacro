const p = Player.getPlayer() ;
const inv = Player.openInventory();
const slots = inv.getSlots('main', 'hotbar', 'offhand');

var toolList = [];
var minimumDamage=10000;
var toolUsedSlot;
for (const slot of slots) {
    if (inv.getSlot(slot).isTool()) {
        toolList.push(slot)
    }
}

for (tool of toolList) {
    if (inv.getSlot(tool).getMaxDamage()-inv.getSlot(tool).getDamage()<minimumDamage) {
        toolUsedSlot = tool;
        minimumDamage = inv.getSlot(tool).getMaxDamage()-inv.getSlot(tool).getDamage()
    }

}
if (toolUsedSlot==undefined) {
    throw("You don't have any tool")
} else {
    inv.swapHotbar(toolUsedSlot,0);
}
Chat.log("Script over");



