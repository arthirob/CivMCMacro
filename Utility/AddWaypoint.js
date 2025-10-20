//Log all Chat
/*
const p = Player.getPlayer() ;

const message = `[${Math.floor(p.getX())},${Math.floor(p.getZ())}],`

let fileHandler = FS.open(logFilePath, "UTF-8"); // Open the file with UTF-8 encoding
fileHandler.append(message); // Append the text followed by a newline


Chat.log("done")
*/

const p = Player.getPlayer() ;
const logFilePath = "iceroadPos.txt";
let fileHandler = FS.open(logFilePath, "UTF-8"); // Open the file with UTF-8 encoding
var numberOfPoint = 0;
var execution = true;
var lastX ;
var lastZ ;
var currentYaw;
var newYaw;

function addCoords(start){ // start is true if it's the first point
    if ((Math.floor(p.getX())!=lastX)||((Math.floor(p.getZ())!=lastZ))) {
        Chat.log("Adding datas");
        if (!start) { //Don't add the coma before the first point
                fileHandler.append(`,`);
        }
        message = `[${Math.floor(p.getX())},${Math.floor(p.getZ())}]`
        fileHandler.append(message); // Append the text followed by a newline
        numberOfPoint++;
        lastX = Math.floor(p.getX());
        lastZ = Math.floor(p.getZ());
    }
}

function genHexString(len) {
    const hex = '0123456789abcdef';
    let output = '';
    for (let i = 0; i < len; ++i) {
        output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return output;
}

function startLine(){
     fileHandler.append(`{"id":"${genHexString(12)}","line":[[`);
}

function endLine(){
    fileHandler.append(`]],"color":"#ff5e00"},`);
}


startLine();
addCoords(true);
while (execution) {
    currentYaw = Math.floor((p.getYaw()+405)/90)%4; //Weird stuff to get positive values
    Client.waitTick(2);
    newYaw = Math.floor((p.getYaw()+405)/90)%4; 
    if (currentYaw !=newYaw ) {
        addCoords(false);
    }
    if (KeyBind.getPressedKeys().contains("key.keyboard.left.shift")) {
        execution = false;
        addCoords(false);
        Chat.log(`Finished ! You placed ${numberOfPoint} points`)
    }
}
endLine();
