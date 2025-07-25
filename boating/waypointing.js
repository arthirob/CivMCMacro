

const distance_between = 15;
const logFilePath = "waypoints.txt";

var waypointing = true;
var index = 0;
const p = Player.getPlayer();
var prevX = 0;
var prevZ = 0;
GlobalVars.putBoolean("stop",false);
Client.waitTick(10);
Chat.log("Waypointing Started");
while (waypointing) {
    if (GlobalVars.getBoolean("stop") == true) { 
        Chat.log("Waypointing Stopped");
        waypointing = false;
        break;        
        }
    const currentX = p.getX();
    const currentZ = p.getZ();
    const waypoint_distance = Math.sqrt((currentX - prevX) ** 2 + (currentZ - prevZ) ** 2);
    if (waypoint_distance > distance_between) {
        index++;

        const message = `{ x: ${Math.floor(p.getX())}, z: ${Math.floor(p.getZ())}, slow: 30, target: 3, label: '${index}'},\n`

        let fileHandler = FS.open(logFilePath, "UTF-8"); 
        fileHandler.append(message); 


        Chat.log("waypoint added")
        prevX = currentX;
        prevZ = currentZ;
    }
    Client.waitTick(10);

}
