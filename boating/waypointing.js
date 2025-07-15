

const distance_between = 15;
const logFilePath = "waypoints.txt";

var waypointing = true;
const p = Player.getPlayer();
var prevX = 0;
var prevZ = 0;
GlobalVars.putBoolean("stop",false);
Client.waitTick(30);
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

        const message = `{ x: ${Math.floor(p.getX())}, z: ${Math.floor(p.getZ())}},\n`

        let fileHandler = FS.open(logFilePath, "UTF-8"); 
        fileHandler.append(message); 


        Chat.log("waypoint added")
        prevX = currentX;
        prevZ = currentZ;
    }
    Client.waitTick(30);

}