const p = Player.getPlayer() ;
const treeX = 6018;
const treeZ = -6912;
const smallWait = 4;
const longWait = 14;
const inv = Player.openInventory();


function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY(), z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.1 || Math.abs(p.getZ() - z - 0.5 ) > 0.1)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick();
}

function jump() {
    KeyBind.keyBind("key.jump",true)
    Client.waitTick(5)
    KeyBind.keyBind("key.jump",false)
}

function placeJump() {
    jump();
    inv.setSelectedHotbarSlotIndex(0);
    oldYaw = p.getYaw();
    p.lookAt(oldYaw,90);
    Client.waitTick(2);
    p.interact();
    Client.waitTick(5);
    p.lookAt(oldYaw,0);
}

function placeTwoCocoa(i) { //i is between -1 and 2
    inv.setSelectedHotbarSlotIndex(1);
    p.lookAt(90*i,84);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.back", true);
    Client.waitTick(longWait);
    p.interact()
    Client.waitTick(smallWait);
    p.lookAt(90*i,78);
    KeyBind.keyBind("key.back", false);
    Client.waitTick(smallWait);
    p.interact();
    Client.waitTick(smallWait);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(longWait)
    KeyBind.keyBind("key.forward", false);

}

for (let i=0;i<4;i++) {
    placeJump();
    placeJump();
    for (let j=-1;j<3;j++) {
        placeTwoCocoa(j)
    }
    walkTo(treeX,treeZ);
}

Chat.log("Script over");
