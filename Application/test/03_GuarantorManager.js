var GuarantorManager = artifacts.require("./contracts/GuarantorManager.sol");

contract('GuarantorManager', function(accounts) {
    var guarantorManagerInstance;

    it('initializes the contract', function(){
        return GuarantorManager.deployed().then(function(instance){
            guarantorManagerInstance = instance;
            return guarantorManagerInstance.address;
        }).then(function(address){
            // Test that contract has been deployed successfully
            assert.notEqual(address, 0x0, 'has contract address');
        });
    });

    it('adds a guarantor', function(){
        return GuarantorManager.deployed().then(function(instance){
            guarantorManagerInstance = instance;
            return guarantorManagerInstance.addGuarantor.call(accounts[1], {from: accounts[2]});
        }).then(assert.fail).catch(function(error){
            // Test that if the add guarantor function is called from a non-admin it will revert
            assert(error.message.indexOf('revert') >= 0, 'cannot be called from a non-admin');

            return guarantorManagerInstance.addGuarantor(accounts[1]);
        }).then(function(receipt){
            // Test that successfully calling the add guarantor function will emit the GuarantorAdded event
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'GuarantorAdded', 'should be the GuarantorAdded event');
            assert.equal(receipt.logs[0].args._guarantorAddress, accounts[1], 'logs the guarantor address that has been added');

            return guarantorManagerInstance.isGuarantor(accounts[1]);
        }).then(function(response) {
            // Test that successfully calling the add guarantor function will make the address a guarantor
            assert.equal(response, true, 'makes address a guarantor');

            return guarantorManagerInstance.getGuarantors();
        }).then(function(guarantors) {
            // Test that successfully calling the add guarantor function will add the guarantor to the list
            assert.equal(guarantors.length, 1, 'add guarantor');

            return guarantorManagerInstance.addGuarantor(accounts[1]);
        }).then(assert.fail).catch(function(error){
            // Test that calling the add guarantor function with an address that is already a guarantor should fail
            assert(error.message.indexOf('revert') >= 0, 'cannot add a guarantor that is already a guarantor');
        });
    });

    it('deletes a guarantor', function(){
        return GuarantorManager.deployed().then(function(instance){
            guarantorManagerInstance = instance;
            return guarantorManagerInstance.removeGuarantor.call(accounts[1], {from: accounts[2]});
        }).then(assert.fail).catch(function(error){
            // Test that if the remove guarantor manager is called from a non-admin it will revert
            assert(error.message.indexOf('revert') >= 0, 'cannot be called from a non-admin');

            return guarantorManagerInstance.removeGuarantor(accounts[1]);
        }).then(function(receipt){
            // Test that successfully calling the remove guarantor function will emit the GuarantorAdded event
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'GuarantorDeleted', 'should be the GuarantorDeleted event');
            assert.equal(receipt.logs[0].args._guarantorAddress, accounts[1], 'logs the guarantor address that has been added');

            return guarantorManagerInstance.isGuarantor(accounts[1]);
        }).then(function(response) {
            // Test that successfully calling the remove guarantor function will make the address a guarantor
            assert.equal(response, false, 'removes guarantor');

            return guarantorManagerInstance.removeGuarantor(accounts[1]);
        }).then(assert.fail).catch(function(error){
            // Test that calling the remove guarantor function with an address that is already a guarantor should fail
            assert(error.message.indexOf('revert') >= 0, 'cannot remove a guarantor that is not a guarantor');
        });
    });
});