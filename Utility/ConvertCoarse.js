const p = Player.getPlayer() ;
const inv = Player.openInventory();
const damageTreshhold = 20;
const coarseDirt = "minecraft:coarse_dirt" 

function canConvert(){
    return (((inv.getSlot(36).getMaxDamage()-inv.getSlot(36).getDamage())>damageTreshhold)&&(inv.findItem(coarseDirt).length>0))
}

function refill() { //Autofill the offhand slot
    if (inv.getSlot(45).getCount()==0) { //i slot empty
        list = inv.findItem(coarseDirt);
        inv.swap(list[0],45);
        Client.waitTick();
    }
}

function convert() {
    KeyBind.keyBind("key.use", true);
    while (canConvert()) {
        Client.waitTick(19);
        refill();
        KeyBind.keyBind("key.attack", true);
        Client.waitTick(5);
        KeyBind.keyBind("key.attack", false);
    }
    KeyBind.keyBind("key.use", false);
    Chat.log("Finished converting !")

}

convert();