/*Script to harvest a cocoa farm, and replant
V1.0 by arthirob, 04/07/2024 

Name definition :
A column is a height of cocoa
A tree is the 4 column around the logs
A quadrant is the block mode of 4 tree
A line is multiple cadrant aligned
All is the full farm

Things to improve
add the finish farm
*/


// Variable and constant declaration

const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
const inv = Player.openInventory();

//Farm size and coordinates
const firstQuadrantX = 47; // The X of the first quadrant, to check if you are in the farm or not
const firstQuadrantZ = -1784 ; // The Z of the first quadrant, to check if you are in the farm or not
const yGround = 97; // The ground level of the farm
const quadrantNorth = 3; // The number of quadrant to the north
const quadrantEast = 4; // The number of quadrant to the east
const lodeStoneDistX = 5; // The X distance between the same lodestone in an other quadrant
const lodeStoneDistZ = 5; // The Z distance between the same lodestone in an other quadrant

//Quadrant placement relative, the other lodestone coordinate, relative to the first lodestone
const LodeStoneX = [1,0,+2,+3];
const LodeStoneZ = [0,-2,-3,-1];



var currentX; //X at a given moment
var currentZ; //Z at a given moment
var currentLodestone; //The lodestone you are one at a given moment. A 3 long array with the line, quadrant and lodestone, starting at value 0

var dir; // -1 for east, 0 for south, 1 for west, and 2 for north
var prevX ; // Allows to check if X has changed in a loop
var prevZ ; // Allows to check if Z has changed in a loop
var prevY ; // Allows to check if Y has changed in a loop
var prevLode ; //Allow to access the currentLodestone value more easily
var treeX ; // The X of the tree you are farming
var treeZ ; // The Z of the tree you are farming


const startTime = Date.now();



function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.4 || Math.abs(p.getZ() - z - 0.5 ) > 0.4)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);
    
}

function dumpCocoa() //Throw the cocoa in the water in the direction of free space. South should be 0, then clock wise
{
    p.lookAt(45+90*currentLodestone[2],0);
    for (let i = 9; i < 45 ; i++)    {
        if (inv.getSlot(i).getItemID() == "minecraft:cocoa_beans") {
            inv.dropSlot(i,true)
            Client.waitTick();
        }

    }
    Client.waitTick(5);
    
}

function reachTopColumn(dir) { //Go on top of the column. We harvest one to reduce it's size, then fall down from it
    p.lookAt(90*dir,90)
    do {
        prevY = p.getY();
        KeyBind.keyBind("key.forward", true);
        Client.waitTick();
        KeyBind.keyBind("key.forward", false);
        Client.waitTick(10);
        }
    while ((p.getY()==prevY));
    im.interact();
    Client.waitTick(5);
    KeyBind.keyBind("key.sneak", true);
    KeyBind.keyBind("key.forward", true);
    do {
        prevZ = p.getZ();
        prevX = p.getX();
        Client.waitTick(3);
    }
    while ((p.getX()!=prevX)||(p.getZ()!=prevZ)); // Wait until you stoppped moving
    KeyBind.keyBind("key.forward", false);
    Client.waitTick();
    KeyBind.keyBind("key.sneak", false);
    p.lookAt(dir*90+180,83);
}

function farmColumn(dir) { //Farm a column from the top of the tree
    reachTopColumn(dir);
    KeyBind.keyBind("key.use", true);
    while (p.getY()>yGround) {
        Client.waitTick();
    }
    KeyBind.keyBind("key.use", false);
    Client.waitTick(5);
}

function farmTree() { //Farm a tree, starting from the lodestone under it
    treeX = Math.floor(p.getX());
    treeZ = Math.floor(p.getZ());
    while (dir<3) {
        KeyBind.keyBind("key.jump", true);
        Client.waitTick(1);
        KeyBind.keyBind("key.jump", false);
        Client.waitTick(10);
        farmColumn(dir);
        walkTo(treeX,treeZ);
        dir+=1;
    }
    dumpCocoa(currentLodestone[3]);
    dir =-1;
}

function changeLodestoneLine() { //Allow to change the lodestone by following the glass panel line
    prevLode = currentLodestone[2];
    currentX = firstQuadrantX+currentLodestone[0]*lodeStoneDistX ; //Get the quadrant X
    currentZ = firstQuadrantZ-currentLodestone[1]*lodeStoneDistZ ; //Get the quadrant Z
    if ((prevLode==0)||(prevLode==2)) {
        walkTo(currentX+LodeStoneX[prevLode+1],currentZ+LodeStoneZ[prevLode]);
        walkTo(currentX+LodeStoneX[prevLode+1],currentZ+LodeStoneZ[prevLode+1]);
    }
    if (prevLode==1) {
        walkTo(currentX+LodeStoneX[prevLode],currentZ+LodeStoneZ[prevLode+1]);
        walkTo(currentX+LodeStoneX[prevLode+1],currentZ+LodeStoneZ[prevLode+1]);
    }
    if (prevLode==3) { // GO to the next quadrant
        if (currentLodestone[1]==(quadrantNorth-1)) { //You are at the end of the line,do some crazy things with your feets !
            if (currentLodestone[0]<(quadrantEast-1)) {
                walkTo(currentX+LodeStoneX[0],currentZ+LodeStoneZ[0]);
                walkTo(firstQuadrantX+currentLodestone[0]*lodeStoneDistX+1,firstQuadrantZ-1)
                walkTo(firstQuadrantX+(currentLodestone[0]+1)*lodeStoneDistX+1,firstQuadrantZ-1)
                walkTo(firstQuadrantX+(currentLodestone[0]+1)*lodeStoneDistX+1,firstQuadrantZ)
            }
        } else {
            walkTo(firstQuadrantX+currentLodestone[0]*lodeStoneDistX+LodeStoneX[0],firstQuadrantZ-(currentLodestone[1]+1)*lodeStoneDistZ+LodeStoneZ[0]);
        }
    }
}

function farmQuadrant(){ // Farm a quadrant
    while (currentLodestone[2]<4) {
        farmTree();
        Chat.log("Doin a tree");
        Client.waitTick(10);
        changeLodestoneLine();
        currentLodestone[2]+=1;
    }
    currentLodestone[1]+=1;
    currentLodestone[2]=0;
}

function farmLine() { // Farm a line of quadrant, 
    while (currentLodestone[1]<quadrantNorth) {
        farmQuadrant()
    }
    //Walk between quadrant middle to not fall.
    currentLodestone[0]+=1;
    currentLodestone[1]=0;
}

function farmAll() { // Harvest the whole farm
    while (currentLodestone[0]<quadrantEast) {
        farmLine();
    }
    const farmTime = Math.floor((Date.now()-startTime)/1000);
    Chat.log("Farm is finished to harvest in "+(Math.floor(farmTime/60))+" minutes and "+(farmTime%60)+" seconds. Now logging out")
    Chat.say("/logout")   
}

function checkPosition (x,y,z) { //Check if the player is in the farm at the good level
    if (y != yGround) {
        throw("You need to be at ground level")
    }
    if (!((firstQuadrantX<=x)&&(x<=(firstQuadrantX+quadrantEast*lodeStoneDistX-1))&&((firstQuadrantZ-quadrantNorth*lodeStoneDistZ+1)<=z)&&(z<=firstQuadrantZ))) {
        throw("You are out of the farm")
    }
}

function startLodestone(x,z) { // Return an array with the current line, quadrant, and tree you are sitting on, or an exception of you are sitting on none
    const currentLine = Math.floor((x-firstQuadrantX)/lodeStoneDistX)
    const currentQuadrant = Math.floor((firstQuadrantZ-z)/lodeStoneDistZ)
    var found = false; //Check if you are in a lodestone or not
    var i=0;
    const quadrantCoordX = firstQuadrantX+currentLine*lodeStoneDistX;
    const quadrantCoordZ = firstQuadrantZ-currentQuadrant*lodeStoneDistZ;
    while ((i<4)&&(!found)) {
        if ((x==quadrantCoordX+LodeStoneX[i])&&(z==quadrantCoordZ+LodeStoneZ[i])) {
            found = true
        } else {
            i++;
        }
    }
    if (i==4) {
        throw("You need to start on a lodestone");
    }
    currentLodestone = [currentLine,currentQuadrant,i];
    farmAll();

}

function start() { //Allows to start back where you were. Finish the row, and place yourself at the start of the new row
    currentX = Math.floor(p.getX());
    currentY = Math.floor(p.getY());
    currentZ = Math.floor(p.getZ());
    checkPosition(currentX,currentY,currentZ);
    dir =(Math.floor((p.getYaw()+45)/90));
    if (dir==-2){
        dir = 2;
    }
    startLodestone(currentX,currentZ);


}

start();