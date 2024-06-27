var web3, contract;
async function init() {
    try {
        // Prompt the user to connect their MetaMask wallet
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Initialize web3 with the provider from MetaMask
        web3 = new Web3(window.ethereum);

        console.log("HELLO");

        // Replace 'abi' and 'address' with your contract ABI and address
        contract = new web3.eth.Contract(abi, address);
        console.log(web3, contract);

        // Get the current user account from MetaMask
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        console.log(account);

        // Your remaining code...
    } catch (error) {
        // Handle errors
        console.error(error);
    }
}

$(document).ready( async function () {
	await init()
	$("#_updatebtn").hide();
	$("#_addbtn").hide();

	// Show / hide register section.
	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];
		console.log(account)

		contract.methods.isRegistered(account).call().then(function (flag) {
			console.log("isRegistered : " + flag);
			if (flag) {
				$("#_regdiv").hide();
				$("#_addbtn").show();
			}
		});
	});


	// Fetching products.
	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];

		// Total my product
		contract.methods.getTotalProduct(account).call().then(function (totalProduct) {
			console.log("totalProduct my : " + totalProduct);
			$("#_totalproduct").html(totalProduct);
		});


		// Fetch my products.
		contract.methods.getTotalProduct().call().then(function (totalProduct) {
			console.log("totalProduct (global): " + totalProduct);

			var index = 1;
			for (index = 1; index <= totalProduct; index++) {
				contract.methods.getNextProduct(account, index).call().then(function (productDetails) {
					// index = productDetails + 1;
					console.log(productDetails);
					if (productDetails[4]) {
						var row = "<tr><th>" + productDetails[0] + "</th><td>" + productDetails[3] + "</td><td>" + productDetails[1] + "</td><td>" + productDetails[2] + "</td><td><button type=\"button\" class=\"btn btn-secondary btn-sm\" onclick=\"priceUpdate(" + productDetails[0] + ")\">Change price</button></td></tr>";
						$("#_myproduct_table").find('tbody').append(row);
					}
				});
			}

		});


		// Fetching total number of my product.
		contract.methods.getMyTotalOrder(account).call().then(function (totalOrder) {
			console.log("totalOrder my : " + totalOrder);
			$("#_total_order").html(totalOrder);

		});

		// Fetch my orders.
		contract.methods.getTotalOrder().call().then(function (totalOrder) {
			console.log("totalOrder (global): " + totalOrder);

			var index = 1;
			for (index = 1; index <= totalOrder; index++) {
				contract.methods.getMyNextOrderById(account, index).call().then(function (orderDetails) {
					// index = orderDetails + 1;
					console.log(orderDetails);
					if (orderDetails[6]) {
						var row = "<tr><th>" + orderDetails[0] + "</th><td>" + orderDetails[1] + "</td><td>" + orderDetails[2] + "</td><td>" + orderDetails[3] + "</td><td>" + orderDetails[5] + "</td><td>" + orderDetails[4] + "</td><td><button type=\"button\" class=\"btn btn-primary btn-sm\" onclick=\"delivered(" + orderDetails[0] + ")\">Delivered</button>\n<button type=\"button\" class=\"btn btn-secondary btn-sm\" onclick=\"reject(" + orderDetails[0] + ")\">Reject</button></td></tr>";
						$("#_order_table").find('tbody').append(row);
					}
				});
			}
		});


	});

	// Register new producer.
	$("#_regbutton").click(function () {
		web3.eth.getAccounts().then(function (accounts) {

			var account = accounts[0];
			console.log(account)
			var name = $("#_regname").val();

			return contract.methods.reginsterProducer(name).send({ from: account});
		}).then(function (trx) {
			console.log(trx);
			if (trx.status) {
				$("#_regdiv").hide();
				$("#_addbtn").show();
			}
		});
	});

	// Adding new product.
	$("#_addbtn").click(function () {
		web3.eth.getAccounts().then(function (accounts) {
			var account = accounts[0];
			var pname = $("#_pname").val();
			var pprice = $("#_price").val();
			var pquantity = $("#_pquantity").val();
			console.log(pname + pprice + pquantity);

			return contract.methods.addProduct(pname, pprice, pquantity).send({ from: account , gas:300000});
		}).then(function (trx) {
			console.log(trx);
			if (trx.status) {
				alert("Product added!");
				$("#_pname").val("");
				$("#_price").val("");
				$("#_pquantity").val("");
				location.reload();
			}
		});
	});

	// Update the price of a product.
	$("#_updatebtn").click(function () {
		web3.eth.getAccounts().then(function (accounts) {
			var account = accounts[0];
			var pid = $("#_pname").val();
			var pprice = $("#_price").val();
			console.log("update button click " + pid + pprice);

			return contract.methods.updatePrice(pid, pprice).send({ from: account });
		}).then(function (trx) {
			console.log(trx);
			if (trx.status) {
				alert("Price updated!");
				$("#_nameidlabel").html("Name");
				$("#_pricelabel").html("Price");
				$("#_quantitylabel").show();
				$("#_addbtn").show();
				$("#_updatebtn").hide();
				$("#_pname").val('');
				$("#_price").val('');
				location.reload();
			}
		});
	});


});

// Reject order.
function reject(orderId) {
	console.log("Reject " + orderId);

	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];
		var status = "Rejected";
		return contract.methods.updateOrderStatus(orderId, status).send({ from: account });
	}).then(function (trx) {
		console.log(trx);
		if (trx.status) {
			alert("Order rejected!");
			location.reload();
		}
	});
}

// Delivered order.
function delivered(orderId) {
	console.log("delivered " + orderId);
	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];
		var status = "Delivered";
		return contract.methods.updateOrderStatus(orderId, status).send({ from: account });
	}).then(function (trx) {
		console.log(trx);
		if (trx.status) {
			alert("Order delivered!");
			location.reload();
		}
	});
}

// Add the product details in from for price update.
function priceUpdate(productId) {
	console.log("order click : " + productId);
	// alert(productId);

	$("#_nameidlabel").html("Product ID");
	$("#_pricelabel").html("New price");
	$("#_quantitylabel").hide();
	$("#_addbtn").hide();
	$("#_updatebtn").show();
	$("#_pname").val(productId);
} 