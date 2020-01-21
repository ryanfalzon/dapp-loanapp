var LoanToken = artifacts.require('./contracts/LoanToken.sol');
var LoanManager = artifacts.require('./contracts/LoanManager.sol');
var GuarantorManager = artifacts.require('./contracts/GuarantorManager.sol');

contract('LoanManager', function(accounts){
    var loanManagerInstance;
    var loanTokenInstance;
    var guarantorManagerInstance;
    var borrower = accounts[1];
    var guarantor = accounts[2];
    var lender = accounts[3];
    var numberOfTokens = 100;
    var interest = 10;
    var requestId;
    var guaranteeId;
    var loanId;
    var cancelledRequestId;

    it('initializes the contract with the correct values', function(){
        return LoanManager.deployed().then(function(instance){
            loanManagerInstance = instance;
            return loanManagerInstance.administrator;
        }).then(function(address){
            // Test that administrator was set when deploying contract
            assert.notEqual(address, 0x0, 'has contract administrator address');

            return loanManagerInstance.registry();
        }).then(function(address) {
            // Test that the contract registry was set when deploying contract
            assert.notEqual(address, 0x0, 'has contract registry address');
        });
    });

    it('submit a request successfully', function(){
        return LoanManager.deployed().then(function(instance){
            loanManagerInstance = instance;
            return loanManagerInstance.submitRequest.call(0, 123, 1, { from: borrower });
        }).then(assert.fail).catch(function(error){
            // Test that when calling the submit request function the amount should be greater than 0
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanManagerInstance.submitRequest.call(100, 13, 1, { from: borrower });
        }).then(assert.fail).catch(function(error){
            // Test that when calling the submit request function the repay by should be greater than current block
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanManagerInstance.submitRequest(numberOfTokens, 1580673399, interest, { from: borrower });
        }).then(function(receipt){
            // Test that when successfully calling the submit request function the RequestSubmitted event should be emitted
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'RequestSubmitted', 'should be the RequestSubmitted event');
            assert.notEqual(receipt.logs[0].args._requestId, 0x0, 'logs the generated request id');
            requestId = receipt.logs[0].args._requestId;

            return loanManagerInstance.getBorrowerRequests(borrower);
        }).then(function(borrowerRequests){
            // Test that when successfully calling the submit request function the request should be added to borrower requests
            assert.equal(borrowerRequests.length, 1, 'adds request to borrower requests');

            return loanManagerInstance.getRequests();
        }).then(function(requests){
            // Test that when successfully calling the submit request function the request id should be added to the list
            assert.equal(requests.length, 1, 'request added to list');

            return loanManagerInstance.getRequest(requestId);
        }).then(function(request){
            // Test that when successfully calling the submit request function the request object is added to the list
            assert.equal(requestId, request[0], 'request object added');
        });
    });

    it('should submit a guarantee successfully', function(){
        return GuarantorManager.deployed().then(function(instance){
            guarantorManagerInstance = instance;
            return guarantorManagerInstance.addGuarantor(guarantor, {from: accounts[0]});
        }).then(function(){
            return LoanToken.deployed();
        }).then(function(instance){
            loanTokenInstance = instance;
            return LoanManager.deployed();
        }).then(function(instance){
            loanManagerInstance = instance;
            return loanManagerInstance.submitGuarantee.call(requestId, 5, {from: borrower});
        }).then(assert.fail).catch(function(error) {
            // Test that if the submitGuarantee function is called by a non-guarantor address, an error is thrown;
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanManagerInstance.submitGuarantee.call(requestId, 5, {from: guarantor});
        }).then(assert.fail).catch(function(error){
            // Test that if he submitGuarantee function is called without delegating tokens it fails
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanTokenInstance.transfer(guarantor, 1000);
        }).then(function(){
            return loanManagerInstance.submitGuarantee.call(requestId, 1000, {from: guarantor});
        }).then(assert.fail).catch(function(error){
            // Test that if the submitGuarantee function is called with a higher interest than that given by the borrower it fails
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanTokenInstance.approve(loanManagerInstance.address, numberOfTokens, {from: guarantor});
        }).then(function(){
            return loanManagerInstance.submitGuarantee(requestId, 2, {from: guarantor});
        }).then(function(receipt){
            // Test that when successfully calling the submitGuarantee function the GuaranteeSUbmitted event is emitted
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'GuaranteeSubmitted', 'should be the GuaranteeSubmitted event');
            assert.notEqual(receipt.logs[0].args._guaranteeId, 0x0, 'logs the generated guarantee id');
            guaranteeId = receipt.logs[0].args._guaranteeId;

            return loanManagerInstance.submitGuarantee.call(requestId, 1000, {from: guarantor});
        }).then(assert.fail).catch(function(error){
            // Test that if a request in an invalid state is passed to the submitGuarantee function, an error is thrown;
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanManagerInstance.getGuarantorGuarantees(guarantor);
        }).then(function(guarantees){
            // Test that when successfully calling the submitGuarantee function the guarantee is added to the guarantor guarantees mapping
            assert.equal(guarantees.length, 1, 'adds guarantee to guarantor guarantee');

            return loanManagerInstance.getGuarantees();
        }).then(function(guarantees){
            // Test that when successfully calling the submitGuarantee function the guarantee is added to the guarantees list
            assert.equal(guarantees.length, 1, 'guarantee added to list');

            return loanManagerInstance.getGuarantee(guaranteeId);
        }).then(function(guarantee){
            // Test that when successfully calling the submitGuarantee function the guarantee object is added to the list
            assert.equal(guaranteeId, guarantee[0], 'guarantee object added');

            return loanManagerInstance.getRequestGuarantee(requestId);
        }).then(function(guarantee){
            // Test that when successfully calling the submitGuarantee function the guarantee is mapped to the request
            assert.equal(guarantee[0], guaranteeId, 'guarantee mapped to request');

            return loanManagerInstance.getRequest(requestId);
        }).then(function (request){
            // Test that when successfully calling the submitGuarantee function the request status is updated
            assert.equal(request[5], 1, 'request status updated');
        });
    });

    it('should update request status when accepting guarantee', function(){
        return LoanManager.deployed().then(function(instance){
            loanManagerInstance = instance;
            return loanManagerInstance.acceptGuarantee.call(requestId, { from: lender });
        }).then(assert.fail).catch(function(error){
            // Test that if the acceptGuarantee function is called from an address that did not create the request, an error is thrown
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanManagerInstance.acceptGuarantee(requestId, { from: borrower });
        }).then(function (receipt){
            // Test that when successful calling the acceptGuarantee function, the GuarnateeAccepted event is emitted with no arguments
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'GuaranteeAccepted', 'should be the GuaranteeAccepted event');

            return loanManagerInstance.acceptGuarantee(requestId, { from: borrower });
        }).then(assert.fail).catch(function(error){
            // Test that if the acceptGuarantee function is called for a request which a guarantee has not yet been providing, an error is thrown
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            
            return loanManagerInstance.getRequest(requestId);
        }).then(function(request){
            // Test that when successfully calling the acceptGuarantee function, the request status is updated accordingly;
            assert.equal(request[5], 2, 'request status updated');

            return loanManagerInstance.getGuarantee(guaranteeId);
        }).then(function(guarantee){
            // Test that when successfully calling the acceptGuarantee function, the guarantee status is updated accordingly;
            assert.equal(guarantee[3], 5, 'guarantee status updated')
        });
    });

    it('should update request status when declining guarantee', function(){
        var declinedGuaranteeId;
        
        return LoanManager.deployed().then(function(instance){
            loanManagerInstance = instance;
            return LoanToken.deployed();
        }).then(function(instance){
            loanTokenInstance = instance;
            return loanManagerInstance.submitRequest(numberOfTokens, 1580673399, interest, { from: borrower });
        }).then(function(receipt){
            cancelledRequestId = receipt.logs[0].args._requestId;

            return loanManagerInstance.declineGuarantee.call(cancelledRequestId, {from: lender});
        }).then(assert.fail).catch(function(error){
            // Test that if the declineGuarantee function is called for a request which a guarantee has not yet been providing, an error is thrown;
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanTokenInstance.approve(loanManagerInstance.address, numberOfTokens, {from: guarantor});
        }).then(function(){
            return loanManagerInstance.submitGuarantee(cancelledRequestId, 5, {from: guarantor});
        }).then(function(receipt){
            declinedGuaranteeId = receipt.logs[0].args._guaranteeId;

            return loanManagerInstance.declineGuarantee.call(cancelledRequestId, { from: lender });
        }).then(assert.fail).catch(function(error){
            // Test that if the declineGuarantee function is called from an address that did not create the request, an error is thrown
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanManagerInstance.declineGuarantee(cancelledRequestId, {from: borrower});
        }).then(function (receipt){
            // Test that when successful calling the declineGuarantee function, the GuarnateeDeclined event is emitted with no arguments
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'GuaranteeDeclined', 'should be the GuaranteeDeclined event');

            return loanManagerInstance.getRequest(cancelledRequestId);
        }).then(function(request){
            // Test that when successfully calling the declineGuarantee function, the request status is updated accordingly;
            assert.equal(request[5], 3, 'request status updated');

            return loanManagerInstance.getGuarantee(declinedGuaranteeId);
        }).then(function(guarantee){
            // Test that when successfully calling the declineGuarantee function, the guarantee status is updated accordingly;
            assert.equal(guarantee[3], 3, 'guarantee status updated');
        });
    });

    it('should provide a loan successfully', function(){
        return LoanToken.deployed().then(function(instance){
            loanTokenInstance = instance;
            return LoanManager.deployed();
        }).then(function(instance){
            loanManagerInstance = instance;
            return loanManagerInstance.submitRequest(numberOfTokens, 1000, 5, {from: borrower});
        }).then(function(receipt){
            return loanManagerInstance.submitLoan(receipt.logs[0].args._requestId, {from: lender});
        }).then(assert.fail).catch(function(error){
            // Test that if the submitLoan is called with a request that is in an invalid state, an error is thrown;
            assert(error.message.indexOf('revert') >= 0, 'request is in an invalid status');

            return loanManagerInstance.submitLoan(requestId, {from: lender});
        }).then(assert.fail).catch(function(error){
            // Test that if the submitLoan function is called without delegating tokens, an error is thrown;
            assert(error.message.indexOf('revert') >= 0, 'tokens were not delegated');

            return loanTokenInstance.transfer(lender, 100);
        }).then(function(){
            return loanTokenInstance.approve(loanManagerInstance.address, numberOfTokens, {from: lender});
        }).then(function(){
            return loanManagerInstance.submitLoan(requestId, {from: lender});
        }).then(function(receipt){
            // Test that when successfully calling the submitLoan function, the LoanSubmitted event is emitted with one argument;
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'LoanSubmitted', 'should be the LoanSubmitted event');
            assert.notEqual(receipt.logs[0].args._loanId, 0x0, 'logs the generated guarantee id');
            loanId = receipt.logs[0].args._loanId;

            return loanManagerInstance.getLenderLoans(lender);
        }).then(function(loans){
            // Test that when successfully calling the submitLoan function, the loan is added to the mapping between an address and the loans issued by that address;
            assert.equal(loans.length, 1, 'adds loan to lender loans');

            return loanManagerInstance.getLoans();
        }).then(function(loans){
            // Test that when successfully calling the submitLoan function, the loan id should be added to the loan list;
            assert.equal(loans.length, 1, 'loan added to list');

            return loanManagerInstance.getLoan(loanId);
        }).then(function(loan){
            // Test that when successfully calling the submitLoan function, the loan object is added to the mapping between the loan id and the loan object;
            assert.equal(loanId, loan[0], 'loan object added');

            return loanManagerInstance.getLoanRequest(loanId);
        }).then(function(request){
            // Test that when successfully calling the submitLoan function, the loan is mapped to the request;
            assert.equal(request[0], requestId, 'loan mapped to request');

            return loanManagerInstance.getRequest(requestId);
        }).then(function (request){
            // Test that when successfully calling the submitLoan function, the request status is updated accordingly;
            assert.equal(request[5], 5, 'request status updated');
        });
    });

    it('should repay loan successfully', function(){
        return LoanManager.deployed().then(function(instance){
            loanManagerInstance = instance;
            return LoanToken.deployed();
        }).then(function(instance){
            loanTokenInstance = instance;
            return loanManagerInstance.repayLoan(loanId, {from: borrower});
        }).then(assert.fail).catch(function(error){
            // Test that if the repayLoan function is called without delegating tokens, an error is thrown
            assert(error.message.indexOf('revert') >= 0, 'tokens were not delegated');

            return loanTokenInstance.transfer(borrower, 150);
        }).then(function(){
            return loanTokenInstance.approve(loanManagerInstance.address, (numberOfTokens + interest), {from: borrower});
        }).then(function(){
            return loanManagerInstance.repayLoan(loanId, {from: guarantor});
        }).then(assert.fail).catch(function(error){
            // Test that if the repayLoan function is called by an address other than that of the borrower, an error is thrown;
            assert(error.message.indexOf('revert') >= 0, 'invalid message sender');

            return loanManagerInstance.repayLoan(loanId, {from: borrower});
        }).then(function(receipt){
            // Test that when successfully calling the repayLoan function, the LoanRepaid event is emitted with no arguments
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'LoanRepaid', 'should be the LoanRepaid event');

            return loanManagerInstance.repayLoan(loanId, {from: borrower});
        }).then(assert.fail).catch(function(error){
            // Test that is the repayLoan function is called with a loan that is in an invalid state, an error is thrown
            assert(error.message.indexOf('revert') >= 0, 'loan is in an invalid state');

            return loanManagerInstance.getRequest(requestId);
        }).then(function (request){
            // Test that when successfully calling the repayLoan  function, the request status is updated accordingly
            assert.equal(request[5], 4, 'request status not updated');

            return loanManagerInstance.getGuarantee(guaranteeId);
        }).then(function (guarantee){
            // Test that when successfully calling the repayLoan  function, the guarantee status is updated accordingly
            assert.equal(guarantee[3], 4, 'guarantee status not updated');

            return loanManagerInstance.getLoan(loanId);
        }).then(function(loan){
            // Test that when successfully calling the repayLoan function, the loan status is updated accordingly
            assert.equal(loan[3], 4, 'loan status not updated');
        });
    });

    it('should allow withdrawal of guarantee', function(){
        return LoanManager.deployed().then(function(instance){
            loanManagerInstance = instance;
            return LoanToken.deployed();
        }).then(function(instance){
            loanTokenInstance = instance;
            return loanTokenInstance.transfer(guarantor, 100);
        }).then(function(){
            return loanTokenInstance.transfer(lender, 100);
        }).then(function(){
            return loanTokenInstance.approve(loanManagerInstance.address, numberOfTokens, {from: guarantor});
        }).then(function(){
            return loanTokenInstance.approve(loanManagerInstance.address, numberOfTokens, {from: lender});
        }).then(function(){
            return web3.eth.getBlock('latest')
        }).then(function(currentBlock){
            return loanManagerInstance.submitRequest(numberOfTokens, (currentBlock.number + 5), 10, {from: borrower});
        }).then(function(receipt){
            requestId = receipt.logs[0].args._requestId;
            return loanManagerInstance.submitGuarantee(requestId, 5, {from: guarantor});
        }).then(function(receipt){
            guaranteeId = receipt.logs[0].args._guaranteeId;
            return loanManagerInstance.acceptGuarantee(requestId, {from: borrower});
        }).then(function(){
            return loanManagerInstance.submitLoan(requestId, {from: lender});
        }).then(function(receipt){
            loanId = receipt.logs[0].args._loanId;

            return loanManagerInstance.withdrawGuarantee(loanId, {from: lender});
        }).then(assert.fail).catch(function(error){
            // Test that if the withdrawGuarantee is called before the repay block defined by the borrower, an error is thrown
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');

            return loanManagerInstance.withdrawGuarantee(loanId, {from: borrower});
        }).then(assert.fail).catch(function(error){
            // Test that if the repayLoan function is called by an address other than that of the lender, an error is thrown
            assert(error.message.indexOf('revert') >= 0, 'message sender must be lender');
            
            return loanManagerInstance.withdrawGuarantee(loanId, {from: lender});
        }).then(function(receipt){
            // Test that when successfully calling the withdrawGuarantee function, the GuaranteeWithdrawn event is emitted with no arguments
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'GuaranteeWithdrawn', 'should be the GuaranteeWithdrawn event');

            return loanManagerInstance.withdrawGuarantee(loanId, {from: lender});
        }).then(assert.fail).catch(function(error){
            // Test that if the repayLoan function is called with a loan that is in an invalid state, an error is thrown
            assert(error.message.indexOf('revert') >= 0, 'invalid loan status');

            return loanManagerInstance.getRequest(requestId);
        }).then(function(request){
            // Test that when successfully calling the withdrawGuarantee function, the request status is updated accordingly
            assert.equal(request[5], 7, 'request status updated');

            return loanManagerInstance.getGuarantee(guaranteeId);
        }).then(function(guarantee){
            // Test that when successfully calling the withdrawGuarantee function, the guarantee status is updated accordingly
            assert.equal(guarantee[3], 6, 'guarantee status updated');

            return loanManagerInstance.getLoan(loanId);
        }).then(function(loan){
            // Test that when successfully calling the withdrawGuarantee function, the loan status is updated accordingly
            assert.equal(loan[3], 7, 'loan status updated');
        });
    });
});