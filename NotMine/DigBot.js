/*

REPURPOSED DIG SCRIPT BY DOCKERIMAGE

ORIGINAL MAKER UNKNOWN

TO USE:
- HAVE FOOD IN HOTBAR
- HAVE A PICKAXE IN HOTBAR
- START 1 BLOCK DEEP AT THE CORNER OF THE DIG

CHANGES BY DOCKER:
- ADD AUTO ABORT 
- CUSTOMIZE QUARRY SIZE THROUGH CONFIG VALUE
- CUSTOM FOOD TYPE

*/

const white = 0xf;
const green = 0xa;
const darkGray = 0x8;
const gray = 0x7;
const red = 0xc;


/* CHANGE THESE VALUES BEFORE USING !!! */

const width = 16;
const depth = 16;

// key to press to abort
const abortKey = "s"
// baked_potato, bread, etc
const food = "baked_potato"


async function main() {
    const enabled = GlobalVars.getBoolean("toggle_minning")
    if (!enabled) {
        try {
            await enable()
            
            
        } catch (e) {
         //   Chat.log(JSON.stringify(e, ["message", "arguments", "type", "name", "stack"]))
            disable()
        }
    } else {
        disable()
    }
}


const commandList = [
    {
        name: 'Area',
        args: {
            depth: 'Depth',
            width: 'Width'
        },
        onStart: function () {

        }
    },
    {
        name: 'Exit',
        commands: [],
        onStart: () => {
            log(['Exiting Mining Bot'])
            GlobalVars.putBoolean("toggle_minning", false)
            return false
        }
    }
]

const HOTBAR_SLOT_BASE = 36
const HOTBAR_LENGTH = 9
const WALKING_TIME = 400
const WAITING_TIME = 400

async function enable () {
    GlobalVars.putBoolean("toggle_minning", true)
    let desiredYaw = snapToNearestCardinal()

    const player = Player.getPlayer()
    const inv = Player.openInventory()
    const pos = player.getPos()
    
    Chat.log("Starting Dig Bot")
    
    let index = hotbarFind(['minecraft:diamond_pickaxe'])
    if (index === -1) {
        log('No pickaxe found')
        disable()
        return
    }
    inv.setSelectedHotbarSlotIndex(index)

    moveTo({x:  Math.floor(pos.x) + 0.5, y: pos.y, z: Math.floor(pos.z) + 0.5})
    player.lookAt(desiredYaw, 0)
    move(WALKING_TIME * 2, {sneak: true})

    let enchants = getEnchants(inv.getSlot(inv.getSelectedHotbarSlotIndex() + HOTBAR_SLOT_BASE))
    const miningTime = Math.round(1000 / (enchants.efficiency / 2 || 1))

    Time.sleep(100)
    const miningArea = [depth, width]
    mineArea("Area", miningArea, player, desiredYaw, miningTime)
   
    disable()
}
function disable () {
    GlobalVars.putBoolean("toggle_minning", false)
    KeyBind.keyBind('key.forward', false)
    KeyBind.keyBind('key.backward', false)
}

function mineArea (command, commandArgs, player, desiredYaw, miningTime) {
    let yawTable = [
        {yaw: -180, pos: {x: -1, z: 1}, axis: 'z'}, // 0
        {yaw: -90, pos: {x: -1, z: -1}, axis: 'x'}, // 90
        {yaw: 0, pos: {x: 1, z: -1}, axis: 'z'}, // 180
        {yaw: 90, pos: {x: 1, z: 1}, axis: 'x'}, // -90
    ]
    let initialYaw = desiredYaw

    let depth = parseInt(commandArgs[0])
    let width = parseInt(commandArgs[1] || commandArgs[0])

    let targetDirection = yawTable.find(y => y.yaw === (desiredYaw % 360 - 180))
    let depthAxis = targetDirection.axis
    let widthAxis = depthAxis === 'x' ? 'z' : 'x'

    const inv = Player.openInventory()
    
    while (GlobalVars.getBoolean("toggle_minning")) {
        let direction = 1 // can remove this by just adding 180 and doing % 360
        player.lookAt(desiredYaw, 0)
        let initialPos = centeredPosition(player.getPos())
        let targetCoordWidth = Math.floor(player.getPos()[widthAxis]) + targetDirection.pos[widthAxis] * (width - 1)
        let finalTargetCoordDepth = Math.floor(player.getPos()[depthAxis]) + targetDirection.pos[depthAxis] * (depth - 1) * (depth % 2 === 0 ? 0 : 1)

        Time.sleep(10)

        while (Math.floor(player.getPos()[widthAxis]) !== targetCoordWidth || Math.floor(player.getPos()[depthAxis]) !== finalTargetCoordDepth) {
            checkManualAbort();
            let targetCoord = Math.floor(player.getPos()[depthAxis]) + targetDirection.pos[depthAxis] * (depth - 1) * direction
            while (Math.floor(player.getPos()[depthAxis]) !== targetCoord) {
                foodCheck()

                if (!GlobalVars.getBoolean("toggle_minning")) return
                mine(desiredYaw, 'center', 'downTopFace', miningTime)
                if (player.getPos().y < -48) placeWater()
                moveRelative(centeredPosition(player.getPos()), 1, {sneak: true})
            }
            if (Math.floor(player.getPos()[widthAxis]) !== targetCoordWidth) {
                desiredYaw += 90 * direction
                player.lookAt(desiredYaw, 0)
                let currentPos = centeredPosition(player.getPos())
                let passed = false
                while (!passed && GlobalVars.getBoolean("toggle_minning")) {
                    mine(desiredYaw, 'center', 'downTopFace', miningTime)
                    if (player.getPos().y < -48) placeWater()
                    passed = moveRelative(currentPos, 1, {sneak: true})
                }
                moveTo(centeredPosition(player.getPos()))
                desiredYaw += 90 * direction
                direction = -direction
            }
        }
        moveTo(initialPos)
        
        if (player.getPos().y === -63) {
            log(['Reached bedrock - Stopping execution'])
            return
        }
        mine(desiredYaw, 'center', 'bottom', miningTime)
        Time.sleep(WAITING_TIME)
        desiredYaw = initialYaw
    }
}

function snapToNearestCardinal (divisions = 4) {
    const player = Player.getPlayer()
    const angle = 360 / divisions

    let yaw = player.getYaw() % 360
    if (yaw < 0) yaw += 360
    const desiredYaw = (Math.round(yaw / angle) % divisions) * angle

    player.lookAt(desiredYaw, player.getPitch())
    return desiredYaw
}

function centeredPosition (pos) {
    return {
        x: Math.floor(pos.x) + 0.5,
        y: pos.y,
        z: Math.floor(pos.z) + 0.5
    }
}

function centerPlayer () {
    let pos = Player.getPlayer().getPos()
    return new Position(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z))
}
function moveTo(pos) {
    let player = Player.getPlayer()
    let playerPos = Player.getPlayer().getPos();
    player.lookAt(pos.x, Math.round(playerPos.y) + 1.6, pos.z)
    while (true) {
        playerPos = Player.getPlayer().getPos()
        player.lookAt(pos.x, playerPos.y + 1.6, pos.z)
        if (Math.round(playerPos.x * 10) !== Math.round(pos.x * 10) || Math.round(playerPos.z * 10) !== Math.round(pos.z * 10)) {
            move(2)
        } else {
            return
        }
    }
}
function mine (desiredYaw, xDirection, yDirection, miningTime) {
    let position = {
        left: {
            up: {angle: -40, yaw: -70},
            front: {angle: 0, yaw: -70},
            down: {angle: 40, yaw: -70}
        },
        center: {
            top: {angle: -90, yaw: 0},
            up: {angle: -55, yaw: 0},
            front: {angle: 0, yaw: 0},
            down: {angle: 70, yaw: 0},
            bottom: {angle: 90, yaw: 0},
            downTopFace: {angle: 40, yaw: 0}
        },
        right: {
            up: {angle: -40, yaw: 70},
            front: {angle: 0, yaw: 70},
            down: {angle: 40, yaw: 70}
        }
    }
    

    let player = Player.getPlayer()
    player.lookAt(desiredYaw + position[xDirection][yDirection].yaw, position[xDirection][yDirection].angle)
    KeyBind.key("key.mouse.left", true)
    Time.sleep(miningTime)
    KeyBind.key("key.mouse.left", false)
    checkManualAbort();
}
function getEnchants (itemStack) {
    let enchants = {}
    let NBT = itemStack.getNBT()
    if (!NBT) return enchants
    let enchantsList = NBT.asCompoundHelper().get('Enchantments')

    if (!enchantsList) return enchants

    enchantsList = enchantsList.asListHelper()

    for (let i = 0; i < enchantsList.length(); i++) {
        let enchant = enchantsList.get(i).asCompoundHelper()
        enchants[enchant.asString('id').replace('minecraft:', '')] = enchant.get('lvl').asNumberHelper().asInt()
    }
    return enchants
}


function isHanging () {
    const player = Player.getPlayer()
    const initialPos = player.getPos()
    move(WALKING_TIME, {sneak: true})
    const finalPos = player.getPos()
    return Math.abs(initialPos.x - finalPos.x) < 0.5 &&  Math.abs(initialPos.z - finalPos.z) < 0.5
}
function placeUnder (desiredYaw) {
    const player = Player.getPlayer()
    const inv = Player.openInventory()

    player.lookAt(desiredYaw + 180, 80)
    
    let currentSlot = inv.getSelectedHotbarSlotIndex()
    let index = hotbarFind(['minecraft:cobblestone', 'minecraft:stone', 'minecraft:cobbled_deepslate', 'minecraft:deepslate'])
    if (index === -1) {
        log(['No blocks found'])
        throw ""
    }

    inv.setSelectedHotbarSlotIndex(index)
    KeyBind.keyBind('key.use', true)

    Time.sleep(200)

    KeyBind.keyBind('key.use', false);
    inv.setSelectedHotbarSlotIndex(currentSlot)

    Time.sleep(100)
}
function placeWater () {
    const inv = Player.openInventory()
    let index = hotbarFind(['minecraft:water_bucket'])
    if (index === -1) {
        // log(['No water bucket found'])
    } else {
        let currentHotbarSlot = inv.getSelectedHotbarSlotIndex()
        inv.setSelectedHotbarSlotIndex(index)
        KeyBind.keyBind('key.use', true)
        Time.sleep(100)
        KeyBind.keyBind('key.use', false)
        Time.sleep(100)
        KeyBind.keyBind('key.use', true)
        Time.sleep(100)
        KeyBind.keyBind('key.use', false)
        inv.setSelectedHotbarSlotIndex(currentHotbarSlot)
    }
}
function move (time, options) {
    let defaultOptions = {
        direction: 'forward',
        sneak: false
    }
    options = {...defaultOptions, ...options}
    
    if (options.sneak) KeyBind.keyBind('key.sneak', true)
    KeyBind.keyBind(`key.${options.direction}`, true)

    Time.sleep(time)
    
    KeyBind.keyBind(`key.${options.direction}`, false)
    if (options.sneak) KeyBind.keyBind('key.sneak', false)
}
function moveRelative (startPos, distance, options) {
    let defaultOptions = {
        direction: 'forward',
        sneak: false
    }
    options = {...defaultOptions, ...options}

    const player = Player.getPlayer()

    if (options.sneak) KeyBind.keyBind('key.sneak', true)
    KeyBind.keyBind(`key.${options.direction}`, true)

    let tries = 0
    let sneakTries = 0

    while (Math.abs(player.getPos().x - startPos.x) < distance && Math.abs(player.getPos().z - startPos.z) < distance) {
        Time.sleep(10)
        tries++
        if (tries > 100) {
            if (sneakTries === 1) {
                KeyBind.keyBind(`key.${options.direction}`, false)
                if (options.sneak) KeyBind.keyBind('key.sneak', false)
                return false
            }
            KeyBind.keyBind(`key.${options.direction}`, false)
            let currentYaw = player.getYaw()
            placeUnder(currentYaw)
            player.lookAt(currentYaw, 0)
            tries = 0
            KeyBind.keyBind(`key.${options.direction}`, true)
            sneakTries++
        }
    }
    
    KeyBind.keyBind(`key.${options.direction}`, false)
    if (options.sneak) KeyBind.keyBind('key.sneak', false)
    return true
}

function foodCheck() {
    const minHungerLevel = 14;
    const maxHungerLevel = 16;

    const player = Player.getPlayer();
    const inv = Player.openInventory();

    if (player.getFoodLevel() > minHungerLevel) {
        return;
    }

    let currentHotbarSlot = inv.getSelectedHotbarSlotIndex()
    let foodSlot = hotbarFind(['minecraft:' + food]);
    if (foodSlot === -1) {
        return;
        // Stop bot?
    }
    inv.setSelectedHotbarSlotIndex(foodSlot);

    Client.waitTick();
    while (GlobalVars.getBoolean("toggle_minning") && player.getFoodLevel() < maxHungerLevel) {
        KeyBind.keyBind('key.use', true);
        Time.sleep(100);
    }
    inv.setSelectedHotbarSlotIndex(currentHotbarSlot);
    KeyBind.keyBind('key.use', false);
}
function hotbarFind(list) {
    let inv = Player.openInventory();
    for (var i = HOTBAR_SLOT_BASE; i <= HOTBAR_SLOT_BASE + HOTBAR_LENGTH; i++) {
        var slot = inv.getSlot(i);
        if (slot !== null && list.includes(slot.getItemID())) {
            return i-HOTBAR_SLOT_BASE;
        }
    }
    return -1
}

function log (message) {
    let textBuilder = Chat.createTextBuilder()
    message.forEach(part => {
        textBuilder.append(part.text || part).withColor(part.color || gray)
    })
    Chat.log(textBuilder.build())
}
async function waitEvent (event) {
    return new Promise((resolve) => {
        JsMacros.once(event, JavaWrapper.methodToJava((event, context) => {
            resolve(event.message)
            event.message = null
            context.releaseLock()
        }))
    })
}
function checkManualAbort() {
    if (KeyBind.getPressedKeys().contains("key.keyboard." + abortKey)) {
        Chat.log("Player has pressed abort key. Terminating.")
        disable()
        World.playSound("entity.ghast.scream", 100, 0);
    }
}
main()
   
