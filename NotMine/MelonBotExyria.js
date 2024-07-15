//CONFIGURATION
let plopPlop = true //Do you want the bot to say "Plop, plop!" after finishing? if false, the bot does it only 
                      //in the log
let sprint = true // If true, the bot goes faster, but may lose a small % of melons
let stopBeforeAxeBreaks = true //If true, the bot will stop when the axe is about to break

//CONFIGURATION FINISHES

//Functions

function exactWalkTo(x, z) {
    const targetX = (x >= 0) ? x + 0.5 : x - 0.5;
    const targetZ = (z >= 0) ? z + 0.5 : z - 0.5;
    let tries = 0;
    do {
        KeyBind.keyBind("key.forward", true);
        lookAtCenter(x, Player.getPlayer().getY() + 1, z);
        Client.waitTick();
    } while (Math.abs(Player.getPlayer().getX() - targetX) > 0.075 || Math.abs(Player.getPlayer().getZ() - targetZ) > 0.075)
    KeyBind.keyBind("key.forward", false);
    test(x, z);
}

function lookAtCenter(x, y, z) {
    let tx = (x >= 0) ? x + 0.5 : x - 0.5;
    let tz = (z >= 0) ? z + 0.5 : z - 0.5;
    Player.getPlayer().lookAt(tx, y, tz);
}

function test(x, z) {
    Time.sleep(500);
    const playerX = Player.getPlayer().getX();
    const playerZ = Player.getPlayer().getZ();
    
    const distanceX = Math.abs(playerX - (x + 0.5));
    const distanceZ = Math.abs(playerZ - (z - 0.5));
    
    if (distanceX > 0.1 || distanceZ > 0.1) {
        KeyBind.keyBind("key.sneak", true);
        Time.sleep(100);
        exactWalkTo(x, z);
        KeyBind.keyBind("key.sneak", false);
    } 
}

function harvestEast(end) {
    pitch = 25.7;
    KeyBind.keyBind("key.attack", true);
    while (Math.trunc(Player.getPlayer().getX()) < end) {

        KeyBind.keyBind("key.forward", true);
        //KeyBind.keyBind("key.use", true);
        KeyBind.keyBind("key.hotbar.1", true);
        cursorLockedF.setBoolean(Client.getMinecraft().field_1729, true);
        if (pitch != 14) {
            pitch += +(14 - pitch) / 10;
        }
        Player.getPlayer().lookAt(-90, pitch);
        if (sprint === true) {
            KeyBind.keyBind("key.sprint", true);
        }
        Time.sleep(30);
        if ((Chat.getHistory().getRecvLine(0).getText().getString() == "Your tool is almost broken" && stopBeforeAxeBreaks == true) ||
            KeyBind.getPressedKeys().contains("key.keyboard.left.shift")) {
            KeyBind.keyBind("key.forward", false);
            KeyBind.keyBind("key.use", false);
            KeyBind.keyBind("key.attack", false);
            for (let ctx of JsMacros.getOpenContexts()) {
                if (ctx.getFile().getName() === "MelonBotExyria.js") {
                if (plopPlop = true) {
                        Chat.say("Plop, plop!");
                    } else {
                        Chat.log("Plop, plop!");
                    }
                    ctx.closeContext();
                }
            }
        }
    }
}



function harvestWest(end) {
    pitch = 25.7;
    KeyBind.keyBind("key.attack", true);
    while (Math.trunc(Player.getPlayer().getX()) > end) {

        KeyBind.keyBind("key.forward", true);
        //KeyBind.keyBind("key.use", true);
        KeyBind.keyBind("key.hotbar.1", true);
        if (sprint === true) {
            KeyBind.keyBind("key.sprint", true);
        }
        cursorLockedF.setBoolean(Client.getMinecraft().field_1729, true);
        if (pitch != 14) {
            pitch += +(14 - pitch) / 10;
        }
        Player.getPlayer().lookAt(90, pitch);
        Time.sleep(30);
        if ((Chat.getHistory().getRecvLine(0).getText().getString() == "Your tool is almost broken" && stopBeforeAxeBreaks == true) ||
            KeyBind.getPressedKeys().contains("key.keyboard.left.shift")) { 
            KeyBind.keyBind("key.forward", false);
            KeyBind.keyBind("key.use", false);
            KeyBind.keyBind("key.attack", false);
            for (let ctx of JsMacros.getOpenContexts()) {
                if (ctx.getFile().getName() === "MelonBotExyria.js") {
                if (plopPlop = true) {
                        Chat.say("Plop, plop!");
                    } else {
                        Chat.log("Plop, plop!");
                    }
                    ctx.closeContext();
                }
            }
        }
    }
}


function goToCompact(){
  KeyBind.keyBind("key.use", false);
  KeyBind.keyBind("key.attack", false);
  KeyBind.keyBind("key.sprint", true);

//Goes to loadstone and uses it
  exactWalkTo(8379, -2672);
  Player.getPlayer().lookAt(1, 80);
  Time.sleep(500);
  Player.getPlayer().attack();
  //Chat.say("/tp 8379 86 -2673"); //You can delete this
  Time.sleep(500);
  Player.getPlayer().lookAt(-90, 35);
  Time.sleep(300);
  Player.getPlayer().interact();
exactWalkTo(8381, -2672); 

//Opens the chest and puts every melon in there
  Player.getPlayer().lookAt(-90,35);
  Time.sleep(500);
  Player.getPlayer().interact();
  Time.sleep(1000);
    
  const inv = Player.openInventory();
  const map = inv.getMap();
  const slots = Array.from(map.get("main")).concat(Array.from(map.get("hotbar")), (map.containsKey("offhand") ? map.get("offhand") : []));
  for (const slot of slots) {
      const item = inv.getSlot(slot).getItemId();
      if (item === "minecraft:melon") {
         inv.quick(slot);
              Time.sleep(10);
      }
  }

  Time.sleep(100);
  Player.openInventory().close();

//Uses the lever to activate the compactor
  Player.getPlayer().lookAt(-35, 25.5);
  Time.sleep(500);
  Player.getPlayer().interact();
  Time.sleep(500);
  Player.getPlayer().interact();
  Time.sleep(500);
    
//Goes back to harvest melons    
  exactWalkTo(8379, -2672);
  Player.getPlayer().lookAt(1, 80);
  Time.sleep(300);
  Player.getPlayer().interact();
  Chat.say("/tp 8379 141 -2673"); //You can delete this
  Time.sleep(500);
  KeyBind.keyBind("key.sprint", false);
}


/////////////////////////////////////////////////////////////////////////


//Do not change these
const Mouse = Java.type('net.minecraft.class_312');
const cursorLockedF = Reflection.getDeclaredField(Mouse, 'field_1783');
cursorLockedF.setAccessible(true);
let row = Math.trunc(Player.getPlayer().getZ());
let yaw = Math.trunc(Player.getPlayer().getYaw());
let east
if(yaw<0){
    east = true
    }
else{
    east = false
    }
count=0


//Script starts 

Chat.toast('Exyrian melon bot', 'By Zalvvv :))');
Chat.log("Bot: Remember to put food in you left hand to eat while botting!");
Time.sleep(100);
Chat.log("Bot: The bot will stop if you sneak or your axe is about to break only if you have called the script MelonBotExyria")
Time.sleep(100);
Chat.log("Bot: You can start restart the bot facing any row that you want");


while(row <= -2609 && east === true){

//Gets positioned first and eats
  KeyBind.keyBind("key.attack", false);
  KeyBind.keyBind("key.use", true);
  Time.sleep(1000);
  exactWalkTo(8380-0.2, row); 
    KeyBind.keyBind("key.use", false);

//Starts harvesting
  harvestEast(8508);

//When finished, changes row
  KeyBind.keyBind("key.attack", false);
  KeyBind.keyBind("key.forward", false);
  row+=1;
  count+=1

//Gets positioned
  Player.getPlayer().lookAt(0, 70);
  Time.sleep(1000);
  Player.getPlayer().attack();
  exactWalkTo(8508+0.2, row);
  Time.sleep(500);

//Harvests west
  harvestWest(8380);

//When finished, changes row
  row+=3
  count+=1

//Every 12 rows it goes to compact
  if(count==12){
      count = 0
  goToCompact();
    }
}
//The bot has now finished harvesting the Eastern skyfarm
//It will go to compact
  if(east){
  goToCompact();
  count=0
  row = -2734
  }
  
  
  
  
  
//Now it will start harvesting the Western skyfarm  
east = false

while(row <= -2609){
  
//Gets positioned first and eats
  KeyBind.keyBind("key.attack", false);
  KeyBind.keyBind("key.use", true);
  Time.sleep(1000);
  exactWalkTo(8377+0.2, row); 
  KeyBind.keyBind("key.use", false);

//Harvests West
  harvestWest(8249);

//When finished, changes row
  KeyBind.keyBind("key.attack", false);
  KeyBind.keyBind("key.forward", false);
  row+=1;
  count+=1

//Gets positioned
  Player.getPlayer().lookAt(0, 70);
  Time.sleep(1000);
  Player.getPlayer().attack();
  exactWalkTo(8249-0.2, row);
  Time.sleep(500);
  

//Harvests East
  harvestEast(8377);

//When finished, changes row
  row+=3
  count+=1

//Every 12 rows it goes to compact
  if(count==12){
      count = 0
  goToCompact();
    }
}
//The bot has now finished harvesting the Eastern skyfarm
//It will go to compact

  goToCompact();
  count=0
  


//Actions after the script has finished
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sprint", false);
    KeyBind.keyBind("key.use", false);
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.hotbar.1", false);
    
    Chat.log("Melon bot finished!")
    if(plopPlop=true){
    Chat.say("Plop, plop!")
    } else{
      Chat.log("Plop, plop!")
    }
