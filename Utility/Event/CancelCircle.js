const inv = Player.openInventory();

if (Chat.getHistory().getRecvLine(0).getText().getString() == "A SimpleAdminHacks /config option is preventing you from breaking that ore without a silk touch pickaxe.") { // You hav ctb activating
    JsMacros.getOpenContexts().forEach(c => {
        if (c != context.getCtx()) {
            c.closeContext();
        }
    });
}