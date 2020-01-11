const LoanToken = artifacts.require("./contracts/LoanToken.sol");
const LoanTokenSale = artifacts.require("./contracts/LoanTokenSale.sol");
const GuarantorManager = artifacts.require("./contracts/GuarantorManager.sol");
const LoanManager = artifacts.require("./contracts/LoanManager.sol");

module.exports = function(deployer) {
  deployer.deploy(LoanToken, 1000000).then(function() {
    return deployer.deploy(LoanTokenSale, LoanToken.address, 1000000000000000).then(function(){
      return deployer.deploy(GuarantorManager).then(function(){
        return deployer.deploy(LoanManager, GuarantorManager.address, LoanToken.address);
      });
    })
  });
};
