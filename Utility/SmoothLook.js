const p = Player.getPlayer() ;
const steps = 15;
const coeff = makeArray(steps);
const sleepTime = 5;

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

function lookAtCenter(x,y,z){
    smoothBlockLook(x+0.5,y+0.5,z+0.5)
}

lookAtCenter(30,60,40);