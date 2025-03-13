const redConcreteZ = -6922;
const p = Player.getPlayer() ;


KeyBind.keyBind("key.forward",true)
while (p.getZ()>(redConcreteZ+1)) {
    Client.waitTick();
}
KeyBind.keyBind("key.forward",false)
Chat.log("Script over");