/*Script to harvest a cocoa farm, and replant
V1.0 by arthirob, 03/04/2025 
*/


// Variable and constant declaration

const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
const inv = Player.openInventory();

//Farm size and coordinates
const lodestoneX = -1552 ;
const lodestoneZ = -1682 ;
const lineLength = 29;
const yGround = -62;
const zNorth = -1675;
const lineX = [-1550,-1546];

const discordGroup = 'FU-Bot';
const farmName = "Cocoa farm"
const regrowTime = 24;
const startTime = Date.now();

const lagTick = 5;

var currentTree; //The tree you are currently harvesting
var currentLine;// The line you are harvesting 
var dir; //Direction, -1 for east, 1 for west

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function lookAtCocoa(x,z,dir){//Look at a cocoa bean in the dir next to your feet in the specified direction
    p.lookAt(x+0.5-0.7*dir,p.getY(),z+0.5);
}

function walkTo(x, z,sneak) { // Walk to the center of a block. If boolean attack is true, make an attack if you are stuck
    KeyBind.keyBind("key.forward", true);
    if (sneak){
        KeyBind.keyBind("key.sneak", true);
    }
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.2){
        oldX = p.getX();
        oldZ = p.getZ();
        lookAtCenter(x,z);//Correct the trajectory if needed
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(3);
}

function centerCocoa(){ //Center yourself on the cocoa bean
    walkTo(Math.floor(p.getX()),Math.floor(p.getZ()),true)  
}

function dumpCocoa() { //Throw the cocoa in the water in the direction of free space. South should be 0, then clock wise
    p.lookAt(-20,0);
    Client.waitTick(lagTick);
    for (let i = 9; i < 45 ; i++)    {
        if (inv.getSlot(i).getItemID() == "minecraft:cocoa_beans") {
            inv.dropSlot(i,true)
            Client.waitTick();
        }
    }
    Client.waitTick(5);
}

function reachTopColumn(dir) { //Go on top of the column. We harvest one to reduce it's size, then fall down from it
    lookAtCocoa(Math.floor(p.getX()),Math.floor(p.getZ()),dir);
    Client.waitTick(lagTick)
    im.interact();
    Client.waitTick(lagTick);
    p.lookAt(90*dir,70);
    KeyBind.keyBind("key.forward", true);
    Client.waitTick(10);
    KeyBind.keyBind("key.forward", false);
    centerCocoa();
}

function farmColumn(dir) { //Harvest a column from the top of the tree
    reachTopColumn(dir);
    p.lookAt(-dir*90,85);
    KeyBind.keyBind("key.use", true);
    while (p.getY()>yGround) {
        Client.waitTick();
    }
    KeyBind.keyBind("key.use", false);
    Client.waitTick(5);
}

function lodestoneToColumn(line,tree){ //Walk from the lodestone in the bunker to a specified tree. Line is the line number, and tree is the tree number. Both starts at 0
    KeyBind.keyBind("key.jump", true);
    Client.waitTick(lagTick)
    KeyBind.keyBind("key.jump", false);
    walkTo(lineX[line],zNorth);
    walkTo(lineX[line],zNorth+tree);
}

function leaveStream(dir) { // Leave the water stream
    p.lookAt(-180,0);
    if (dir==1) {
        KeyBind.keyBind("key.left", true);
        Client.waitTick(5);
        KeyBind.keyBind("key.left", false);
    } else {
        KeyBind.keyBind("key.right", true);
        Client.waitTick(5);
        KeyBind.keyBind("key.right", false);
    }
    KeyBind.keyBind("key.forward", true);
    while (p.getZ()>(zNorth-3)) {
        Client.waitTick()
    }
    KeyBind.keyBind("key.forward", false);
    walkTo(lodestoneX,lodestoneZ);
    dumpCocoa();
}



function farmLine(line) { // Farm a line of cocoa tree
    for (let i=0;i<lineLength;i++) {
        for (let j=-1;j<=1;j=j+2){ //Feels weird
            lodestoneToColumn(line,i);
            farmColumn(j);
            leaveStream(j);
        }
    }
}

function finishFarm() {
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" "+farmName+" is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. It'll be ready again in "+regrowTime+" hours. Now logging out") 
    Chat.say("/logout")
}


function farmMain() {
    if (p.distanceTo(lodestoneX,yGround,lodestoneZ)<1){
        farmLine(0);
        farmLine(1);
        finishFarm();
    } else {
        Chat.log("Please, start on the underground lodestone")
    }
}

farmMain();