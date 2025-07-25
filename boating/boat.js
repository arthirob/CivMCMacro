// boating by jpmiii


var waypoints = [
{ x: 0, z: -0 , slow: 15, target: 3 , label: "home"},
{ x: 123, z: -123, slow: 15, target: 3 },
{ x: 345, z: -345 }, // there are defaults for slow, target, and label defaults to index+1
{ x: 3, z: -4 , slow: 0, target: 15 , label: "almost there"},
{ x: 99, z: -99 , slow: 15, target: 5 , label: "woo hoo"},
];

var reverse = false; //set to true to boat in reverse  order

const d2d = Hud.createDraw2D();
let dismeter = null;
d2d.setOnInit(JavaWrapper.methodToJava(() => {
    dismeter = d2d.addText('Start Boating', 0, d2d.getHeight()-20 - 10, 0xFFFFFF, true);
}));
d2d.register();

var boating = true;
const p = Player.getPlayer();
const default_target = 5;
const default_slow = 20
var loop_count = 0;
var stuck = 0;
GlobalVars.putBoolean("stop",false);


if (GlobalVars.getInt("boat_index")) {
    waypoint_index = GlobalVars.getInt("boat_index");
    //Chat.log(`resuming at waypoint ${waypoint_index+1}`);       
} else {
    if (reverse == true) {
        waypoint_index = waypoints.length - 1
    } else {
        waypoint_index = 0;
    }

    //Chat.log(`starting at waypoint ${waypoint_index+1}`);       
}

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

function finished() {
    boating = false;
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.left", false);
    KeyBind.keyBind("key.right", false);
    GlobalVars.remove("boat_index");
    World.playSound("entity.experience_orb.pickup", 100);
    Chat.log("finished boating");
    d2d.unregister();    
}

while (boating) {
    loop_count++;
    if (GlobalVars.getBoolean("stop") == true) { 
        Chat.log(`global stop: ${GlobalVars.getBoolean("stop")}`);
        KeyBind.keyBind("key.left", false);
        KeyBind.keyBind("key.right", false);
        KeyBind.keyBind("key.forward", false);
        d2d.unregister();
        break;        
        }
    const prevX = p.getX();
    const prevZ = p.getZ();
    const waypoint_distance = Math.sqrt((prevX - waypoints[waypoint_index].x) ** 2 + (prevZ - waypoints[waypoint_index].z) ** 2);
    if ('slow' in waypoints[waypoint_index]) {
        var slow = waypoints[waypoint_index].slow;
    } else {
        var slow = default_slow;
    }
    if (waypoint_distance > slow) {
        KeyBind.keyBind("key.forward", true);
        Client.waitTick(20);
    } else {
        KeyBind.keyBind("key.forward", true);
        Client.waitTick(3);
        KeyBind.keyBind("key.forward", false);
        Client.waitTick(6);
        KeyBind.keyBind("key.forward", true);
        // Client.waitTick(4);
        // KeyBind.keyBind("key.forward", false);
        // Client.waitTick(5);
        // KeyBind.keyBind("key.forward", true);
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
        if ('target' in waypoints[waypoint_index]) {
            var target = waypoints[waypoint_index].target;
        } else {
            var target = default_target;
        }
        if (waypoint_distance < target ) {
            // if ('label' in waypoints[waypoint_index]) {
            //     Chat.log(`waypoint ${waypoints[waypoint_index].label} reached`);
            // } else {
            //     Chat.log(`waypoint ${waypoint_index+1} reached`);
            // }
            if(reverse == false) {
                waypoint_index++;
            } else {
                waypoint_index--;
            }
            GlobalVars.putInt("boat_index", waypoint_index);
            if (reverse == true) {
                if (waypoint_index < 0) {
                    finished();    
                    
                    break;
                }
            } else {
                if (waypoint_index >= waypoints.length) {
                    finished();    
                    break;
                    // reverse = true;
                    // World.playSound("entity.experience_orb.pickup", 100);
                    // waypoint_index = waypoints.length - 1;
                    // Client.waitTick(100);
                }
            }
            

            
            World.playSound("ui.toast.out", 100, .2);
        }
    


        
        
        const angle = signedAngleBetweenVectors(boat_direction, waypoint_direction);

        // if (loop_count%10 == 0) {
        //     Chat.log(`waypoint: ${waypoint_index+1} distance: ${Math.trunc(waypoint_distance)} `);
        // }
        if ('label' in waypoints[waypoint_index]) {
            dismeter?.setText(`waypoint: ${waypoints[waypoint_index].label} distance: ${Math.trunc(waypoint_distance)} `)
        } else {
            dismeter?.setText(`waypoint: ${waypoint_index+1} distance: ${Math.trunc(waypoint_distance)} `)
        }

        //Chat.log(`angle: ${angle}`);
        if (angle > 0 && angle <= 2.50) {
            KeyBind.keyBind("key.left", true);
            Client.waitTick(4);
            KeyBind.keyBind("key.left", false);
            
        } else if (angle < 3.10 && angle > 2.50) {
            KeyBind.keyBind("key.left", true);
            Client.waitTick(1);
            KeyBind.keyBind("key.left", false);
            
        } else if (angle < 0 && angle > -2.50) {
            KeyBind.keyBind("key.right", true);
            Client.waitTick(4);
            KeyBind.keyBind("key.right", false);
            
        } else if (angle > -3.10 && angle <= -2.50) {
            KeyBind.keyBind("key.right", true);
            Client.waitTick(1);
            KeyBind.keyBind("key.right", false);
            
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
        } else if (stuck > 3) {
            Chat.log("boat appears to be stuck, trying to unstick");
            KeyBind.keyBind("key.left", true);
            KeyBind.keyBind("key.back", true);
            Client.waitTick(10);
            KeyBind.keyBind("key.left", false);
            KeyBind.keyBind("key.right", false);
            KeyBind.keyBind("key.back", false);
            KeyBind.keyBind("key.forward", true);
        }
    }
}
