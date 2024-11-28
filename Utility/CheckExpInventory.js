/*Script to check the amount of crop you have for exp recipe and send them into a discord chat
V1.2 by arthirob and Zalvvv, 28/11/2024 

Things to improve
*/

//Constant and variables declaration
const p = Player.getPlayer() ;
const im = Player.getInteractionManager();
var inv = Player.openInventory();
const playerLocation = [5913,-6502]

const chestPlacement = [[5912,77,-6501],[5912,78,-6501],[5912,79,-6501],[5912,80,-6501],[5912,77,-6502],[5912,78,-6502],[5912,79,-6502],[5912,80,-6502],[5912,77,-6504],[5912,78,-6504],[5912,79,-6504]]
const expRecipe = [["minecraft:cocoa_beans",128,"Cocoa beans"],
["minecraft:twisting_vines",64,"Blue vine"],
["minecraft:glass_bottle",128,"Bottles"],
["minecraft:nether_wart",64,"Netherwart"],
["minecraft:red_mushroom",32,"Red mushroom"],["minecraft:carrot",128,"Carrots"],["minecraft:oak_sapling",32,"Oak saplings"],["minecraft:melon",128,"Melon"],["minecraft:kelp",64,"Kelp"],["minecraft:potato",256,"Potatoes"]]

function lookAtCenter(x, z) {// Look at the center of a block
    p.lookAt(x+0.5,p.getY()+1.5, z+0.5);
}

function walkSlowTo(x, z) { // Walk to the center of a block
    KeyBind.keyBind("key.sneak", true);
    lookAtCenter(x,z);
    KeyBind.keyBind("key.forward", true);
    while ((Math.abs(p.getX() - x - 0.5) > 0.1 || Math.abs(p.getZ() - z - 0.5 ) > 0.1)){
        lookAtCenter(x,z);//Correct the trajectory if needed
        Time.sleep(10);
    }
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.sneak", false);
    Client.waitTick(3);
    
}

function lookChest(number) {
    p.lookAt(chestPlacement[number][0]-0.5,chestPlacement[number][1]+0.8,chestPlacement[number][2]+0.5)
}

function mergeFun(tab1,tab2){// Adding values for same keys.
    var accumulator = tab1; //Copy the first map
    //Iterate on the second map
    for (let [key, value] of tab2) {
        accumulator.set(key, (accumulator.get(key) ?? 0) + value)
    }
    return accumulator
}

function mainCount() { //Count all the items in the chest
    walkSlowTo(playerLocation[0],playerLocation[1]);
    var totalItemCount = inv.getItemCount();
    for (let i=0;i<11;i++) {
        lookChest(i);
        Client.waitTick(2);
        im.interact();
        Client.waitTick(5);
        inv = Player.openInventory();
        totalItemCount = mergeFun(totalItemCount,inv.getItemCount());
        Player.openInventory().close();    
        Client.waitTick(2);
    }
    return totalItemCount
}

function emojiRelay(int) {
    if (int == 0){
        return(":red_square: : "+int+" recipe")
    }
    if ((int == 1) || (int ==2)){
        return (":orange_square: : "+int+" recipes")
    } else {
        return (":white_check_mark: : "+int+" recipes")

    }
}

let web = "https://discord.com/api/webhooks/1311751870372515963/J5sqWHq1tdhMu62Cb36rIE-m7ljedHkMYNU6UYlElTwiEyRfpk2efYFlcgqB9IJdclW9";

function SendWebhook(username, message) {
    let data = {
        "username": username,
        "content": message
    };

    const req = Request.create(web);
    req.addHeader('Content-Type', 'application/json');
    req.addHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    const response = req.post(JSON.stringify(data));
}


function chatRelay(totalItemCount) {
    let messageParts = []; // Initialize an array to store each part of the message
    
    for (let i = 0; i < 10; i++) {
        if (totalItemCount.containsKey(expRecipe[i][0])) {
            // Add the recipe info to the message array
            messageParts.push(
                `${expRecipe[i][2]} : ${emojiRelay(Math.floor(totalItemCount.get(expRecipe[i][0]) / expRecipe[i][1]))}`
            );
        } else {
            // Add the "0 recipes" message to the array
            messageParts.push(`${expRecipe[i][2]} : :red_square: 0 recipes`);
        }
    }

    // Join the message parts with single newline for one-paragraph separation
    const message = messageParts.join("\n");

    // Send the entire message via the webhook
    SendWebhook("Farmer shakira", message);
}



function main() { //Execute the functions in the correct order
    totalItemCount = mainCount();
    chatRelay(totalItemCount);
}

main();
