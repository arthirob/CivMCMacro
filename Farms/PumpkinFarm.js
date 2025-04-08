/*
Script to harvest a pumpkin farm
V1.1 by arthirob 08/04/2024

Things to improve
Makes it auto compact at the end
*/

// Constant and variable declaration

const p = Player.getPlayer() ;
var inv = Player.openInventory();
const lagTick = 6; // Edit this depending on your internet connection
const startTime = Date.now();

const firstButtonX = 4443 ;
const firstButtonZ = -6780 ;
const buttonDist = 12;
const northBorder = -7035 ; //The z value until which you need to start walking
const southBorder = -6790 ;
const simultanousRow = 2;
const totalRow = 8;


const steps = 15;
const coeff = makeArray(steps);
const sleepTime = 5;

var currentRow; //An integer of the row you are in


function binomial(n, k) {
    if ((typeof n !== 'number') || (typeof k !== 'number')) 
 return false; 
   var coeff = 1;
   for (var x = n-k+1; x <= n; x++) coeff *= x;
   for (x = 1; x <= k; x++) coeff /= x;
   return coeff;
}

function makeArray(size){
    var coefficient = Array(size);
    for (let i=0;i<size;i++) {
        coefficient[i] = binomial(size-1,i)/(2**(size-1)) ;
    }
    return coefficient
}


function softLook(yawGoal,pitchGoal) {
    currentYaw=p.getYaw();
    difYaw = yawGoal - currentYaw ;
    if (difYaw>180) {
        difYaw-=360;
    }
    if (difYaw<-180) {
        difYaw+=360;
    }
    currentPitch = p.getPitch();
    difPitch = pitchGoal - currentPitch;
    for (let i=0;i<steps;i++) {
        currentYaw+=difYaw*coeff[i];
        currentPitch += difPitch*coeff[i];
        p.lookAt(currentYaw,currentPitch);
        Time.sleep(sleepTime);
    }
}

function smoothBlockLook(x,y,z){
    deltaX = x - p.getX();
    deltaY = y - (p.getY()+1.62); //Add the height of the eyes
    deltaZ = z - p.getZ();
    distance = Math.sqrt(deltaZ * deltaZ + deltaX * deltaX);
    pitch = -180*Math.atan2(deltaY, distance)/Math.PI;
    yaw =-180*Math.atan2(deltaX, deltaZ)/Math.PI;
    softLook(yaw,pitch);
}

function lookAtCenter(x, z) {// Look at the center of a block
    smoothBlockLook(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x, z,run) { // Walk to the center of a block
    lookAtCenter(x,z);
    Client.waitTick(10);
    KeyBind.keyBind("key.forward", true);
    if (run) {
        KeyBind.keyBind("key.sprint", true);

    }
    while ((Math.abs(p.getX() - x - 0.5) > 0.1 || Math.abs(p.getZ() - z - 0.5 ) > 0.1)){
        p.lookAt(x+0.5,p.getY(),z+0.5);// Allow trajectory correction
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);

    Client.waitTick(lagTick);
    
}

function pressButton(x,z) { //Press the button on the east side of a block
    walkTo(x+1,z+1,true)
    smoothBlockLook(x+1.1,p.getY()+1.5,z+0.5)
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
}

function followTheMachine(row) { // Follow the machine until the north of the farm, then come back
    walkTo(firstButtonX+row*buttonDist+2,firstButtonZ,false);
    softLook(180,0);
    KeyBind.keyBind("key.forward", true);
    while (p.getZ()>northBorder) {
        Client.waitTick(10);
        softLook(180,0);
        KeyBind.keyBind("key.forward", true);
    }
    Chat.log("Reached the end of the row, now going back")
    softLook(0,0);
    KeyBind.keyBind("key.forward", false);
    while (p.getZ()<(southBorder)) {
        KeyBind.keyBind("key.forward", true);
        Client.waitTick(8);
        KeyBind.keyBind("key.forward", false);
        Client.waitTick(11);
    }
    walkTo(firstButtonX+row*buttonDist+2,firstButtonZ+1,false)
}

function startSomeRow(row,numberOfRow) { //Start three row of the farm
    for (let i=0;i<numberOfRow;i++) {
        pressButton(firstButtonX+(i+row)*buttonDist,firstButtonZ);
    }
    followTheMachine(row+(numberOfRow-1));
}

function farmAll() {
    for (let i=0;i<totalRow;i=i+simultanousRow) {
        startSomeRow(i,simultanousRow);
    }
}

function finishFarm() {
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.say("/g "+discordGroup+" Obby farm harvested for "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. I mined "+totalObby+" obsidian block") 
    Chat.say("/logout")
}

function start() {
    if (p.distanceTo(firstButtonX,p.getY(),firstButtonZ)<2) {
        farmAll();
    } else {
        Chat.log("Start near the first button")
    }

}

start();