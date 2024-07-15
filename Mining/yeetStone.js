const inv = Player.openInventory();
const toDump = ["minecraft:stone","minecraft:cobblestone","minecraft:tuff","minecraft:moss_block","minecraft:diorite","minecraft:granite","minecraft:smooth_basalt","minecraft:cobbled_deepslate","minecraft:calcite","minecraft:andesite","minecraft:deepslate"]

for (let i = 9; i < 45 ; i++) {
        if (toDump.includes(inv.getSlot(i).getItemID())) {
                inv.dropSlot(i,true)
                Client.waitTick();
            }
}