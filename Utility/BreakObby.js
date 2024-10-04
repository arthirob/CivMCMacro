/*
Script to destroy one obby block. You have to step over it
*/
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
var inv = Player.openInventory();
const originalY = p.getY();
KeyBind.keyBind("key.attack", true);

function finished() {
    if (p.getY()!=originalY) {
        Chat.log("in if");
        let i=0;
        stillBelow = true;
        while ((i<5)&&stillBelow) {
            Chat.log("i is "+i)
            Client.waitTick();
            if (p.getY()==originalY) {
                stillBelow=false
            } else {
                i++;
            }
        }
        return stillBelow
    } else {
        return false
    }
}

while(!finished()) {
    Client.waitTick(2);
}
KeyBind.keyBind("key.attack", false);
World.playSound("entity.elder_guardian.curse", 200);
Chat.log("You are finished")
