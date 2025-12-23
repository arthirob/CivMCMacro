let triggeringMessage = event.text.getString();

if (triggeringMessage.startsWith("You sense debris nearby")) {
    GlobalVars.putInt("debris",GlobalVars.getInt("debris")+1);
}