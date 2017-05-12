//npm's
require("dotenv").config();
var password = process.env.password;
var mysql = require("mysql");
var inquirer = require("inquirer");
var exit = require("exit");
// Connect database
var connection = mysql.createConnection(
	{	host: "localhost",
		port: 3306,
		user: "root",
		password: password,
		database: "bamazon_db"
	});

connection.connect(function(err) {
	if (err) throw err;
	console.log("connected as id " + connection.threadId);
	selectItems();
});

var selectItems = function() {
	inquirer.prompt([{
	    name: "item",
 			type: "list",
	    message: "What would you like to do with the database?",
	    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Done"]
	}]).then(function(whichOne) {
//		console.log(whichOne);
		switch (whichOne.item) {
			case ("View Products for Sale"):
				listProducts();
				break;
			case ("View Low Inventory"):
				viewInventory();
				break;
			case ("Add to Inventory"):
				addInventory();
				break;
			case ("Add New Product"):
				addProduct();
				break;
			case ("Done"):
				allDone();
				break;
			default:
				console.log("Something went wrong with the selection process.");
		}
	});
}

var listProducts = function() {
	connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
		if (err) throw err;
//	console.log(res);
  	console.log("\nFollowing is a list of the items for sale:\n");
  	for ( i=0 ; i<res.length ; i++ ) {
  		console.log("Item No." + res[i].item_id + ", " +
  			"Product name: " + res[i].product_name + ", " + "Price $" + res[i].price);
  	}
  	console.log(" ");
 	selectItems();
	});
}

var viewInventory = function() {
	connection.query("SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5", function(err, res) {
		if (err) throw err;
//	console.log(res);
	if (res.length === 0) {
		console.log("All the items have a quantity of at least 5.\n");
	}
	else {
  		console.log("\nFollowing is a list of the items if there quantity is lower than 5:\n");
  		for ( i=0 ; i<res.length ; i++ ) {
  			console.log("Item No. " + res[i].item_id + ": " + res[i].product_name + ": " + res[i].stock_quantity);
  		}
  		console.log("");
  	}
 	selectItems();
	});
}

var addInventory = function() {
	inquirer.prompt([{
		name: "item",
		type: "input",
		message: "What is the item number of the product that you want to increase the inventory for?",
			validate: function(value) {
				if (isNaN(value) === false && value > 0) {
					return true;
				}
				else {
					return false;
				}
			}
		}, {
		name: "quantity",
		type: "input",
		message: "You want to increase the quantity by how many?",
			validate: function(value) {
				if (isNaN(value) === false && value > 0) {
					return true;
				}
				else {
					return false;
				}
			}
	}]).then(function(answer) {
		console.log(answer.item + " " + answer.quantity);
		connection.query("UPDATE products SET stock_quantity = stock_quantity + '"+answer.quantity+"' WHERE item_id = '"+answer.item+"'", function(err, res) {
			if (err) throw err;
//		console.log(res);
		console.log("");
		});
	selectItems();
	});
}

var addProduct = function() {
	inquirer.prompt([{
		name: "product",
		type: "input",
		message: "What is the product name that you want to add to the database?",
		}, {
		name: "department",
		type: "list",
		message: "Which department would you like to add it to?",
		choices: ["Grocery", "Pharmacy", "Automotive"],
		}, {
		name: "price",
		type: "input",
		message: "What is the price of the product?",
		}, {
		name: "quantity",
		type: "input",
		message: "What quantity do you want to start with?",
	}]).then(function(answer) {
		console.log(answer.product + " " + answer.department + " " + answer.price + " " + answer.quantity);
		connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('"+answer.product+"', '"+answer.department+"', '"+answer.price+"', '"+answer.quantity+"')", function(err, res) {
			if (err) throw err;
//		console.log(res);
		console.log("");
		});
	selectItems();
	});
}

var allDone = function() {
	exit();
}












// // Working through the product selection process
// var selectItems = function() {
// 	inquirer.prompt([{
// 	    name: "item",
//  		type: "input",
// 	    message: "What is the item number of the product you would like to buy?",
//     	validate: function(value) {
//     		if (isNaN(value) === false && value > 0 && value < 13) {
//     			return true;
//     		}
// 	   		else {
//     			return false;
//     		}
//     	}
//     }, {
//     	name: "quantity",
//     	type: "input",
//     	message: "How many of those would you like?",
//       	validate: function(value) {
//     		if (isNaN(value) === false) {
//     			return true;
//     		}
//     		else {
//     			return false;
//     		}
// 	   	}
// 	}]).then(function(answer) {
// 		inquirer.prompt([{
// 			name: "answer",
// 			type: "confirm",
// 			message: "You selected " + answer.quantity + " of item no. " +
// 				answer.item + ", correct?"
// 		}]).then(function(response) {
// 			if (response.answer) {
// 				itemNumber = answer.item;
// 				itemQuantity = answer.quantity;
// 				checkQty();
// 			}
// 			else {
// 				console.log("Let's try this again.");
// 				selectItems();
// 			}
// 		});
// 	});
// };
// // Checking if we have enough product and asking what to do if we don't
// var checkQty = function() {
// 	connection.query("SELECT product_name, price, stock_quantity FROM products WHERE item_id = '"+itemNumber+"'", function(err, res) {
// 	 	if (err) throw err;
// 	 	itemName = (res[0].product_name);
// 		itemPrice = (res[0].price);
// 		stockQuantity = (res[0].stock_quantity);
// 		if (stockQuantity < itemQuantity && stockQuantity > 0) {
// 			console.log("There is insufficient stock to fill your order.\nWe do have " +
// 				stockQuantity + " available.");
// 			inquirer.prompt([{
// 				name: "proceed",
// 				type: "confirm",
// 				message: "Would you like to order the remaining " + stockQuantity + "?"
// 			}]).then(function(response) {
// 				if (response.proceed) {
// 					itemQuantity = stockQuantity;
// 					updateData();
// 				}
// 				else {
// 					shopOrCheckOut();
// 				}
// 			});
// 		}
// 		else if (stockQuantity === 0) {
// 			console.log("There is no stock available to fill your order.");
// 			shopOrCheckOut();
// 		}
// 		else {
// 			updateData();
// 		}
// 	});
// };
// // Updating the selection array and then updating the database with present selection
// var updateData = function() {
// 	order.push(itemNumber);
// 	order.push(itemName);
// 	order.push(itemQuantity);
// 	order.push(itemPrice);
// 	connection.query("UPDATE products SET stock_quantity = stock_quantity - '"+itemQuantity+"' WHERE item_id = '"+itemNumber+"'", function(err, res) {
// 	 	if (err) throw err;
// 	});
// 	shopOrCheckOut();
// }
// // Product ordered so contiune to shop or head to checkout
// var shopOrCheckOut = function() {
// 	inquirer.prompt([{
// 		name: "newOrder",
// 		type: "confirm",
// 		message: "Would like to choose another item?  If \"n\", I will check you out."
// 	}]).then(function(response) {
// 		if (response.newOrder) {
// 			selectItems();
// 		}
// 		else {
// 			printOrder();
// 		}
// 	});
// };
// // Printing what was ordered
// function printOrder() {
// 	console.log("\n Your order consists of the following:\n");
// 	var p = 1;
// 	var t = 0;
// 	for ( i = 0 ; i < order.length ; (i=i+4) ) {
//     	var tot = order[i+2] * order[i+3];
//     	tot = tot.toFixed(2);
//     	console.log("  " + p + ". Item #" + order[i] + " " + order[i+1] + ", qty of " + order[i+2] + " at $" + order[i+3] + " each = $" + tot);
//     	p++;
//  	  	tot = parseFloat(tot);
//     	t = t + tot;
// 	}
// 	console.log("\n    The total cost of your order is: $" + t + "\n");
// 	exit(5);
// };
