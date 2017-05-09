
require("dotenv").config();
var password = process.env.password;
var mysql = require("mysql");
var inquirer = require("inquirer");

var itemNumber = 0;
var itemQuantity = 0;
var itemPrice = 0;
var stockQuantity = 0;
var order = [];

var connection = mysql.createConnection(
	{	host: "localhost",
		port: 3306,
		user: "root",
		password: password,
		database: "bamazon_db"
	});

connection.connect(function(err) {
	if (err) throw err;
//	console.log("connected as id " + connection.threadId);
});

connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
 	if (err) throw err;
//	console.log(res);
 	console.log("");
 	console.log("Following is a list of the items for sale:");
 	console.log("");		
 	for ( i=0 ; i<res.length ; i++ ) {
 		console.log("Item No." + res[i].item_id + ", " +
 			"Product name: " + res[i].product_name + ", "+ "Price $" + res[i].price);
 	}
 	selectItems();
});

var selectItems = function() {

	inquirer.prompt([{
	    name: "item",
 		type: "input",
	    message: "What is the item number of the product you would like to buy?",
    	validate: function(value) {
    		if (isNaN(value) === false && value > 0 && value < 13) {
    			return true;
    		}
	   		else {
    			return false;
    		}
    	}
    }, {
    	name: "quantity",
    	type: "input",
    	message: "How many of those would you like?",
      	validate: function(value) {
    		if (isNaN(value) === false) {
    			return true;
    		}
    		else {
    			return false;
    		}
	   	}
	}]).then(function(answer) {
		inquirer.prompt([{
			name: "answer",
			type: "confirm",
			message: "You would like " + answer.quantity + " of " + "item " +
				answer.item + ", right?"
		}]).then(function(response) {
			if (response.answer) {
				itemNumber = answer.item;
				itemQuantity = answer.quantity;
				nextStep();
			}
			else {
				console.log("Let's try this again.");
				selectItems();
			}
		});
	});
};

function nextStep() {
	connection.query("SELECT stock_quantity FROM products WHERE item_id = '"+itemNumber+"'", function(err, res) {
	 	if (err) throw err;
		stockQuantity = (res[0].stock_quantity);
		if (stockQuantity < itemQuantity) {
			console.log("There is insufficient stock to fill your order.\nWe do have " +
				stockQuantity + " available.");
			inquirer.prompt([{
				name: "proceed",
				type: "confirm",
				message: "You would like to order the remaining " + stockQuantity + "?"
			}]).then(function(response) {
				if (response.proceed) {
					itemQuantity = stockQuantity;
//					console.log(itemQuantity);
				}
			});
		}
		inquirer.prompt([{
			name: "newOrder",
			type: "confirm",
			message: "Would like to chose another item?  If \"n\", I will check you out."
		}]).then(function(response) {
			if (response.newOrder) {
				console.log(itemNumber + " " + itemQuantity + " " + itemPrice)
//				order.push(itemNumber);
//				order.push(itemQuantity);
//				order.push(itemPrice);
//				selectItems();
			}
			else {
				console.log("Let's check you out");
//				printOrder();
			}
		});	
	});
};

//process.exit(code);

function printOrder() {
	console.log("\n Your order consists of the following:\n");
	var p = 1;
	var t = 0;
	for ( i = 0 ; i < order.length ; (i=i+3) ) {
    	var tot = order[i] * order[i+2];
    	console.log(" " + p + ". " + order[i+1] + ":" + " qty of " + order[i] + " at $" + order[i+2] + " each = $" + tot);
    	p++;
    	t = t + tot;
	}
	console.log("\n The total cost of your order: $" + t + "\n");
};