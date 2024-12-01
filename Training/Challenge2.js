const redConcreteZ = -6922;
const p = Player.getPlayer() ;

p.lookAt(90,0)
KeyBind.keyBind("key.right",true)
while (p.getZ()>(redConcreteZ+1)) {
    Client.waitTick();
}
KeyBind.keyBind("key.right",false)
Chat.log("Script over");
