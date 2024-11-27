const redConcreteX = 6483;
const p = Player.getPlayer() ;
var prevX; //The x before the tick
var obstacleX; //The x at which you find an obstacle
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

p.lookAt(-90,0);
triedJump = false;
KeyBind.keyBind("key.forward",true)
while (p.getX()<redConcreteX) {
    prevX = p.getX();
    Client.waitTick();
    if (p.getX()==prevX) { //You are bumping in something
        if (triedJump) {
            Chat.log("In if")
            placeJump()
            triedJump = false;
        } else {
            jump();
            Client.waitTick(10)
            if (p.getX()==prevX) { //You tried jumping and it didn't worked
                triedJump = true;
            } else {
                prevX = p.getX();
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
