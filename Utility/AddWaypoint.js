//Log all Chat

const logFilePath = "iceroadPos.txt";
const p = Player.getPlayer() ;

const message = `[${Math.floor(p.getX())},${Math.floor(p.getZ())}],`

let fileHandler = FS.open(logFilePath, "UTF-8"); // Open the file with UTF-8 encoding
fileHandler.append(message); // Append the text followed by a newline


Chat.log("done")