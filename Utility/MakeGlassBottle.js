/*
This script allows to turn one CS of sands into CS of glass bottle. Have in your inventory just a stick and a CS of sand
Version 1.0 by arthirob, 30/09/2024
*/

//Constant declaration

//Placement
const xCenter = 4767;
const zCenter = -1979;
const xCompactorInputChest = 4766;
const zCompactorInputChest = -1982;
const xCompactorOutputChest = 4769;
const zCompactorOutputChest = -1982;
const xCompactorFurnace = 4768;
const zCompactorFurnace =-1982;
const xCompactorCrafting = 4767;
const zCompactorCrafting =-1982;
const xSmelterChestInput = 4768; 
const zSmelterChestInput = -1976; 
const xSmelterChestOutput = 4765; 
const zSmelterChestOutput = -1976;
const xSmelterFurnace = 4767;
const zSmelterFurnace = -1976;
const xTempSandChest = 4770;
const zTempSandChest = -1979;
const xTempBottleChest = 4770;
const zTempBottleChest = -1978;
const servTPS = parseInt(World.getServerTPS().substr(0,2));


const p = Player.getPlayer() ;
const lagTick = 10;
const chestRecipe=[1,3,5]
var inv = Player.openInventory();

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function waitSecond(second) {
    Client.waitTick(Math.ceil(400*second/servTPS));
}

function walkSneakTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.1 || Math.abs(p.getZ() - z - 0.5 ) > 0.1)){
        lookAtCenter(x,z);// Allow trajectory correction
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(lagTick);
    
}

function moveSlots(start,end,item) { //Move a certain item to a slot
    inv = Player.openInventory();
    for (let i=start;i<=end;i++) {
        const itemId = inv.getSlot(i).getItemId();
            if (itemId == item) {
                inv.quick(i);
            }
    }

}

function equiStick() {
    listStick = inv.findItem("minecraft:stick");
    if (listStick.length==0) {
        throw("Have a stick in our inventory")
    }
    inv.swapHotbar(listStick[0],8);
}

function decompactSand() {
    lookAtCenter(xCompactorInputChest,zCompactorInputChest);
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    inv.quick(inv.findItem("minecraft:sand")[0]);//Put the sand in the compactor
    Client.waitTick(lagTick);
    Player.openInventory().close();
    Client.waitTick(lagTick);
    lookAtCenter(xCompactorFurnace,zCompactorFurnace);
    Client.waitTick(lagTick);
    p.attack();
}

function smeltSand(startsmelter) { //Unload sand from the compactor, put it in the furnace, and start the furnace
    //Unload the sand from the compactor
    lookAtCenter(xCompactorOutputChest,zCompactorOutputChest);
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    moveSlots(0,53,"minecraft:sand");
    Client.waitTick(lagTick);
    Player.openInventory().close();

    //Place the sand in the smelter
    lookAtCenter(xSmelterChestInput,zSmelterChestInput);
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();
    moveSlots(54,89,"minecraft:sand");
    Client.waitTick(lagTick);
    Player.openInventory().close();
    Client.waitTick(lagTick);

    //Start the smelter if required
    if (startsmelter) {
        lookAtCenter(xSmelterFurnace,zSmelterFurnace);
        Client.waitTick(lagTick);
        p.attack();
        Client.waitTick(lagTick);
    }
}



function craftBottle(compact,start) { //Take the glass in the smelter and make bottles. If compact is true, place them in the compactor. Otherwise, place them in the temp chest
    //Take the glass
    lookAtCenter(xSmelterChestOutput,zSmelterChestOutput);
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
    moveSlots(0,53,"minecraft:glass");
    Client.waitTick(lagTick);
    Player.openInventory().close();
    Client.waitTick(lagTick);

    //Craft the glass bottle
    lookAtCenter(xCompactorCrafting,zCompactorCrafting);
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
    inv = Player.openInventory();

    const glassList = inv.findItem("minecraft:glass");
    for (let i=0;i<=((glassList.length/3)-1);i++) {
        for (let j=0;j<3;j++){
            Client.waitTick();
            inv.swap(glassList[(j+i*3)],chestRecipe[j]);
        }
        inv.quick(0);
    }
    Player.openInventory().close();
    Client.waitTick(lagTick);


    //Place the bottle in the temp chest
    if (compact) {
        lookAtCenter(xCompactorInputChest,zCompactorInputChest);
        Client.waitTick(lagTick);
        p.interact();
        Client.waitTick(lagTick);
        moveSlots(54,89,"minecraft:glass_bottle");
        Client.waitTick(lagTick);
        Player.openInventory().close();
        if (start) { //If you need to start the compactor, hit it
            lookAtCenter(xCompactorFurnace,zCompactorFurnace);
            Client.waitTick(lagTick);
            p.attack();
            Client.waitTick(lagTick);
        }
    } else {
        lookAtCenter(xTempBottleChest,zTempBottleChest);
        Client.waitTick(lagTick);
        p.interact();
        Client.waitTick(lagTick);
        moveSlots(54,89,"minecraft:glass_bottle");
        Client.waitTick(lagTick);
        Player.openInventory().close();
    
    }


}

function emptyTempChest() {
    //Take the glass bottle from the temp chest
    lookAtCenter(xTempBottleChest,zTempBottleChest);
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
    moveSlots(0,53,"minecraft:glass_bottle");
    Client.waitTick(lagTick);
    Player.openInventory().close();
    Client.waitTick(lagTick);


    //Put the glass in the input compactor
    lookAtCenter(xCompactorInputChest,zCompactorInputChest);
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
    moveSlots(54,89,"minecraft:glass_bottle");
    Client.waitTick(lagTick);
    Player.openInventory().close();
}
function switchRecipe(slot) {//Switch between compact and decompact. 0 for compact, 1 for decompact
    lookAtCenter(xCompactorCrafting,zCompactorCrafting);
    Client.waitTick(lagTick);
    p.attack();
    Client.waitTick(lagTick);
    Player.openInventory().click(slot)
    Client.waitTick(lagTick);
    Player.openInventory().close();
}

function checkInv() {//Check if you only have 2 slots in your inventory, otherwise throw an error
    inv = Player.openInventory();
    var freeSlot = 0;
    for (let i=9;i<=44;i++) {
        if(inv.getSlot(i).getItemId()=="minecraft:air"){
            freeSlot++
        }
    }
    if (freeSlot<34) {
        throw("Empty your inventory")
    }
}

function start() { //Start the craft.
    checkInv();
    equiStick();
    inv.setSelectedHotbarSlotIndex(8);
    walkSneakTo(xCenter,zCenter);
    switchRecipe(1);
    decompactSand();
    waitSecond(20); //10 stacks decompacted
    Chat.log("Step 1");
    smeltSand(true);
    waitSecond(20); //10 more
    Chat.log("Step 2");
    smeltSand(false);
    waitSecond(20); // 10 more
    Chat.log("Step 3");
    smeltSand(false);
    craftBottle(false,false);
    waitSecond(60); //30 more
    Chat.log("Step 4");
    smeltSand(false);
    switchRecipe(0);
    craftBottle(true,true);
    emptyTempChest();
    waitSecond(40);
    Chat.log("Step 5");
    craftBottle(true,false);
    waitSecond(40);
    Chat.log("Step 6");
    craftBottle(true,false);
    waitSecond(40);
    Chat.log("Step 7");
    craftBottle(true,false);
    waitSecond(60);
    Chat.log("Step 8");
    craftBottle(true,false);
    Chat.log("Finished the crafting");
}

start();