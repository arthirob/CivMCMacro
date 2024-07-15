const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
var running = true ;
const foodType = "minecraft:baked_potato"; // Change the food to be whatever you prefer to use !
const waitInJump = 3;
var refill = 0;

function eat() {
    if (p.getFoodLevel()<16) {
        const foodList = inv.findItem(foodType);
        if (foodList.length==0) {
            throw("Out of food")
        }
        inv.swapHotbar(foodList[0],2);
        KeyBind.keyBind("key.use", true);
        inv.setSelectedHotbarSlotIndex(2);
        do {
            Client.waitTick(10);
        } while (p.getFoodLevel()<16)
        inv.setSelectedHotbarSlotIndex(0);
    }
}
KeyBind.keyBind("key.forward", true);
KeyBind.keyBind("key.sprint", true);
Client.waitTick(5);
KeyBind.keyBind("key.sprint", true);
while (running) {
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(waitInJump);
    KeyBind.keyBind("key.jump", false);
    Client.waitTick(waitInJump)
    eat();
    p.lookAt((Math.floor((p.getYaw()+22.5)/45))*45,0);
}