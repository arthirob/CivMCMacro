Chat.log("Keep pressed");
Client.waitTick(15);
keySet = KeyBind.getPressedKeys() ;
Chat.log("Remove pressed");
Client.waitTick(30);
for(let item of keySet) {
    KeyBind.key(item,true);
}