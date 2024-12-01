const p = Player.getPlayer() ;
KeyBind.keyBind("key.forward",true)

p.lookAt(180,0);
Chat.log("All is good so far");
Client.waitTick(50);
p.lookAt(-90,0);
Chat.log("Still working");
Client.waitTick(40);
Chat.log("You should cancel now");
KeyBind.keyBind("key.jump",true)
Client.waitTick(10);
p.lookAt(140,60);
Client.waitTick(20)

for (let i=0;i<30;i++) {
    Chat.log("You should really cancel");
    p.lookAt(Math.random()*360-180,Math.random()*90);
    Client.waitTick(10)
    if (i>15) {
        Chat.log("Cancelling in "+(30-i));
    }
}
KeyBind.keyBind("key.jump",false)
KeyBind.keyBind("key.forward",false)

Chat.log("You didn't cancel the script, I hope all is well for you. Ask for help to setup JSMacro")


