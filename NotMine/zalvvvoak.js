const zNorth = -5391-1;
//const zNorth = -5255-1;
const zSouth = -5251 -1;
//const xEast = 3914;
const xEast = Math.trunc(Player.getPlayer().getX());
const xWest = 3604;

//Checks if AutoJump is enabled, throws an error if it is.
function getAutoJump()
{
    var gameOptions = Client.getGameOptions(); //We need to get the options class...
    var gameOptionsRaw = gameOptions.getRaw(); //and then get the raw versions ...
    return gameOptionsRaw.field_1848; //Return the value of autoJump according to Yarn mappings...
}

const p = Player.getPlayer();

const tool = "minecraft:diamond_axe";
const sapling = "minecraft:oak_sapling";

let chopLocation = 0;

let axeLocation = 36;
let axeInHotbar = 1;

/* ONLY MODIFY THESE TWO VARIABLES:
   Modifying line changes which row you want to start at (rows 0-28)
   Modifying food changes which type of food you will consume when hungar sets in*/
let line = 0;
const food = "minecraft:baked_potato";
/* --------------------------------------------------------------------*/
let ylevel = 83;

/*
https://discord.com/channels/732004268948586545/745273698428387389/880942114681270273
Thanks to the wonderful people at the jsmacro discord for giving this function
This fixes the issues where if you tab out the client only clicks once
*/

// Copied from MechanicalRift's obbybot.js script
function grabMouse() {
  try {
    // Client Class
    let minecraftClass = Reflection.getClass("net.minecraft.class_310");

    // Mouse Handler Field
    let mouseHandlerField = Reflection.getDeclaredField(minecraftClass, "field_1729");
    mouseHandlerField.setAccessible(true);

    //Use reflection to grab mouse:
    let clientInstance = Client.getMinecraft();

    // Mouse Handler
    let mouseHandlerObj = mouseHandlerField.get(clientInstance);

    // Mouse Handelr Class
    let mouseClass = Reflection.getClass("net.minecraft.class_312");

    // Lock Mouse / grab Mouse Boolean Field
    let lockMouse = Reflection.getDeclaredField(mouseClass, "field_1783");
    lockMouse.setAccessible(true);

    // Grab mouse
    lockMouse.setBoolean(mouseHandlerObj, true);
  } catch (e) {
    Chat.log("Failed to capture mouse: " + e);
  }
}

/* Gets items from the player hotbar */
function getItemInHotbar(item)
{
    const inv = Player.openInventory();
    for (let i = 0; i < 9; i++)
    {
        if (inv.getSlot(i+36).getItemID() == item)
        {
            if (item == tool && (inv.getSlot(i+36).getDamage() < 1541))
            {
                axeLocation = 36+i;
                inv.setSelectedHotbarSlotIndex(i);
                break;
            }
            else if (item != tool)
            {
                inv.setSelectedHotbarSlotIndex(i);
                break;
            }
        }
        else if (i == 8)
        {
            if (item == tool)
            {
                axeInHotbar = 0;
            }
            playerInventory(item);
        }
        Client.waitTick();
    }
    inv.close();
}

/* If item is not found in player hotbar, then
the bot will search from the player's main inventory */
function playerInventory(item)
{
    const inv = Player.openInventory();

    if (axeInHotbar == 0)
    {
        inv.setSelectedHotbarSlotIndex(0);
    }

    for (let i = 9; i < 45; i++)
    {

        if (inv.getSlot(i).getItemID() == item)
        {

            if (item == tool && inv.getSlot(i).getDamage() < 1541)
            {
                axeInHotbar = 1;
                inv.swap(i, axeLocation);
                break;
            }
            else if (item == food)
            {
                inv.swap(i, (axeLocation+1)%9+36);
                break;
            }
            else if (item == sapling)
            {
                inv.swap(i, (axeLocation+2)%9+36);
                break;
            }
        }
        Client.waitTick();
    }
    inv.close();
}

/* Swap axe function when durability of current axe held falls
below a certain health threshold */
function axeSwap()
{
    const inv = Player.openInventory();

    for (let i = 9; i < 45; i++)
    {
        if ((inv.getSlot(i).getItemID() == tool) && (inv.getSlot(i).getDamage() < 1541))
        {
            Chat.log("Swapping axes");

            inv.swap(i, axeLocation);
            Client.waitTick(60);
            break;
        }
        Client.waitTick();
    }
}

/* Counts the total amount of items through the amount of inventory slots
the items occupy in the player's inventory */
function countItemInInventory(item)
{
    const inv = Player.openInventory();
    let count = 0;
    for (let i = 9; i < 45; i++)
    {
        if ((item == tool && inv.getSlot(i).getItemID() == item) && (inv.getSlot(i).getDamage() < 1541))
        {
            count++;
        }
        else if ((inv.getSlot(i).getItemID() == item) && item != tool)
        {
            count++;
        }
    }
    return count;
}

/* Player automatically eats food when hunger bar falls below 10.0 points */
function eatFood()
{
    if (countItemInInventory(food) == 0)
    {
        Chat.log("/g fu-bot BOT HAS RUN OUT OF FOOD TO EAT FOR THE OAK TREE FARM! LOGGING OUT!");
        Client.waitTick();
        Chat.log("/g fu-bot Player was on Row: "+line);
        //Chat.log("/logout");
        Time.sleep(11000);
    }

    getItemInHotbar(food);

    KeyBind.keyBind("key.use", true);

    while (true)
    {
        if (p.getFoodLevel() >= 20)
        {
            break;
        }
        else
        {
            Client.waitTick();
        }
    }

    KeyBind.keyBind("key.use", false);
}

/* The function directs the player to move along a certain row (line)
and chop trees in that direction until it reaches the edge of the farm */
function chop()
{
    chopLocation = zSouth + 0.80;

    p.lookAt(180, 5);

    Client.waitTick(20);

    Chat.log("Chopping trees at row " + line +".");

    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.attack", true);

    let number = 1;

    while (p.getPos().z >= zNorth + 0.5)
    {
        if (p.getPos().z <= chopLocation + 3.5 && p.getPos().z >= chopLocation + 2.5)
        {
            const inv = Player.openInventory();

            if (inv.getSlot(axeLocation).getDamage() >= 1541 || p.getMainHand().getItemID() != tool)
            {
                Chat.log("Replace");
                KeyBind.keyBind("key.forward", false);
                KeyBind.keyBind("key.attack", false);

                Client.waitTick(10);

                if (countItemInInventory(tool) == 0)
                {
                    Chat.log("/g fu-bot BOT HAS RUN OUT OF DURABLE AXES FOR THE OAK TREE FARM! LOGGING OUT!");
                    Client.waitTick();
                    Chat.say("/g fu-bot Player was on Row: "+line);
                    Chat.say("/logout");
                    Time.sleep(11000);
                }

                axeSwap();

                Client.waitTick(10);

                KeyBind.keyBind("key.forward", true);
                KeyBind.keyBind("key.attack", true);
            }

            if (p.getPos().y < ylevel)
            {
                Chat.log("/g fu-bot BOT HAS FALLEN OFF THE PLATFORM AT THE OAK TREE FARM! LOG OUT!");
                Client.waitTick();
                Chat.say("/g fu-bot Player was on Row: "+line);
               // Chat.say("/logout");
                Time.sleep(11000);
            }

            KeyBind.keyBind("key.forward", false);
            
            KeyBind.keyBind("key.attack", true);

            Client.waitTick(80);

            p.lookAt(180, 14);

            Client.waitTick(30);

            KeyBind.keyBind("key.forward", true);

            Client.waitTick(10);
        }

        if (p.getPos().z <= chopLocation)
        {
            chopLocation -= 4;
            Chat.log("Chopping tree #"+ number);
            number++;
            cutTree();
        }
    }

    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.attack", false);
}

/* Used within chop() where the player chops the entire tree when standing
under that certain tree's coordinates */
function cutTree()
{
    KeyBind.keyBind("key.forward", false);
    p.lookAt(180, -90);
    //Client.waitTick(90); changed
    Time.sleep(5200); //changed
    p.lookAt(180, 5);
    Time.sleep(1000); //changed wait.click(20)
    KeyBind.keyBind("key.forward", true);
}

/* Similar to chop() except player goes back in the opposite direction on the same
row (line) to replant the trees they have chopped. */
function replant()
{
    p.lookAt(0, 90);

    Client.waitTick(20);

    Chat.log("Replanting saplings at row "+ line +".");

    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.use", true);

    while (p.getPos().z <= zSouth + 2)
    {
        const inv = Player.openInventory();

        if (countItemInInventory(sapling) == 0)
        {
            Chat.log("/g fu-bot BOT HAS RUN OUT OF REPLANTABLE SAPLINGS FOR THE OAK TREE FARM! LOGGING OUT!");
            Client.waitTick();
            Chat.log("/g fu-bot Player was on Row: "+line);
            Chat.say("/logout");
            Time.sleep(11000);
        }

        if (p.getPos().y < ylevel)
        {
            Chat.log("/g fu-bot BOT HAS FALLEN OFF THE PLATFORM AT THE OAK TREE FARM! LOG OUT!");
            Client.waitTick();
            Chat.log("/g fu-bot Player was on Row: "+line);
            Chat.log("/logout");
            Time.sleep(11000);
        }

        if (p.getPos().z >= zSouth - 5)
        {
           // KeyBind.keyBind("key.sneak", true); changed
        }

        if (inv.getSlot(38).getItemID == sapling)
        {
            Client.waitTick();
        }
        else
        {
            getItemInHotbar(sapling);
            Client.waitTick();
        }
    }

    p.lookAt(90, 90);

    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.use", false);
    KeyBind.keyBind("key.sneak", false);
}
/* Before the start of each row (line), the player dumps excess logs and saplings into
the waterdrop */
function dumpOak()
{
    p.lookAt(180, -3);

    KeyBind.keyBind("key.attack", true);
    Client.waitTick(30);

    p.lookAt(160, -3);

    Client.waitTick(60);
    KeyBind.keyBind("key.attack", false);

    Client.waitTick(20);

    const inv = Player.openInventory();
    let saplingCount = 0;

    for (let i = 9; i < 45; i++)
    {
        if (inv.getSlot(i).getItemID() == "minecraft:oak_sapling")
        {
            saplingCount++;
        }

        if (inv.getSlot(i).getItemID() == "minecraft:oak_log")
        {
            inv.click(i);
            Client.waitTick();
            inv.click(-999);
            Client.waitTick();
        }
        else if (inv.getSlot(i).getItemID() == "minecraft:stripped_oak_log")
        {
            inv.click(i);
            Client.waitTick();
            inv.click(-999);
            Client.waitTick();
        }
        else if (inv.getSlot(i).getItemID() == "minecraft:oak_leaves")
        {
            inv.click(i);
            Client.waitTick();
            inv.click(-999);
            Client.waitTick();
        }
        else if (inv.getSlot(i).getItemID() == "minecraft:stick")
        {
            inv.click(i);
            Client.waitTick();
            inv.click(-999);
            Client.waitTick();
        }
        else if (inv.getSlot(i).getItemID() == "minecraft:oak_sapling" && saplingCount > 18)
        {
            inv.click(i);
            Client.waitTick();
            inv.click(-999);
            Client.waitTick();
            saplingCount--;
        }
        else
        {
            Client.waitTick();
        }
    }
    inv.close();
    Client.waitTick();
}

/* Causes the player to switch rows (line) by changing the x coordinate.
The x coordinate is modified to be going 5 blocks west and the line variable counter is incremented by 1. */
function facingSouth()
{
    let newLine = line+1;
    let x = xEast - (line *5 ) + 0.5;

    p.lookAt(90, 15);

    if (newLine == 200) { //change
        KeyBind.keyBind("key.sneak", false);
        KeyBind.keyBind("key.left", false);
        end();
        Time.sleep(11000);
    }

    Chat.log("Moving on to row "+ newLine +".");

    Client.waitTick(10);

    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.attack", true);
    KeyBind.keyBind("key.sneak", true);

    p.lookAt(90,5);
    Client.waitTick(60);
    p.lookAt(90,15);

    x -= 5;

    while (true)
    {
        if (p.getPos().x <= x)
        {
            break;
        }
        else
        {
            Client.waitTick();
        }
    }

    line += 1;

    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.sneak", false);
}

/* Logs the player out when all trees have been completed */
function end()
{
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.attack", false);
    Chat.say("/g fu-bot Botting of Oak Tree Farm was successfully completed. Now logging out.");
    Chat.say("/logout");
    Time.sleep(11000);
}

function breakFirst(){
    Player.getPlayer().lookAt(175, 16.5);
    Time.sleep(100);
    KeyBind.keyBind("key.attack",true);
    Time.sleep(2000);
    KeyBind.keyBind("key.attack", false);
}

/* Core function of the script where all the actions are combined under one function */
function choppingAndReplantingLines()
{
    while (true)
    {
        grabMouse();

        var newLine = line + 1;

        getItemInHotbar(tool);

        eatFood();

        Client.waitTick();
        
        getItemInHotbar(tool);
      
        breakFirst()

        Chat.log("Dumping oak.");
        dumpOak();

        chop();

        Client.waitTick(10);

        getItemInHotbar(sapling);

        replant();

        getItemInHotbar(tool);

        Client.waitTick(10);

        if (newLine == 200)
        {
            end();
        }
        else
        {
            facingSouth();
        }
    }
}

if(getAutoJump()==true)
{
    Chat.log("CANNOT START SCRIPT: Please Disable AutoJump before starting the script!");
    throw "AutoJump is enabled, cannot continue.";
}



/* Main */
//Chat.log("");
//Chat.log("NOTE: Remember to disable bypass mode before running the bot through /ctb to prevent the bot from accidentally breaking blocks.");
//Chat.log("");

//Client.waitTick(100);

//Chat.log("");
//Chat.log("NOTE 2: If you want to go through the whole farm in one day then it is reccommended to carry on you 14 stacks of oak saplings and at least 3 enchanted E3 U4 axes");
//Chat.log("");

//Client.waitTick(100);

//Chat.log("");
//Chat.log("NOTE 3: Finally, make sure you have the correct row (line) and food item configured! The bot doesn't recognize anything in the player's offhand. Modify these three variables in lines 33-35 of the script.");
//Chat.log("");

//Client.waitTick(100);

//Chat.log("");
//Chat.log("Thank you for your patience. Commencing Bot!");
//Chat.log("");
choppingAndReplantingLines();
