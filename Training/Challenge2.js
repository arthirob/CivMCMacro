const redConcreteX = 6483;
const p = Player.getPlayer() ;

p.lookAt(180,0)
KeyBind.keyBind("key.right",true)
while (p.getX()<redConcreteX) {
    Client.waitTick();
}
KeyBind.keyBind("key.right",false)
Chat.log("Script over");
