const redConcreteZ = -6922;
const p = Player.getPlayer() ;
var prevZ;
var triedJump; //A bool if you tried just a jump
var oldYaw;

function jump() {
    KeyBind.keyBind("key.jump",true)
    Client.waitTick()
    KeyBind.keyBind("key.jump",false)
}

function placeJump() {
    jump();
    oldYaw = p.getYaw();
    p.lookAt(oldYaw,90);
    Client.waitTick(2);
    p.interact();
    Client.waitTick(2);
    p.lookAt(oldYaw,0);
}

p.lookAt(180,0);
triedJump = false;
KeyBind.keyBind("key.forward",true)
while (p.getZ()>(redConcreteZ+1)) {
    prevZ = p.getZ();
    Client.waitTick();
    if (p.getZ()==prevZ) { //You are bumping in something
        if (triedJump) {
            placeJump()
            triedJump = false;
        } else {
            jump();
            Client.waitTick(10)
            if (p.getZ()==prevZ) { //You tried jumping and it didn't worked
                triedJump = true;
            } else {
                prevZ = p.getZ();
                triedJump = false;
            }
        }
        Client.waitTick(5);
    } else { //Reset the try counter
        triedJump = false;
    }
}
KeyBind.keyBind("key.forward",false)
Chat.log("Script over");
