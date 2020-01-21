var LoanToken = artifacts.require('./LoanToken.sol');
var LoanTokenSale = artifacts.require('./LoanTokenSale.sol');

contract('LoanTokenSale', function(accounts) {
    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000;
    var tokensAvailable = 100;
    var numberOfTokens;

    it('should initialize the contract with the correct values', function() {
        return LoanTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(function(address) {
            // Test that contract has been deployed successfully
            assert.notEqual(address, 0x0, 'has contract address');

            return tokenSaleInstance.administrator();
        }).then(function(administrator) {
            // Test that administrator has been set correctly when contract is deployed
            assert.equal(administrator, admin, 'administrator is incorrect');

            return tokenSaleInstance.registry();
        }).then(function(address) {
            // Test that contract registry address has been set correctly when contract is deployed
            assert.notEqual(address, 0x0, 'has contract registry address');

            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            // Test that token price has been set correctly when contract is deployed
            assert.equal(price, tokenPrice, 'token price is correct');
        });
    });

    it('should facilitate token buying', function() {
        return LoanToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return LoanTokenSale.deployed();
        }).then(function(instance) {
            tokenSaleInstance = instance
            return tokenSaleInstance.tokenPrice();
        }).then(function(response){
            tokenPrice = response;

            // Send tokens to token sale contract
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
        }).then(function(receipt) {
            numberOfTokens = 10;
            return tokenSaleInstance.buy(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });
        }).then(function(receipt) {
            // Test that if the buy function is successfull the TokensSold event is emmited
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'TokensSold', 'should be the TokensSold event');
            assert.equal(receipt.logs[0].args._buyerAddress, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');

            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            // Test that if the buy function is successfull the number of sold tokens is updates
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');

            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            // Test that if the buy function is successfull the balance of the buyer is updated
            assert.equal(balance.toNumber(), numberOfTokens);

            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            // Test that  if the buy function is successfull the balance of the contract is updated
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);

            return tokenSaleInstance.buy(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
            // Test that if the amount of ether does not match the number of tokens being bought multiplied by the token price results in an exception
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');

            numberOfTokens = 110;
            return tokenSaleInstance.buy(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })
        }).then(assert.fail).catch(function(error) {
            // Test that if the amount of tokens being bought is greater than the amount available results in an exception
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
        });
    });
});