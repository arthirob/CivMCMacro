const redConcreteX = 6004;
const redConcreteZ = -6918;
const blueConcreteX = 6006;
const blueConcreteZ = -6921;
const blueConcreteY = 93;
const p = Player.getPlayer() ;

KeyBind.keyBind("key.forward",true)
while (p.getZ()>(redConcreteZ+1)) {
    p.lookAt(blueConcreteX+0.5,blueConcreteY+0.5,blueConcreteZ+0.5);
    Client.waitTick();
    if (p.getX()>redConcreteX+0.5) {
        KeyBind.keyBind("key.left",true)
    } else {
        KeyBind.keyBind("key.left",false)

    }
}
KeyBind.keyBind("key.forward",false)
KeyBind.keyBind("key.left",false)
Chat.log("Script over");