/*
Script to harvest a pumpkin farm
V1.0 by arthirob 05/03/2024

Things to improve
*/

// Constant and variable declaration

const p = Player.getPlayer() ;
var inv = Player.openInventory();
const lagTick = 6; // Edit this depending on your internet connection
const startTime = Date.now();

const firstButtonX = 4443 ;
const firstButtonZ = -6780 ;
const buttonDist = 12;
const northBorder = -7025 ; //The z value until which you need to start walking
const southBorder = -6790 ;
const simultanousRow = 4;
const totalRow = 8;

var currentRow; //An integer of the row you are in

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x, z,run) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    if (run) {
        KeyBind.keyBind("key.sprint", true);

    }
    while ((Math.abs(p.getX() - x - 0.5) > 0.1 || Math.abs(p.getZ() - z - 0.5 ) > 0.1)){
        lookAtCenter(x,z);// Allow trajectory correction
        Client.waitTick();
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);

    Client.waitTick(lagTick);
    
}

function pressButton(x,z) { //Press the button on the east side of a block
    walkTo(x+1,z+1,true)
    p.lookAt(x+1.1,p.getY()+1.5,z+0.5)
    Client.waitTick(lagTick);
    p.interact();
    Client.waitTick(lagTick);
}

function followTheMachine(row) { // Follow the machine until the north of the farm, then come back
    walkTo(firstButtonX+row*buttonDist+2,firstButtonZ,false);
    p.lookAt(180,0);
    KeyBind.keyBind("key.forward", true);
    while (p.getZ()>northBorder) {
        Client.waitTick(10);
        p.lookAt(180,0);
        KeyBind.keyBind("key.forward", true);
    }
    Chat.log("Reached the end of the row, now going back")
    p.lookAt(0,0);
    KeyBind.keyBind("key.forward", false);
    while (p.getZ()<(southBorder)) {
        Client.waitTick();
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