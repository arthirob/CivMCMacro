Chat.log("StoppingAllScripts");
Player.openInventory().openGui();
Client.waitTick();
Player.openInventory().close();
JsMacros.getOpenContexts().forEach(c => {
    if (c != context.getCtx()) {
        c.closeContext();
    }
});
