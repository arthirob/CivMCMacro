const p = Player.getPlayer() ;
const xEast = 6026;
const xWest = 6016;
const zNorth = -6908;
const zSouth = -6900;

var dir;//The direction you are going. 1 for north, 0 for south. Edit here to change the start value
var lineFinished;


function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY(), z+0.5);
}

function walkTo(x, z) { // Walk to the center of a block
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.2 || Math.abs(p.getZ() - z - 0.5 ) > 0.2)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    Client.waitTick(3);
    
}

function line(x) {
    if (dir==0) {
        walkTo(x,zNorth);
        walkTo(x,zSouth);
    } else {
        walkTo(x,zSouth);
        walkTo(x,zNorth);
    }

}

dir = 1;
for (let i=xWest;i<=xEast;i++) {
    line(i);
    dir = 1-dir;
}
Chat.log("Script over");