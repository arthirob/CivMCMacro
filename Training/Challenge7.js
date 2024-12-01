const p = Player.getPlayer() ;
const xEast = 6026;
const xWest = 6016;
const zNorth = -6908;
const zSouth = -6900;

const torchGridX = 3;
const torchGridZ = 3;

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
    Client.waitTick();
}

function placeTorch(x,z){ // Place a torch if it follows the torch grid
    if ((x%torchGridX==0)&&(z%torchGridZ==0)) {
        p.lookAt(x+0.5,p.getY(),z+0.5);
        p.interact();
    }
}

for (let i=xWest;i<=xEast;i++) {
    for (let j=zSouth;j>=zNorth;j--) {
        walkTo(i,j);
        placeTorch(i,j);
    }
}

Chat.log("Script over");