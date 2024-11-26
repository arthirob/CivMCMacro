const redConcreteX = 6483;
const p = Player.getPlayer() ;
var prevX;

p.lookAt(-90,0);
KeyBind.keyBind("key.forward",true)
while (p.getX()<redConcreteX) {
    prevX = p.getX();
    Client.waitTick();
    if (p.getX()==prevX) {
        KeyBind.keyBind("key.jump",true)
        Client.waitTick()
        KeyBind.keyBind("key.jump",false)
    }
}
KeyBind.keyBind("key.forward",false)
Chat.log("Script over");
