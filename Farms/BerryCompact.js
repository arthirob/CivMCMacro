//CONFIGURATION
let logout = true
//


function walkTo(x, z) {
    const targetX = (x >= 0) ? x + 0.5 : x - 0.5;
    const targetZ = (z >= 0) ? z + 0.5 : z - 0.5;
    let tries = 0;
    do {
        KeyBind.keyBind("key.forward", true);
        lookAtCenter(x, Player.getPlayer().getY() + 1, z);
        Client.waitTick();
    } while (Math.abs(Player.getPlayer().getX() - targetX) > 0.075 || Math.abs(Player.getPlayer().getZ() - targetZ) > 0.075)
    KeyBind.keyBind("key.forward", false);
}

function lookAtCenter(x, y, z) {
    let tx = (x >= 0) ? x + 0.5 : x - 0.5;
    let tz = (z >= 0) ? z + 0.5 : z - 0.5;
    Player.getPlayer().lookAt(tx, y, tz);
}
function compact() {
    walkTo(Player.getPlayer().getX(), -7134);
    walkTo(5720, -7134);

    // Look at the compactor and activate it
    Player.getPlayer().lookAt(180, 50);
    Time.sleep(1000);
    Player.getPlayer().interact();

    // Put the potatoes in the chest
    Time.sleep(1000);
    const inv = Player.openInventory();
    const map = inv.getMap();
    const slots = Array.from(map.get("main")).concat(Array.from(map.get("hotbar")), (map.containsKey("offhand") ? map.get("offhand") : []));
    
    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item === "minecraft:potato" || item === "minecraft:sweet_berries") {
            inv.quick(slot);
        }
    }

    Time.sleep(1000);
    Player.openInventory().close();

    // Look at the button and activate it
    Player.getPlayer().lookAt(118, 12);
    Time.sleep(100);
    Player.getPlayer().interact();
    Time.sleep(500);
    Player.getPlayer().interact();
    Time.sleep(500);
}


let row = Math.trunc(Player.getPlayer().getX()) // First x coordinate
const zSouth = -7050+1; 
const zNorth = -7135+1;
let count = 0

while (row <= 5743) {
walkTo(row, zNorth);
    // Select slot 1
    // Look to the east
    // Hold backspace until the x coordinate equals row
    Time.sleep(1000)

    KeyBind.keyBind("key.hotbar.1", true);
    Time.sleep(30)
    KeyBind.keyBind("key.hotbar.1", false);
                        
    // Collect potatoes towards the north first

    yaw = -30
    
    while (Math.trunc(yaw) <=-5){
    yaw += (5 - yaw) / 10
            Player.getPlayer().lookAt(yaw, 0);
            Time.sleep(50);
                    Player.getPlayer().interact();
    }
    
    while (Math.trunc(Player.getPlayer().getZ()) !== zSouth) {
        KeyBind.keyBind("key.forward", true);
        Player.getPlayer().lookAt(yaw, 0);
        Player.getPlayer().interact();
        Time.sleep(50)
    }
    KeyBind.keyBind("key.forward", false);

    // Change row
    row += 2;
      if(row > 5743){
        break
    }  
    walkTo(row, zSouth);


    // Collect potatoes towards the south first
    yaw = -140
    
    while (Math.trunc(yaw) >-174){
    yaw -= (175 + yaw) / 10
            Player.getPlayer().lookAt(yaw, 0);
            Time.sleep(50);
                    Player.getPlayer().interact();
    }
    while (Math.trunc(Player.getPlayer().getZ()) !== zNorth) {
        Player.getPlayer().lookAt(yaw, 0);
        KeyBind.keyBind("key.forward", true);
        Player.getPlayer().interact();
        Time.sleep(50)
    }
    

    // Change row
    row += 2;
    count +=1;
    
        if(row > 5743){
        break
    }
    

    // Every 8 rows, go back to the compactor
    if (count === 4) {
    compact();

    // Go to the row we need
    walkTo(row, zNorth);
    count = 0
    }
}

if(count !=0){ //It has not compacted yet
    compact();
}
if(logout){
    Chat.say("/logout");
}