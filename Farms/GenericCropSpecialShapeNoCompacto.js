/*
*/

// Constant and variable declaration

const p = Player.getPlayer() ;
var inv = Player.openInventory();
const lagTick = 6; // Edit this depending on your internet connection

// Farm border declaration (no border no nation tho')
const myImage = Hud.createTexture(JsMacros.getConfig().macroFolder+"/Farms/Map.png","")
const xStandingPoint = -7817;
const zStandingPoint = 4978;
var dir=1; //0 for going south, 1 for going north
const pitchGoal = 5 ;
const emptyBeforeCompact = 10;//Do lines until you have less than this number of space left in your hand
const needFortune = false; //To true if you need fortune (carrots or potatoes)
const discordGroup = 'SWCfarms';
const farmName = "Wheat farm in heart shape"
const regrowTime = 16;
const autoDetectStart = true; //Set to true if the bot starts on your current raw, false otherwise


//After this, script is autonomous
var xChest;
var zChest;
var xFurnace;
var zFurnace;
var xCorrected; //Upper left corner of your picture
var zCorrected;
var currentChest = 3
var currentX;
var startRow;
const startTime = Date.now();
const imageWidth = myImage.getWidth();
const imageHeight = myImage.getHeight();



function codeToRGB(color){ //Allows to convert the code from the function to an RGB value
    return((color>>>0).toString(16).slice(2))
}

function findInformations(){ //Return table of informationvalue of the reference. Chest red ff0000, furnace blue 0000ff and standing point green 00ff00
    foundChest = false ;
    foundStandingPoint = false;
    foundFurnace = false;
    for (let i=0;i<imageWidth;i++){
        for (let j=0;j<imageHeight;j++){
            if (codeToRGB(myImage.getPixel(i,j))=="ff0000"){
                xChest=i;
                zChest=j;
                if (!foundChest) {
                    foundChest = true;
                } else {
                    throw("Multiple chest point")
                }
            }
            if (codeToRGB(myImage.getPixel(i,j))=="00ff00"){
                xStanding=i;
                zStanding=j;
                if (!foundStandingPoint) {
                    foundStandingPoint = true;
                } else {
                    throw("Multiple standing point")
                }
            }
        }
    }
    if (foundChest&&foundStandingPoint) {
        return ([[xChest,zChest],[xStanding,zStanding],[xFurnace,zFurnace]])
    } else {
        throw("Missing informations point");
    }
}

function initMap(){
    informationsArray = findInformations();
    xCorrected = xStandingPoint-informationsArray[1][0];
    zCorrected = zStandingPoint - informationsArray[1][1];
    xChest = xCorrected + informationsArray[0][0];
    zChest = zCorrected + informationsArray[0][1];
    xFurnace = xCorrected + informationsArray[2][0];
    zFurnace = zCorrected + informationsArray[2][1];
    if (autoDetectStart){
        currentX = Math.floor(p.getX());
        startRow = currentX - xCorrected
    } else {
        startRow=0;
    }
}

function blackRow(row){ //Return the upper and lower bound of the row
    started = false;
    min = 0;
    max = 0;
    for (let j=0;j<imageHeight;j++){
            if (codeToRGB(myImage.getPixel(row,j))=="000000"){
                if (!started) {
                    min = j
                    started = true;
                } else {
                    max = j
                }
            }
        }
    return ([min,max])
}

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(lagTick);
    
}

function checkInv() {//Return the amount of empty slots you have
    inv = Player.openInventory();
    var freeSlot = 0;
    for (let i=9;i<=44;i++) {
        if(inv.getSlot(i).getItemId()=="minecraft:air"){
            freeSlot++
        }
    }
    return(freeSlot)
}

function emptyInv(chest) { //Empty your inv in the chest specific number
    if (chest==1) {
        p.lookAt(xChest+0.5,p.getY()+1.5,zChest+0.5);
    }
    if (chest==2) {
        p.lookAt(xChest+0.5,p.getY()+0.5,zChest+0.5);
    }
    if (chest==3) {
        p.lookAt(xChest+0.5,p.getY()+0.5,zChest+2.5);
    }
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);

    const inv = Player.openInventory();
    const slots = inv.getSlots('main', 'hotbar', 'offhand');

    // Put the kelp in the chest
    for (const slot of slots) {
        const item = inv.getSlot(slot).getItemId();
        if (item === "minecraft:wheat") {
                inv.quick(slot);
                Client.waitTick();
            }
        }
    Player.openInventory().close();
    Client.waitTick(lagTick);

}

function store() { //Go to the compactor, put things in the chest and hit the furnace with the stick
    walkTo(xStandingPoint,zStandingPoint);
    emptyInv(currentChest);
    if (inv.findItem("minecraft:wheat").length>0) { //If you stil have kelp in your inventory, change chest
        currentChest = (currentChest%3)+1
        emptyInv(currentChest);
    }
}

function equipTool() { // Function to equip a tool with the fortune effect
    var foundTool = false;
    let i = 9;
    while ((i < 45)&&(!foundTool)){
        if (inv.getSlot(i).hasEnchantment("fortune")) {
            if (inv.getSlot(i).getEnchantment("Fortune").getLevel()==3) {
                inv.swapHotbar(i,0);
                foundTool=true;
            }
        }
        i++;
    }
    inv.setSelectedHotbarSlotIndex(0);
    if (!foundTool) {
        throw("Have a fortune 3 tool in our inventory")
    }
}

function harvestRow(row){ //Harvest a certain row if needed, and return a boolean that says if the line was harvested
    [min,max] = blackRow(row);
    if ((min!=0)&&(max!=0)) {
        if (dir==0) { //You are going south
            start = min;
            finish = max;
        } else {
            start = max;
            finish = min;
        }
        walkTo(xCorrected+row,zCorrected+start); //If dir is 1 go from min to max, if 0 to opposite
        Client.waitTick();
        pitch = 90;

        KeyBind.keyBind("key.use", true);
        while(p.distanceTo(xCorrected+row,p.getY(),zCorrected+finish)>1) {
            Client.waitTick();
            while (Math.abs(pitch - pitchGoal)>5 ) { //Wait until you are at almost the pitch
                pitch += (pitchGoal - pitch) / 10
                Time.sleep(50);
                p.lookAt(dir*180, pitch);
            }
            KeyBind.keyBind("key.forward", true);
        }
        KeyBind.keyBind("key.forward", false);
        KeyBind.keyBind("key.use", false);
        inv.close(); //This is in case you opened a container by mistake. This is not pretty, could be reworked
        Client.waitTick();
        inv = Player.openInventory();
        p.lookAt(90,0);
        Client.waitTick();
        for (let i = 9; i < 45 ; i++) {
            if (inv.getSlot(i).getItemId()=="minecraft:wheat_seeds") {
                inv.dropSlot(i,true)
                Client.waitTick();
            }
        }
        return (true)
    } else {
        Chat.log("Row "+row+" is empty")
        return(false)
    }
}

function harvestAll(){
    for (let i=startRow;i<imageWidth;i++){
        harvested = harvestRow(i);
        if (checkInv()<emptyBeforeCompact) {
            store();
        }
        if (harvested) {
            dir = 1 - dir;
        }

        Client.waitTick();
    }
}

function finishFarm() {
    store();
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. It'll be ready again in "+regrowTime+" hours. Now logging out") 
    Chat.say("/logout")
}


function start(){
    if (needFortune){
        equipTool();
    }
    initMap();
    harvestAll();
    finishFarm();
}

start();