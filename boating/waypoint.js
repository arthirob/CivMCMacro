//Log all Chat

const logFilePath = "waypoints.txt";
const p = Player.getPlayer() ;

const message = `{ x: ${Math.floor(p.getX())}, z: ${Math.floor(p.getZ())}},\n`

let fileHandler = FS.open(logFilePath, "UTF-8"); // Open the file with UTF-8 encoding
fileHandler.append(message); // Append the text followed by a newline


Chat.log("done")