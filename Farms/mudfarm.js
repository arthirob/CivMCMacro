const p = Player.getPlayer()
const abortKey = "s"
minFoodLevel = 14
mainSlot = 1

botMode = "e"

function Tick()
{
	Time.sleep(200)
    checkManualAbort()
    eatCheck()
    grabDirt()
    KeyBind.keyBind("key.use", true);
    Time.sleep(200)
    grabBottle()
    KeyBind.keyBind("key.use", true);
    Time.sleep(300)
    KeyBind.keyBind("key.use", false);
    grabShovel()
    KeyBind.keyBind("key.attack", true);
    Time.sleep(700)
    KeyBind.keyBind("key.attack", false);
    
}


while (botMode != "terminate")
{
    Tick()
    Time.sleep(10)
}

if (botMode = "terminate")
{
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.sneak", false);
    KeyBind.keyBind("key.use", false);
    
    if (terminateReason != "Player has pressed abort key.")
    {
        Chat.say("/logout")
        Chat.say("bot terminated. Reason: " + terminateReason)//Patar15 was here 12/27/2023
    }
    if (terminateReason = "Player has pressed abort key.")
    {
        Chat.log("Bot manually terminated")
    }
    World.playSound("entity.ghast.scream", 100, 0);
}



function checkManualAbort() {
    if (KeyBind.getPressedKeys().contains("key.keyboard." + abortKey)) {
        Chat.log("Player has pressed abort key. Terminating.")
        terminateReason = "Player has pressed abort key."
        botMode = "terminate"
    }
}



function grabShovel() {
    // List of items the bot registers as pickaxes.
    pickaxeItems = ["minecraft:diamond_shovel","minecraft:iron_shovel","minecraft:stone_shovel"]
    // Has the bot found a pickaxe yet?
    pickFound = false
    // Loop through hotbar, stop if end reached or pickaxe is found
    let inv = Player.openInventory()
    

    for (i = 0; i <= 9 && !pickFound; i++) {
        // If a pickaxe is found in the hotbar, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i+36).getItemId())) {
                pickFound = true
                inv.setSelectedHotbarSlotIndex(i);
        }
    }
    for (i = 9; i <= 34 && !pickFound; i++) {//Patar15 was here 12/27/2023 Now checks off hand for block
        // If a pickaxe block is found in the inventory, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i).getItemId())) {

                pickFound = true
                inv.setSelectedHotbarSlotIndex(i);
            
            pickFound = true
            inv.swap(i,mainSlot)
        }
    }
    if (!pickFound) {
        terminateReason = 'Could not find diamond shovel in inventory.'//Patar15 was here 12/27/2023
        botMode = "terminate"
    }
}

function grabDirt() {
    // List of items the bot registers as pickaxes.
    pickaxeItems = ["minecraft:dirt"]
    // Has the bot found a pickaxe yet?
    pickFound = false
    // Loop through hotbar, stop if end reached or pickaxe is found
    let inv = Player.openInventory()
    

    for (i = 0; i <= 9 && !pickFound; i++) {
        // If a pickaxe is found in the hotbar, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i+36).getItemId())) {
                pickFound = true
                inv.setSelectedHotbarSlotIndex(i);
        }
    }
    for (i = 9; i <= 34 && !pickFound; i++) {//Patar15 was here 12/27/2023 Now checks off hand for block
        // If a pickaxe block is found in the inventory, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i).getItemId())) {

                pickFound = true
                inv.setSelectedHotbarSlotIndex(i);
            
            pickFound = true
            inv.swap(i,mainSlot)
        }
    }
    if (!pickFound) {
        terminateReason = 'Could not find diamond shovel in inventory.'//Patar15 was here 12/27/2023
        botMode = "terminate"
    }
}

function grabBottle() {
    // List of items the bot registers as pickaxes.
    pickaxeItems = ["minecraft:glass_bottle","minecraft:potion"]
    // Has the bot found a pickaxe yet?
    pickFound = false
    // Loop through hotbar, stop if end reached or pickaxe is found
    let inv = Player.openInventory()
    

    for (i = 0; i <= 9 && !pickFound; i++) {
        // If a pickaxe is found in the hotbar, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i+36).getItemId())) {
                pickFound = true
                inv.setSelectedHotbarSlotIndex(i);
        }
    }
    for (i = 9; i <= 34 && !pickFound; i++) {//Patar15 was here 12/27/2023 Now checks off hand for block
        // If a pickaxe block is found in the inventory, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i).getItemId())) {

                pickFound = true
                inv.setSelectedHotbarSlotIndex(i);
            
            pickFound = true
            inv.swap(i,mainSlot)
        }
    }
    if (!pickFound) {
        terminateReason = 'Could not find diamond shovel in inventory.'//Patar15 was here 12/27/2023
        botMode = "terminate"
    }
}

validFood = ['minecraft:bread',"minecraft:cooked_porkchop","minecraft:cooked_mutton","minecraft:cooked_salmon","minecraft:cooked_beef",
"minecraft:baked_potato","minecraft:melon_slice","minecraft:carrot","minecraft:cooked_chicken","minecraft:cooked_cod",
"minecraft:cooked_rabbit","minecraft:cookie","minecraft:potato","minecraft:pumpkin_pie","minecraft:glow_berries","minecraft:tropical_fish"
,"minecraft:sweet_berries","minecraft:golden_carrot"]


function grabFood() {
    // Has the bot found a placeable block yet?
    foodFound = false
    // Loop through hotbar, stop if end reached or block is found
    let inv = Player.openInventory()
    for (i = 0; i <= 9 && !foodFound; i++) { //Patar15 was here 12/27/2023 Now checks off hand for food
        // If a placeable block is found in the hotbar, select it and terminate loop
        if (validFood.includes(inv.getSlot(i+36).getItemId())) {
            foodFound = true
            inv.setSelectedHotbarSlotIndex(i);
        }
    }
        for (i = 9; i <= 34 && !foodFound; i++) {//Patar15 was here 12/27/2023 Now checks off hand for block
        // If a placeable block is found in the inventory, select it and terminate loop
        if (validFood.includes(inv.getSlot(i).getItemId())) {
            foodFound = true
            inv.swap(i,mainSlot)
        }
    }
    if (!foodFound) {
        teminateReason = 'Could not find validFood in inventory.'//Patar15 was here 12/27/2023
        botMode = "terminate"
    }
}


function getX() 
{
    return Math.floor(p.getPos().x)
}

function getY() 
{
    return Math.floor(p.getPos().y)
}

function getZ() 
{
    return Math.floor(p.getPos().z)
}



function eatCheck(){
if (p.getFoodLevel() < minFoodLevel) {
            KeyBind.keyBind("key.attack", false);
            Chat.log("Food level low, auto eating");
            grabFood()
            Client.waitTick(10);
            KeyBind.key("key.mouse.right",true)
            Client.waitTick(33);
            KeyBind.key("key.mouse.right",false)
            KeyBind.keyBind("key.attack", true);
            grabPickaxe()
            face()
        }
}
