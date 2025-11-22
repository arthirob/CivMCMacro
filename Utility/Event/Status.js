//Bot that listen and send information on running bots and your coords when asked by a discord relay
const discordChannel = "FU"
const minecraftName = "arthirob"
const commandName = "status"
const p=Player.getPlayer()
const lastLine = Chat.getHistory().getRecvLine(0).getText().getString();
if ((lastLine.split(" ")[0].includes(discordChannel))&&(lastLine.split(" ")[1].includes(minecraftName))&&(lastLine.split(" ")[2].includes(commandName))) { // 
    Chat.say(`/g ${discordChannel} You are at x=${Math.floor(p.getX())}, z=${Math.floor(p.getZ())}`);
    JsMacros.getOpenContexts().forEach(c => { //Name all the running scripts
        if (c != context.getCtx()) {
            Chat.say(`/g ${discordChannel} You are currently running this script : ${c.getFile().toString().split("/").pop()}`);
        }
    });
}