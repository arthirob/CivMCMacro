/*
    ADVANCED QUARRY BOT
    By yodabird19
    
    This bot mines a rectangular area two blocks deep. It is equipped with dynamic
    position correcting and fall recovery to ensure smooth operation. It will self-
    terminate if it falls more than 5 blocks, falls less than 5 blocks but cannot
    recover, runs out of tool durability, or, of course, if it completes the job. 
    
    It is not recommended to use this bot on instamine blocks (eg
    haste II stone) or in unpredictable environments (eg around lava pools, caves,
    etc). 
    
    To configure this bot, set the coordinate boundaries (xMin, xMax, zMin, zMax)
    and average block mine time of your desired rectangular region, and start the bot
    in the northwestern corner thereof. 
*/

const p = Player.getPlayer()

// Config variables - CHANGE THESE
xMin = 2979 // Western boundary of hole
zMin = 4861 // Northern boundary of hole
xMax = 3020 // Eastern boundary of hole
zMax = 4876 // Southern boundary of hole
avgBlockMineTicks = 10 // On average, how long does a block in this environment
//                        take to mine? Doesn't need to be exact, only used for
//                        fall-correction system.
logoutOnTerminate = true // Logout when done?

// Tracking variables - do not edit
startingY = getY() // Records intended y level
mode = "main" // Tracks bot mode; options are "main-east", "main-west", "main-south", 
//               "main-north", "ascend-east", "ascend-west", "terminal"
needsAscend = false // Tracks whether bot needs to be going up
currentRowZ = zMin // Tracks current row

if (xMax <= xMin || zMax <= zMin) { // Ensure config variables are set right
    Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7rxMax and zMax config variables must"
    + " be greater than xMin and zMin respectively. Ensure that you have set your"
    + " config variables correctly.")
} else if (getX() != xMin || getZ() != zMin) { // Ensure bot is starting at right position
    Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7rBot must start at the northwestern"
    + " corner of the hole (" + xMin + ", " + zMin + ").")
} else { // All is well, run the bot
    Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7rBeginning quarry bot with dimensions "
    + (xMax-xMin+1) + "x" + (zMax-zMin+1) + ".")
    while (mode != "terminal") {
        tick()
        Client.waitTick(2)
    }
    Chat.actionbar("\u00A77\u00A7lMode: \u00A7c" + mode, false)
    KeyBind.keyBind("key.attack", false)
    KeyBind.keyBind("key.forward", false)
    if (logoutOnTerminate) {
        Client.waitTick(20)
        Chat.say("/logout")
    }
}

function tick() { // Main bot activity function
    setMode() // Before doing anything, determine mode
    if (mode == "main-east") { // Mining eastward
        // Handle row completion
        if (getX() >= xMax && getIntendedDirection() == "east"
            || getX() <= xMin && getIntendedDirection() == "west") {
            currentRowZ++;
            Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7rRow complete.")
        }
        p.lookAt(p.getPos().x+1.3, getY()+0.95, getZ()+0.5)
        KeyBind.keyBind("key.forward", true)
        KeyBind.keyBind("key.attack", true)
    }
    
    if (mode == "main-west") { // Mining westward
        // Handle row completion
        if (getX() >= xMax && getIntendedDirection() == "east"
            || getX() <= xMin && getIntendedDirection() == "west") {
            currentRowZ++;
            Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7rRow complete.")
        }
        p.lookAt(p.getPos().x-1.3, getY()+0.95, getZ()+0.5)
        KeyBind.keyBind("key.forward", true)
        KeyBind.keyBind("key.attack", true)
    }
    
    if (mode == "main-south") { // Mining southward (most likely, advancing row)
        p.lookAt(getX()+0.5, getY()+0.95, p.getPos().z+1.3)
        KeyBind.keyBind("key.forward", true)
        KeyBind.keyBind("key.attack", true)
    }
    
    if (mode == "main-north") { // Mining northward (only used to correct errors)
        p.lookAt(getX()+0.5, getY()+0.95, p.getPos().z-1.3)
        KeyBind.keyBind("key.forward", true)
        KeyBind.keyBind("key.attack", true)
    }
    
    if (mode == "ascend-north" || mode == "ascend-south" || mode == "ascend-east"
        || mode == "ascend-west") { // Bot has fallen down. Needs to correct position.
        ascend() // Send to special helper
    }
    checkBroken(); // Check for almost broken tool every tick
}

function ascend() { // Ascending is complicated; needs own function
    Client.waitTick(20) // In case this was triggered mid-fall
    
    if (getY() >= startingY - 5) { // The fall is still reasonably recoverable
        Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7ry-level has decreased."
        + " Correcting.")
        
        // Try the easy solution first
        KeyBind.keyBind("key.attack", false)
        KeyBind.keyBind("key.forward", true)
        KeyBind.keyBind("key.jump", true)
        Client.waitTick(20)
        KeyBind.keyBind("key.forward", false)
        KeyBind.keyBind("key.jump", false)
        Client.waitTick(10)
        
        // If the easy solution didn't work, let's try staircasing
        if (getY() < startingY) {
            KeyBind.keyBind("key.attack", false)
            KeyBind.keyBind("key.forward", false)
            KeyBind.keyBind("key.jump", false)
            climbAttemptsSinceStart = 0
            if (mode == "ascend-east") { // Ascending eastward
                xDelta = 1.5
                zDelta = 0.5
            }
            if (mode == "ascend-west") { // Ascending westward
                xDelta = -0.5
                zDelta = 0.5
            }
            
            // Attempt to staircase out of whatever hole we're in
            while (climbAttemptsSinceStart <= 10 && getY() < startingY) {
                // Mine one layer of staircase
                p.lookAt(getX()+xDelta, getY()+1.5, getZ()+zDelta)
                KeyBind.keyBind("key.attack", true)
                Client.waitTick(avgBlockMineTicks)
                p.lookAt(getX()+xDelta, getY()+2.5, getZ()+zDelta)
                KeyBind.keyBind("key.attack", true)
                Client.waitTick(avgBlockMineTicks)
                p.lookAt(getX()+xDelta, getY()+3.5, getZ()+zDelta)
                KeyBind.keyBind("key.attack", true)
                Client.waitTick(avgBlockMineTicks)
                
                // Advance up the newly mined layer
                KeyBind.keyBind("key.attack", false)
                KeyBind.keyBind("key.forward", true)
                for (i = 0; i < 10; i+= 2) {
                    p.lookAt(getX()+xDelta, p.getPos().y+1.625, getZ()+zDelta)
                    Client.waitTick(2)
                }
                KeyBind.keyBind("key.jump", true)
                for (i = 0; i < 10; i+= 2) {
                    p.lookAt(getX()+xDelta, p.getPos().y+1.625, getZ()+zDelta)
                    Client.waitTick(2)
                }
                KeyBind.keyBind("key.forward", false)
                KeyBind.keyBind("key.jump", false)
                for (i = 0; i < 5; i+= 2) {
                    p.lookAt(getX()+xDelta, p.getPos().y+1.625, getZ()+zDelta)
                    Client.waitTick(2)
                }
                
                // Increment counter of how long we've been trying
                climbAttemptsSinceStart++;
            }
            
            // We're done. This could be either because we returned to our intended y-level,
            // or because we ran out of attempts and gave up. If the former is the case,
            // ascend() will end and the bot will keep going as normal. If the latter is the
            // case, terminate.
            if (climbAttemptsSinceStart > 10) {
                mode = "terminal"
                Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7ry-level correction unsuccessful."
                + " Aborting quarry job.")
            }
        }
    }
}

function setMode() { // Determine bot mode
    previousMode = mode // To determine if mode was changed by this function
    if (getZ() > zMax) { // Is the bot done?
        mode = "terminal"
        if (mode != previousMode) {
            Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7rQuarry job complete."
            + " Mined an estimated " + ((xMax-xMin+1)*(zMax-zMin+1)*2) + " blocks.")
        }
    } else if (getY() < startingY - 5) { // Has the bot fallen too deep to recover?
        mode = "terminal"
        if (mode != previousMode) {
            Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7rUnrecoverable fall detected."
            + " Aborting quarry job.")
        }
    } else { // Bot can keep going
        if (getY() < startingY && !needsAscend) { // Has the bot fallen?
            needsAscend = true
        } else if (getY() >= startingY && needsAscend) { // Is the bot done being fallen?
            needsAscend = false
            Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7ry-level corrected.")
        }
        // Determine direction
        if (getZ() < currentRowZ) {
            if (needsAscend) {
                if (getIntendedDirection() == "east") {
                    mode = "ascend-east"
                } else {
                    mode = "ascend-west"
                }
            } else {
                mode = "main-south"
            }
        } else if (getZ() > currentRowZ) {
            if (needsAscend) {
                if (getIntendedDirection() == "east") {
                    mode = "ascend-east"
                } else {
                    mode = "ascend-west"
                }
            } else {
                mode = "main-north"
            }
        } else if (getIntendedDirection() == "east") {
            if (needsAscend) {
                mode = "ascend-east"
            } else {
                mode = "main-east"
            }
        } else if (getIntendedDirection() == "west") {
            if (needsAscend) {
                mode = "ascend-west"
            } else {
                mode = "main-west"
            }
        }
    }
    Chat.actionbar("\u00A77\u00A7lMode: \u00A7r" + mode, false) // debug
}

// Function that checks if the tool is almost broken & terminates if so
function checkBroken() {
    if (Chat.getHistory().getRecvLine(0).getText().getString() 
    == "Your tool is almost broken") {
        mode = "terminal"
        Chat.log("\u00A77\u00A7lQuarry Bot: \u00A7rTool break imminent."
        + " Aborting quarry job.")
    }
}

// Getter functions that return integer values instead of ugly decimals
function getX() {
    return Math.floor(p.getPos().x)
}
function getY() {
    return Math.floor(p.getPos().y)
}
function getZ() {
    return Math.floor(p.getPos().z)
}

// Getter function that basically just turns modulus into string
function getIntendedDirection() {
    if ((currentRowZ - zMin) % 2 == 0) {
        return "east"
    } else {
        return "west"
    }
}
