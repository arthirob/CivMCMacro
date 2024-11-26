const redConcreteX = 6479;
const redConcreteZ = -6078;
const blueConcreteX = 6481;
const blueConcreteZ = -6076;
const blueConcreteY = 78;
const p = Player.getPlayer() ;

KeyBind.keyBind("key.forward",true)
while (p.getX()<redConcreteX) {
    p.lookAt(blueConcreteX+0.5,blueConcreteY+0.5,blueConcreteZ+0.5);
    Client.waitTick();
    if (p.getZ()>redConcreteZ+0.5) {
        KeyBind.keyBind("key.left",true)
    } else {
        KeyBind.keyBind("key.left",false)

    }
}
KeyBind.keyBind("key.forward",false)
KeyBind.keyBind("key.left",false)
Chat.log("Script over");
