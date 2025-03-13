const p = Player.getPlayer() ;
const groundValue = 62;
const platformX = -15;
const platformY = 20;


const waitBeforeBash = 6;
const yawValue = -50;

var maxY ; 
var maxZ ;

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+0.5, z+0.5);
}

function walkTo(x, z,sneak) { // Walk to the center of a block
    lookAtCenter(x,z);
    if (sneak) {
        KeyBind.keyBind("key.sneak", true);

    }
    KeyBind.keyBind("key.forward", true);
    while (p.distanceTo(x+0.5,p.getY(),z+0.5)>0.05){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(3);
    
}

function placePerfect(){
    walkTo(Math.floor(p.getX()),Math.floor(p.getZ()),true);
}

function isOver(mode){ //Return true if the jump is over. Mode can be 1 for groundTouching, 2 is for on the other side of the hill
    if (mode==1){
        return (p.getY()>groundValue)
    }
    if (mode==2){
        if (p.getX()<platformX){
            return(false)
        } else {
            return (p.getY()>platformY)
        }
    }
}

function measureValue(){
    maxY = p.getY();
    maxX = p.getX();
    while (!isOver(1)){
        if (p.getY()>maxY){
            maxY = p.getY();
        }
        if (p.getX()>maxX){
            maxX = p.getX();
        }
    }
    Chat.say("We reached max y :"+Math.floor(maxY*100)/100+" and max x : "+Math.floor(100*maxX)/100);
    Chat.say("Value used are waitBeforeTheBash : "+waitBeforeBash+" and looking at "+yawValue);
}

placePerfect();
Chat.log("Starting running")
p.lookAt(-90,yawValue)
KeyBind.keyBind("key.forward", true);
KeyBind.keyBind("key.sprint", true);
Client.waitTick(2);
KeyBind.keyBind("key.sprint", false);
Client.waitTick();
KeyBind.keyBind("key.jump", true);
Client.waitTick();
KeyBind.keyBind("key.jump", false);

Client.waitTick(waitBeforeBash);
KeyBind.keyBind("key.use", true);
Client.waitTick(6);
KeyBind.keyBind("key.use", false);
measureValue();






