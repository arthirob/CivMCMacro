const redConcreteZ = -6922;
const p = Player.getPlayer() ;
var prevZ;

p.lookAt(180,0);
KeyBind.keyBind("key.forward",true)
while (p.getZ()>(redConcreteZ+1)) {
    prevZ = p.getZ();
    Client.waitTick();
    if (p.getZ()==prevZ) {
        KeyBind.keyBind("key.jump",true)
        Client.waitTick()
        KeyBind.keyBind("key.jump",false)
    }
}
KeyBind.keyBind("key.forward",false)
Chat.log("Script over");
