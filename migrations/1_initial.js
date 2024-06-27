// var Adoption = artifacts.require("Adoption");
// var FP = artifacts.require("FarmProduct")
var SC = artifacts.require("SupplyChain")


module.exports = function(deployer) {

  deployer.deploy(SC);

};