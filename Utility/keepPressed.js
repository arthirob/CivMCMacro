Chat.log("Keep pressed");
Client.waitTick(10);
keySet = KeyBind.getPressedKeys() ;
Chat.log("Remove pressed");
Client.waitTick(15);
for(let item of keySet) {
    KeyBind.key(item,true);
}