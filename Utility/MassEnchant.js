//This script allows to craft stacks of logs into chests. You need to be in front of a crafting bench for it to work, with enough inventory space
const p = Player.getPlayer() ;
const inputX = 1551;
const inputZ = 59;
const emeraldX = 1553;
const emeraldZ = 56;
const enchantingX = 1549;
const enchantingZ = 57;
const outputX = 1551 ;
const outputZ = 55;
const lagTick = 5;
const toolPerRound = 5; //The number of tools you want to enchant per round

//No touching after here

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}




//Check if you are in a crafting table
inv = Player.openInventory();

function enchant() {
    if (inv.getType()!="Enchantingz Table") {
        throw("You need to face a crafting table");
    }

}

function equip(item,slot) { // Equip an item in a certain slot
    inv = Player.openInventory();
    list = inv.findItem(item);
    if (list.length==0) {
        World.playSound("entity.elder_guardian.curse", 200);
        throw("No more mats")
    }
    inv.swapHotbar(list[0],slot);
    Client.waitTick(lagTick);
}

function equipLapis(){ //Equip lapis on the second slot, but have at least two stacks
    inv = Player.openInventory();
    list = inv.findItem("minecraft:lapis_lazuli");
    slot = 0;
    for (let i=0;i<list.length;i++){
        if(inv.getSlot(list[i]).getCount()>16) {
            slot = list[i];
        }
    }
    if (slot==0) {
        throw("No more lapis")
    } else {
        inv.swapHotbar(slot,1);
    }

}

function countTools() { //Returns the number of tools that are ready to be enchanted
    inv = Player.openInventory();
    slots = inv.getSlots('main', 'hotbar');
    tools = 0;
    for (slot of slots) {
        if (inv.getSlot(slot).isDamageable()&&(!inv.getSlot(slot).isEnchanted())) {
            tools++
        }
    }
    return tools
}

function takeTools() {
    tools = countTools();
    lookAtCenter(inputX,inputZ);
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    slots = inv.getSlots('container');
    for (slot of slots) {
        if (inv.getSlot(slot).isDamageable()&&(tools<toolPerRound)) {
            tools++
            inv.quick(slot);
            Client.waitTick();
        }
    }
    inv.close();
    Client.waitTick(lagTick);
}

function exp(){
    equip("minecraft:emerald",0);
    equipLapis();
    inv.setSelectedHotbarSlotIndex(0);
    p.lookAt(0,90);
    Client.waitTick(lagTick);
    for (let i=0;i<16;i++) {
        p.interact();
        Client.waitTick(lagTick);
    }
    inv.setSelectedHotbarSlotIndex(1);
}


function enchantATool(){//Enchant a tool in your inv. Return true for a success, false for a fail
    exp();
    lookAtCenter(enchantingX,enchantingZ);
    Client.waitTick(lagTick)
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    Client.waitTick(lagTick);
    toolSlot = 0 ; //The tool of the slot you want to enchant
    slots = inv.getSlots('main','hotbar');
    
    Chat.log(slots[3])
    for (slot of slots){
        Chat.log(slot)
        if (inv.getSlot(slot).isDamageable()&&(!inv.getSlot(slot).isEnchanted())) {
            Chat.log(slot)
            toolSlot = slot ;
        }
    }
    if (toolSlot==0) {
        Chat.log("no tool")
        return false
    }
    inv.quick(toolSlot);
    Client.waitTick()
    inv.quick(inv.findItem("minecraft:lapis_lazuli")[0]);
    Client.waitTick(lagTick);
    inv.doEnchant(2);
    Client.waitTick(lagTick);
    inv.close();
}

function enchantAllTool(){
    numberOfTool = countTools();
    for (let i=0;i<numberOfTool;i++) {
        refillConsumable();
        enchantATool();
    }
}

function refillConsumable(){
    inv = Player.openInventory();
    Client.waitTick()
    emeraldCount = inv.getItemCount().get("minecraft:emerald");
    lapisCount = inv.getItemCount().get("minecraft:lapis_lazuli");
    if ((emeraldCount<16)||(lapisCount<16)) {
        lookAtCenter(emeraldX,emeraldZ);
        Client.waitTick(lagTick);
        p.interact();
        Client.waitTick(lagTick);
        inv = Player.openInventory();
        if (emeraldCount<16) {
            inv.quick(inv.findItem("minecraft:emerald")[0]);
            Client.waitTick();
        }
        if (lapisCount<16) {
            inv.quick(inv.findItem("minecraft:lapis_lazuli")[0]);
            Client.waitTick()
        }
    }
    Client.waitTick(lagTick);   
    inv.close();
    Client.waitTick(lagTick)
    inv = Player.openInventory();
    emeraldCount = inv.getItemCount().get("minecraft:emerald");
    lapisCount = inv.getItemCount().get("minecraft:lapis_lazuli");
    if ((emeraldCount<16)||(lapisCount<16)) {
        throw("Error, out of lapis or emerald")
    }
}

function emptyTool(){
    lookAtCenter(outputX,outputZ);
    Client.waitTick();
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    slots = inv.getSlots('main','hotbar');
    for (slot of slots) {
        if (inv.getSlot(slot).isDamageable()&&inv.getSlot(slot).isEnchanted()) {
            inv.quick(slot);
            Client.waitTick();
        }
    }
    inv.close();
    Client.waitTick(lagTick);
}

function main(){
    while (true){
        takeTools();
        enchantAllTool();
        emptyTool();
    }
}
equipLapis();