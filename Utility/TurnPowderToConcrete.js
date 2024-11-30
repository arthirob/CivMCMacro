// Script to make a floor
// To make the floor, start on the north west corner, define the size of it, and have your mats in the first slot
const p = Player.getPlayer() ;
const inv = Player.openInventory();
const color = "white"

//No touching below this point
const concreteBlock = "minecraft:"+color+"_concrete_powder"

function placeFillOffhand() { //Autofill the offhand slot
    p.interact();
    Client.waitTick();
    if (inv.getSlot(45).getCount()==0) { //i slot empty
        list = inv.findItem(concreteBlock);
        Chat.log(list.length);
        if (list.length==0) {
            World.playSound("entity.elder_guardian.curse", 200);
            throw("No more mats")
        }
        inv.swap(list[0],45);
        Client.waitTick();
    }
}

function haveConcrete() {
    return (inv.findItem(concreteBlock).length>0);
}

function convert() {
    KeyBind.keyBind("key.attack", true);
    while (haveConcrete) {
        placeFillOffhand();
    }
    KeyBind.keyBind("key.attack", false);

}

convert();