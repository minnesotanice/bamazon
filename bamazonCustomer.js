// try incorporating this into homework https://www.npmjs.com/package/cli-table

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


function listInventory(results) {
    for (var i = 0; i < results.length; i++) {

        var details = `
ID: ${results[i].item_id}
Product: ${results[i].product_name}
Price: $${results[i].price}

----------------------------
`;

        console.log(details);
    }
}

function welcome() {

    console.log(`

************************************************************************************
Welcome to the Bamazon car showroom! Below is a list of our current inventory.
************************************************************************************

`);

}

function customerQuestions() {
    inquirer
        .prompt([{

                // CHOOSE ID OF PRODUCT
                type: "input",
                name: "choice",
                message: "What is the ID of the product you want?",
                validate: function (value) {

                    var valid = !isNaN(parseFloat(value));
                    return valid || "Please enter a number";

                },
                filter: Number

            },
            {
                // CHOOSE QUANTITY OF SELECTED PRODUCT
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

            console.log(`
You chose ${answer.quantity} of the ID ${answer.choice}.
`);

            // CHECK TO SEE IF ID ENTERED IS AN ID THAT EXISTS IN DATABASE
            connection.query(`SELECT item_id, stock_quantity FROM products`, function (error, results, fields) {
                if (error) {
                    console.log("where answer.choice quantity is checked", error);
                };

                // CHECK IF ID ENTERED BY USER IS AN ID THAT EXISTS IN DATABASE
                var validID;

                var stockOfProduct;

                for (var i = 0; i < results.length; i++) {

                    if (results[i].item_id == answer.choice) {

                        validID = true;

                        // CHECK STOCK AMOUNT FOR ID ENTERED
                        stockOfProduct = results[i].stock_quantity;

                    } else {

                        // DO NOTHING

                    }
                };

                if (validID == true) {

                    // COMPARE QUANTITY AVAILABLE TO QUANTITY REQUESTED 
                    if (stockOfProduct >= answer.quantity) {

                        // WHEN ENOUGH AVAILABLE, CONSOLE THIS
                        console.log(`
Stock quantity is ${stockOfProduct}.
Your order can be fulfilled. 
`);

                        // CALCULATE QUANTITY IN STOCK AFTER PURCHASE
                        var newQuantity = stockOfProduct - answer.quantity;

                        // UPDATE QUANTITY OF PRODUCTS IN DATABASE
                        connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [newQuantity, answer.choice], function (error, results, fields) {
                            if (error) {
                                console.log("ERROR FOR ----- UPDATE products SET stock_quantity = ? WHERE item_id = ?", error);
                            };
                        });

                        // CALCULATE PURCHASE PRICE
                        connection.query(`SELECT price FROM products WHERE item_id = ${answer.choice}`, function (error, results, fields) {
                            if (error) {
                                console.log("error from -CALCULATE COST OF PURCHASE-", error);
                            };

                            var totalCost = results[0].price * answer.quantity;

                            // console.log("Total cost is ", totalCost);
                            console.log(`
Total cost is ${totalCost}.
Thank you for your purchase!
`);

                            connection.end();

                        });

                    } else {

                        // WHEN NOT ENOUGH AVAILABLE, CONSOLE AMOUNT IN STOCK
                        console.log("Unfortunately, we only have", results[0].stock_quantity, "in stock. There is not enough stock to fulfill your order.\n");

                        // ASK IF CUSTOMER WOULD LIKE TO PLACE A DIFFERENT ORDER
                        differentOrder();

                    };


                } else {
                    console.log("You did NOT enter a valid ID.");
                    customerQuestions();
                };



            });

        });
}


function customerView() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) {
            console.log("this is just inside the customerView function", error);
        };

        listInventory(results);


        // once you have the items, prompt the user for which they"d like to buy
        customerQuestions();

    });
}

// WOULD YOU LIKE TO PLACE A DIFFERENT ORDER?
function differentOrder() {
    inquirer
        .prompt([{

            type: "confirm",
            name: "differentorder",
            message: "Would you like to place a different order?",
            default: false
        }])
        .then(function (answer) {

            if (answer.differentorder == true) {

                customerQuestions();

            } else {

                console.log(`

I\'m sorry to hear that. I hope you stop in again soon!

`);

                connection.end();

            };

        });



}

// THIS EXECUTES FIRST
connection.connect(function (err) {
    if (err) {
        console.log("ERROR BEFORE welcome FUNCTION AND customerView FUNCTION FIRED", error);
    };

    welcome();

    customerView();

});

// The app should then prompt users with two messages.
//    * The first should ask them the ID of the product they would like to buy.
//    * The second message should ask how many units of the product they would like to buy.



// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer"s request.
//    * If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.
//     * if your store _does_ have enough of the product, you should fulfill the customer"s order.
//  //  //    * This means updating the SQL database to reflect the remaining quantity.
//  //  //    * Once the update goes through, show the customer the total cost of their purchase.

// NOTE TO SELF, it would make sense that after showing the customer the total cost of their purchase, the terminal should ask the user if they would like to make another purchase. If yes, execute welcome function again. If no, console log thank you message.







//  * If this activity took you between 8-10 hours, then you"ve put enough time into this assignment. Feel free to stop here -- unless you want to take on the next challenge.