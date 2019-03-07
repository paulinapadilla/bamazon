//initializes the npm packages usedd

var mysql = require("mysql");
var inquirer = require("inquirer");


require("console.table");

//initializes the connection variable to sync with mySQL database
var connection = mysql.createConnection({
    host : "localhost",
    //Your port; if not 3306, checar = o : en HOST
    port : 3306,
    //usuario
    user : "root",
    //password
    password: "infinito",
    database: "bamazon"
});



//Creates the connection with the server and loads the product
//data upon a successful connection
connection.connect(function (err){
  if(err){
    console.log("error connecting: " + err.stack);
  }
  loadProducts();
});


//Function to load the products table from the database and print results o tye console
function loadProducts() {
  //selects all of the data from the MySQL products table
  connection.query("SELECT * FROM products", function(err,res){
    if(err) throw err;
    //Dra the table in the terminal using the response:
    console.table(res);

    //then prompt the customer for their choice of product, pass all the products to promptCustomerForIte
    promptCustomerForItem(res);
    
  });
}

// Prompt the customer for a product ID
function promptCustomerForItem(inventory){
  //prompt user for what they would like to purchase
  inquirer.prompt([
    {
      type: "input",
      name: "choice",
      message : "What is the ID of the item you would you like to purchase [Quit with Q]",
      validate : function(val){
        return !isNaN(val) || val.toLowerCase() === "q";
    }
  }
  ]).then(function(val){
    //check if the user wants to quit program
    checkIfShouldExit(val.choice);
    var choiceId= parseInt(val.choice);
    var product = checkInventory(choiceId, inventory);
    //if there is a product with the id the user chose, prompt the 
    //customer for a desired quantity

    if(product) {
      //pass the chosen product the promptCustomerForQuantity
      promptCustomerForQuantity(product);
    }else {
      //otherwise let them know the item is not in inventory, re-run loafProducts
 console.log("\nThat item is not in the inventory");
 loadProducts();
    }
  });
}

//Prompts the customer for a product quantity
function promptCustomerForQuantity(product){
  inquirer
  .prompt([{
    type: "input",
    name: "quantity",
    message : "how many would like ? [Quit with Q]",
    validate: function(val){
      return val > 0 || val.toLowerCase() === "q";
    }
  }]).then(function(val){
    //chaeck if the user wants to quit the program
    checkIfShouldExit(val.quantity);
    var quantity = parseInt(val.quantity);
    //if there isnt enough of the chosen product and quantity , let the user know and re-run loadproducts
    if(quantity > product.stock_quantity){
      console.log("\nInsufficient Quantity!");
      loadProducts();
    }else{
      //otherwise run makePurchase, give it the product info and desired quantity to purchase
      makePurchase(product, quantity);
    }
  });
}

//Purchase the desired quantity of the desired item
function makePurchase(product, quantity){
  connection.query(
    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE  item_id = ?",
    [quantity, product.item_id],
    function(err, res){
      //let the user know the purchase was succesfull, re-run loadProducts OJO CON LA COMILLA ABAJO EN ""S"
      console.log("\nSuccessfully purchased " + quantity + " " + product.product_name + "´s!");
      loadProducts();
    }
  );
}
//Check to see if the product the user chose exists in the inventory
function checkInventory(choiceId, inventory){
  for (var i = 0; i < inventory.length; i++){
    if(inventory[i].item_id === choiceId){
      return inventory[i];
    }
  }
  return null;
}
//check to see if the user wants to quit the program
function checkIfShouldExit(choice){
  if(choice.toLowerCase() === "q"){
    console.log("bye");
    process.exit(0);
  }
}

