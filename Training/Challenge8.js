const p = Player.getPlayer() ;

function jump() {
    KeyBind.keyBind("key.jump",true)
    Client.waitTick(5)
    KeyBind.keyBind("key.jump",false)
}

function placeJump() {
    jump();
    oldYaw = p.getYaw();
    p.lookAt(oldYaw,90);
    Client.waitTick(2);
    p.interact();
    Client.waitTick(5);
    p.lookAt(oldYaw,0);
}

for (let i=0;i<5;i++) {
    placeJump();
}
KeyBind.keyBind("key.forward",false)
Chat.log("Script over");
