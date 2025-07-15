//boating by jpmiii


var waypoints = [
{ x: 0, z: -0},
{ x: 100, z: 100}
];





var boating = true;
const p = Player.getPlayer();
var waypoint_index = 0;
var loop_count = 0;
var stuck = 0;

GlobalVars.putBoolean("stop",false);



function getUnitVector(v) {
  const length = Math.sqrt(v.x * v.x + v.z * v.z);
  if (length === 0) {
    return { x: 0, z: 0 }; // Avoid division by zero
  }
  return { x: v.x / length, z: v.z / length };
}

function signedAngleBetweenVectors(v1, v2) {

    const dotProduct = v1.x * v2.x + v1.z * v2.z;
    const magnitudeV1 = Math.sqrt(v1.x * v1.x + v1.z * v1.z);
    const magnitudeV2 = Math.sqrt(v2.x * v2.x + v2.z * v2.z);
    if (magnitudeV1 === 0 || magnitudeV2 === 0) {
        console.warn("One of the vectors has a magnitude of 0. Angle is undefined.");
        return 0; 
    }

    const cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);
    
    const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));
    const angleRad = Math.acos(clampedCosTheta);
    const crossProduct = v1.x * v2.z - v1.z * v2.x;

    return angleRad * Math.sign(crossProduct);
}



while (boating) {
    loop_count++;
    if (GlobalVars.getBoolean("stop") == true) { 
        Chat.log(`global: ${GlobalVars.getBoolean("stop")}`);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.right", false);
            KeyBind.keyBind("key.forward", false);
        break;        
        }
    const prevX = p.getX();
    const prevZ = p.getZ();
    const waypoint_distance = Math.sqrt((prevX - waypoints[waypoint_index].x) ** 2 + (prevZ - waypoints[waypoint_index].z) ** 2);
    if (waypoint_distance > 50) {
        KeyBind.keyBind("key.forward", true);
        Client.waitTick(30);
    } else {
        KeyBind.keyBind("key.forward", true);
        Client.waitTick(4);
        KeyBind.keyBind("key.forward", false);
        Client.waitTick(5);
        KeyBind.keyBind("key.forward", true);
        Client.waitTick(4);
        KeyBind.keyBind("key.forward", false);
        Client.waitTick(5);
        KeyBind.keyBind("key.forward", true);
    }
    
    const currentX = p.getX();
    const currentZ = p.getZ();
    const boat_distance = Math.sqrt((currentX - prevX) ** 2 + (currentZ - prevZ) ** 2);
    //Chat.log(`boat distance: ${boat_distance}`);
    if (boat_distance > 1.0) {
        stuck = 0;
        const waypoint_direction = getUnitVector({ x: currentX - waypoints[waypoint_index].x, z: currentZ - waypoints[waypoint_index].z });
        const boat_direction = getUnitVector({ x: currentX - prevX, z: currentZ - prevZ });
        const waypoint_distance = Math.sqrt((currentX - waypoints[waypoint_index].x) ** 2 + (currentZ - waypoints[waypoint_index].z) ** 2);

        if (waypoint_distance < 5 ) {
            waypoint_index++;
            if (waypoint_index >= waypoints.length) {
                boating = false;
                KeyBind.keyBind("key.forward", false);
                KeyBind.keyBind("key.left", false);
                KeyBind.keyBind("key.right", false);
                World.playSound("entity.experience_orb.pickup", 100);
                Chat.log("finished boating");
                break;
            }
            Chat.log(`waypoint ${waypoint_index} reached`);
            World.playSound("ui.toast.out", 100, .2);
        }


        
        
        const angle = signedAngleBetweenVectors(boat_direction, waypoint_direction);

        if (loop_count%10 == 0) {
            Chat.log(`waypoint: ${waypoint_index+1} distance: ${Math.trunc(waypoint_distance)} `);
        }
        //Chat.log(`angle: ${angle}`);
        if (angle > 0 && angle <= 2.50) {
            KeyBind.keyBind("key.left", true);
            Client.waitTick(4);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.right", false);
        } else if (angle < 3.10 && angle > 2.50) {
            KeyBind.keyBind("key.left", true);
            Client.waitTick(1);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.right", false);
        } else if (angle < 0 && angle > -2.50) {
            KeyBind.keyBind("key.right", true);
            Client.waitTick(4);
            KeyBind.keyBind("key.right", false);
            KeyBind.keyBind("key.left", false);
        } else if (angle > -3.10 && angle <= -2.50) {
            KeyBind.keyBind("key.right", true);
            Client.waitTick(1);
            KeyBind.keyBind("key.right", false);
            KeyBind.keyBind("key.left", false);
        } else {
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.right", false);
        }

    } else {
        stuck++;
        Chat.log(`boat stuck count: ${stuck}`);
        if (stuck > 20) {
            Chat.log("boat appears to be stuck, stopping script");
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.right", false);
            KeyBind.keyBind("key.forward", false);
            break;
        } else if (stuck > 10) {
            Chat.log("boat appears to be stuck, trying to unstick");
            KeyBind.keyBind("key.left", true);
            Client.waitTick(10);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.right", false);
            KeyBind.keyBind("key.forward", true);
            Client.waitTick(10);
        }
    }

}