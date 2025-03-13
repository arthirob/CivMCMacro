me = Player.getPlayer()
myInventory = Player.openInventory()
var inv = Player.openInventory();

/*
    Tree farm script
    Tools: E4U3 Diamond Axe, U3 Diamond Hoe
    Place Axe in slot 9, place hoe in slot 8.
    
    Directions: Start script at the southwestern corner, body snug up to the
    block on the right, facing the left most row of trees.
*/

// Dimensions of treefarm
numberOfRows = 30
//30, 36

numberOfTrees = 36


// E4 Diamond Axe + Hoe tick lengths
nextRowTicks = 60
moveBetweenTicks = 90
floorCutTicks = 35
upperCutTicks = 44 // CDM-Jungle: 25 | Kallos-Jungle: 38

//
hoeTheLeaves = false

function toolDurabilityLeft(){
    if(Player.getPlayer().getMainHand().isDamageable()){
        return Player.getPlayer().getMainHand().getMaxDamage()
              - Player.getPlayer().getMainHand().getDamage()
    }
    else return 11
}

/*function checkQuit(){
    if(KeyBind.getPressedKeys().contains("key.keyboard.s")){
        return true
    }
    else if(toolDurabilityLeft() <= 10){
        return true
    }
    else{
        return false
    }
}*/

function selectAxe(){
    myInventory.setSelectedHotbarSlotIndex(8)
    spinTicks(5)
}
function selectHoe(){
    myInventory.setSelectedHotbarSlotIndex(7)
    spinTicks(5)
}
function startAttack(){
    KeyBind.key("key.mouse.left", true)
}
function stopAttack(){
    KeyBind.key("key.mouse.left", false)
}
//spend tickNumber ticks in wait, but with ability to cancel wait
function spinTicks(tickNumber){
    for(let i = 0; i < tickNumber; i++){
        Client.waitTick(1) 
        /*if(checkQuit()){
            return
        }*/
    } 
}
function throwItems() {
    for (i = 9; i < 27; i++) {
     Client.waitTick(4);
                    
      me.lookAt(135, 45);
      inv.click(i);
      Client.waitTick(1);
      inv.click(-999);
                    
    }
}

function simpleLook(xAngle, yAngle, ticks){
    /*if(checkQuit()){
        return
    }*/
    me.lookAt(xAngle,yAngle)
    spinTicks(ticks)
}

function panLook(xStart,yStart,xEnd, yEnd, ticks){
    xDif = xEnd - xStart
    yDif = yEnd - yStart
    
    for(let i = 0; i < ticks; i++){
        /*if(checkQuit()){
            return
        }*/
        me.lookAt(xStart + (xDif *(i/ticks)), yStart + (yDif *(i/ticks)))
        Client.waitTick(1)
    } 
}
function simpleMove(keyString, xAngle, yAngle, ticks){
    /*if(checkQuit()){
        return
    }*/
    me.lookAt(xAngle,yAngle)
    spinTicks(5)
    KeyBind.key(keyString, true)
    spinTicks(ticks)
    KeyBind.key(keyString, false)
}


function cutTree(angle){
    /*if(checkQuit()){
        return false
    }*/
    
    //chop leaves in front of tree
    selectHoe()
    startAttack()
    simpleMove("key.keyboard.w",angle,0, moveBetweenTicks)
    simpleLook(angle, -80, 5)
    stopAttack()
    
    //chop tree
    selectAxe()
    startAttack()
    simpleLook(angle, 45, floorCutTicks) //eye and foot level logs
    
    selectHoe()
    simpleLook(angle, -75, 26)
    
    selectAxe()
    
    simpleLook(angle, -75, upperCutTicks) //upper level logs
    
    
    stopAttack()
    
    
    //hoe leaves
    if(false){
        selectHoe()
        startAttack()
        panLook(angle - 90, -55, angle + 90, -55,20)
        panLook(angle - 90, -30, angle + 90, -30,20)
        panLook(angle - 90, -13, angle + 90, -13,20)
        stopAttack()
    }
}

function cutRow(angle, trees){
  for(let i = 0; i < trees; i++){
      /*if(checkQuit()){
          return false
      }*/
      
      cutTree(angle)
  }
}

function moveToNextRow(){
    selectHoe()
    startAttack()
    simpleMove("key.keyboard.w",-90,0, nextRowTicks)
    stopAttack()
}

function newAngle(angle){
    if(angle == 180){
        return 0
    }
    return 180
}
function eatIfHungry(hotbarSlot) {
    foods = [
        "minecraft:beetroot",
        "minecraft:cookie",
        "minecraft:melon_slice",
        "minecraft:apple",
        "minecraft:chorus_fruit",
        "minecraft:carrot",
        "minecraft:baked_potato",
        "minecraft:bread",
        "minecraft:pumpkin_pie",
        "minecraft:cooked_chicken",
        "minecraft:cooked_mutton",
        "minecraft:cooked_porkchop",
        "minecraft:cooked_beef",
        "minecraft:golden_carrot",
        "minecraft:dried_kelp",
        "minecraft:mushroom_stew"
    ];

    if (Player.getPlayer().getFoodLevel() >= 20) { //exit if not hungry
        return;
    }

    invSlot = Player.openInventory().getMap().get("hotbar")[hotbarSlot];
    if (!foods.includes(inv.getSlot(invSlot).getItemID())) {
        for (var i = 0; i < inv.getTotalSlots(); i++) {
            var slot = inv.getSlot(i);
            if (slot !== null && foods.includes(slot.getItemID())) {
                inv.swap(i, invSlot);
                Client.waitTick();
                break;
            }
        }
    }
    inv.setSelectedHotbarSlotIndex(hotbarSlot);
    Client.waitTick();

    while (Player.getPlayer().getFoodLevel() < 20) {
        KeyBind.keyBind('key.use', true);
        Time.sleep(2500);
        KeyBind.keyBind('key.use', false);
    }
}

angle = 180

//Start of program
Chat.say("/g KA-V Started Tree Harvest Job")
//Chat.log("Hold \"S\" to exit")

for(let i = 1; i <= numberOfRows; i++) {
    /*if(checkQuit()){
        break
    }*/
    eatIfHungry(0);
    
    if ((i % 2) != 0) {
          throwItems()
    }
    cutRow(angle, numberOfTrees)
    
    //get to side path for next row
    selectHoe()
    startAttack()
    simpleMove("key.keyboard.w",angle,0, moveBetweenTicks)
    stopAttack()
    
    Chat.say("/g KA-V Finished row " + i);
    //move to and switch directions for next row
    moveToNextRow()
    angle = newAngle(angle)
}

Chat.say("/g KA-V <@584930953474867230> Finished Tree Harvest Job")
Chat.say("/logout")