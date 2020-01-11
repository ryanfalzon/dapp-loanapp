var LoanToken = artifacts.require("./contracts/LoanToken.sol");

contract('LoanToken', function(accounts) {
    var tokenInstance;

    it('initializes the contract with the correct values', function(){
        return LoanToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            // Test that token name has been set correctly when contract is deployed
            assert.equal(name, 'Loan Token', 'has the correct name');

            return tokenInstance.symbol();
        }).then(function(symbol){
            // Test that token symbol has been set correctly when contract is deployed
            assert.equal(symbol, 'LTX', 'has the correct symbol');
        });
    });

    it('allocates initial supply upon deployment', function(){
        return LoanToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            // Test that the total supply is set correctly from the constructor
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
            return tokenInstance.balanceOf(accounts[0]);

        }).then(function(adminBalance){
            // Test that the total supply is transferred to the admin's account account from the constructor
            assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account');
        });
    });

    it('transfers ownership', function(){
        return LoanToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 1000001);
        }).then(assert.fail).catch(function(error){
            // Test that transfer function is not successfull when amount is larger than total supply
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
        }).then(function(success){
            // Test that transfer function is successfull when the amount is smaller than available balance of message sender
            assert.equal(success, true, 'it returns true');

            return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});
        }).then(function(receipt){
            // Test that a successfull transfer function emits the Transfered event
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfered', 'should be the Transfered event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');

            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            // Test that a successfull transfer function updates the balance of the receiver
            assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');

            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            // Test that a successfull transfer function updates the balance of the message sender
            assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending account');
        });
    });

    it('approves tokens for delegated transfer', function(){
        return LoanToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success){
            // Test that a successfull approve function returns true
            assert.equal(success, true, 'it returns true');

            return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function(receipt){
            // Test that a successfull approve function emits the Approved event
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approved', 'should be the Approved event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
            assert.equal(receipt.logs[0].args._spender  , accounts[1], 'logs the account the tokens are authorized to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');

            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance){
            // Test that a successfull approve function updates the allowed balance of the receiver
            assert(allowance, 100, 'stored the allowance for delegated transfer');
        });
    });

    it('handles delegated token transfers', function(){
        return LoanToken.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
        }).then(function(receipt){
            return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
        }).then(function(receipt){
            return tokenInstance.transferFrom(fromAccount, toAccount, 999, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            // Test that calling the transfer from function witha  avalue larger than the balance of the _from account
            assert(error.message.indexOf('revert') >=0, 'cannot transfer value larger than balance');

            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            // Test that calling the transfer from function witha  avalue larger than that approved fails
            assert(error.message.indexOf('revert') >=0, 'cannot transfer value larger than approved amount');

            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(success){
            // Test that successfully calling the tranfer from function returns true
            assert.equal(success, true, 'it returns true');

            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(receipt){
            // Test that successfully calling the transfer from function emits the Transferred event
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfered', 'should be the Transfered event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');

            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance){
            // Test that successfully calling the transfer from function reduced the balance of the from accoun
            assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');

            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance){
            // Test that successfully calling the transfer from function reduces the balance of the receiving account
            assert.equal(balance.toNumber(), 10, 'adds the amount to the receiving account');

            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance){
            // Test that successfully calling the transfer from function reduces the allowed approved balance from the mesasge sender
            assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
        });
    });
});