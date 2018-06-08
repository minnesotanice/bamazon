var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon",
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
    // console.log("hell yeah");
    showInventory();
});

// to be set in showInventory()  
// then used in showInventory() and getQuantity()
var chosenProduct;


function start() {

    console.log("\n************************************************************************************\nWelcome to the Bamazon car showroom! Below is a list of our current inventory.\n************************************************************************************");

    // show list of cars on Terminal. Include the ids, names, and prices of products for sale.

}

function showInventory() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // once you have the items, prompt the user for which they"d like to buy
        inquirer
            .prompt([{
                    name: "choice",
                    type: "rawlist",
                    pageSize: 66,

                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {

                            var details = `
ID: ${results[i].item_id}
Product: ${results[i].product_name}
Price: $${results[i].price}
----------------------------
`;

                            choiceArray.push(details);
                        }
                        return choiceArray;
                    },
                    prefix: "----------------------------------------------------------\n",
                    message: "What is the ID of the product you would like to buy?",
                    suffix: "\n----------------------------------------------------------\n"
                },
                {
                    type: "input",
                    name: "quantity",
                    message: "How many would you like to order?",
                    validate: function (value) {
                        var valid = !isNaN(parseFloat(value));
                        return valid || "Please enter a number";
                    },
                    filter: Number
                },

            ])
            .then(function (answer) {

                // ${answer.quantity} needs to be saved as a variable to pass into ${results[i].item_id}

                console.log(`
You chose  ${answer.quantity} ${answer.choice}
`);

                // get the information of the chosen product
                // set global var chosenProduct;
                for (var i = 0; i < results.length; i++) {

                    console.log(results[i].item_id, " ", answer.choice);

                    if (results[i].item_id == answer.choice) {

                        chosenProduct = results[i];

                        console.log(chosenProduct);

                    }
                }



            });
    });
}



// The app should then prompt users with two messages.
//    * The first should ask them the ID of the product they would like to buy.
//    * The second message should ask how many units of the product they would like to buy.



// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer"s request.
//    * If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.
//     * if your store _does_ have enough of the product, you should fulfill the customer"s order.
//  //  //    * This means updating the SQL database to reflect the remaining quantity.
//  //  //    * Once the update goes through, show the customer the total cost of their purchase.

// NOTE TO SELF, it would make sense that after showing the customer the total cost of their purchase, the terminal should ask the user if they would like to make another purchase. If yes, execute start function again. If no, console log thank you message.







//  * If this activity took you between 8-10 hours, then you"ve put enough time into this assignment. Feel free to stop here -- unless you want to take on the next challenge.