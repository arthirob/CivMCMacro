const redConcreteX = 6483;
const p = Player.getPlayer() ;


KeyBind.keyBind("key.forward",true)
while (p.getX()<redConcreteX) {
    Client.waitTick();
}
KeyBind.keyBind("key.forward",false)
Chat.log("Script over");
