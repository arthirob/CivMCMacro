const refreshTime = 3; //Check the chat every x seconds
const textMessage = "I'm botting right now, i'll answer when I can, or send me on discord"

function autoReply(){
    while (true) {
        Client.waitTick(20*refreshTime);
        var messageCount = Chat.getHistory().getRecvCount();
        var playerName = [];
        for (i=0;i<messageCount;i++) {
            Client.waitTick();
            var textString = Chat.getHistory().getRecvLine(i).getText().getString();
            if (textString.startsWith("From")) {
                textName = textString.split(" ")[1].slice(0,-1);
                if (!playerName.includes(textName)) {
                    playerName.push(textName);
                }
            }
        }
        Chat.log("Message read, now clearing");
        for (let j=0;j<playerName.length;j++) {
            Chat.say(`/tell ${playerName[j]} ${textMessage}`);
        }
        Chat.getHistory().clearRecv();
     }
}

autoReply();


