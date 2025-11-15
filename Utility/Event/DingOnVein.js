//Script to ding when you mine a vein
if (Chat.getHistory().getRecvLine(0).getText().getString().startsWith("You sense a diamond nearby")) {
    World.playSound("block.bell.use",100)
}