var LoanToken = artifacts.require('./contracts/LoanToken.sol');
var LoanManager = artifacts.require('./contracts/LoanManager.sol');

contract('LoanManager', function(accounts){
    var loanManagerInstance;
    var loanTokenInstance;
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

            return loanManagerInstance.guarantorManager();
        }).then(function(address) {
            // Test that the guarantor manager contract was set when deploying contract
            assert.notEqual(address, 0x0, 'has guarantor manager contract address');

            return loanManagerInstance.loanToken();
        }).then(function(address) {
            // Test that the loan token contract was set when deploying contract
            assert.notEqual(address, 0x0, 'has token contract address');
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
            assert(borrowerRequests.length, 1, 'adds request to borrower requests');

            return loanManagerInstance.getRequests();
        }).then(function(requests){
            // Test that when successfully calling the submit request function the request id should be added to the list
            assert(requests.length, 1, 'request added to list');

            return loanManagerInstance.getRequest(requestId);
        }).then(function(request){
            // Test that when successfully calling the submit request function the request object is added to the list
            assert(requestId, request.id, 'request object added');
        });
    });

    it('should submit a guarantee successfully', function(){
        return LoanToken.deployed().then(function(instance){
            loanTokenInstance = instance;
            return LoanManager.deployed();
        }).then(function(instance){
            loanManagerInstance = instance;
            return loanManagerInstance.submitGuarantee.call(requestId, 5, {from: guarantor});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanTokenInstance.transfer(guarantor, 1000);
        }).then(function(){
            return loanManagerInstance.submitGuarantee.call(requestId, 1000, {from: guarantor});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanTokenInstance.approve(loanManagerInstance.address, numberOfTokens, {from: guarantor});
        }).then(function(){
            return loanManagerInstance.submitGuarantee(requestId, 2, {from: guarantor});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'GuaranteeSubmitted', 'should be the GuaranteeSubmitted event');
            assert.notEqual(receipt.logs[0].args._guaranteeId, 0x0, 'logs the generated guarantee id');
            guaranteeId = receipt.logs[0].args._guaranteeId;

            return loanManagerInstance.getGuarantorGuarantees(guarantor);
        }).then(function(guarantees){
            assert(guarantees.length, 1, 'adds guarantee to guarantor guarantee');

            return loanManagerInstance.getGuarantees();
        }).then(function(guarantees){
            assert(guarantees.length, 1, 'guarantee added to list');

            return loanManagerInstance.getGuarantee(guaranteeId);
        }).then(function(guarantee){

            assert(guaranteeId, guarantee.id, 'guarantee object added');

            return loanManagerInstance.getRequestGuarantee(requestId);
        }).then(function(id){
            assert(id, guaranteeId, 'guarantee mapped to request');

            return loanManagerInstance.getRequest(requestId);
        }).then(function (request){
            assert(request[5], 1, 'request status updated');
        });
    });

    it('should update request status when accepting guarantee', function(){
        return LoanManager.deployed().then(function(instance){
            loanManagerInstance = instance;
            return loanManagerInstance.acceptGuarantee.call(requestId, { from: lender });
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanManagerInstance.acceptGuarantee(requestId, { from: borrower });
        }).then(function (receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'GuaranteeAccepted', 'should be the GuaranteeAccepted event');

            return loanManagerInstance.getRequest(requestId);
        }).then(function(request){
            assert(request[5], 2, 'request status updated');

            return loanManagerInstance.getGuarantee(guaranteeId);
        }).then(function(guarantee){
            assert(guarantee[3], 5, 'guarantee status updated')
        });
    });

    it('should update request status when declining guarantee', function(){
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
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');

            return loanTokenInstance.approve(loanManagerInstance.address, numberOfTokens, {from: guarantor});
        }).then(function(){
            return loanManagerInstance.submitGuarantee(cancelledRequestId, 5, {from: guarantor});
        }).then(function(receipt){
            guaranteeId = receipt.logs[0].args._guaranteeId;

            return loanManagerInstance.declineGuarantee(cancelledRequestId, {from: borrower});
        }).then(function (receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'GuaranteeDeclined', 'should be the GuaranteeDeclined event');

            return loanManagerInstance.getRequest(cancelledRequestId);
        }).then(function(request){
            assert(request[5], 3, 'request status updated');

            return loanManagerInstance.getGuarantee(guaranteeId);
        }).then(function(guarantee){
            assert(guarantee[3], 3, 'guarantee status updated');
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
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');

            return loanManagerInstance.submitLoan(requestId, {from: lender});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');

            return loanTokenInstance.transfer(lender, 100);
        }).then(function(){
            return loanTokenInstance.approve(loanManagerInstance.address, numberOfTokens, {from: lender});
        }).then(function(){
            return loanManagerInstance.submitLoan(requestId, {from: lender});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'LoanSubmitted', 'should be the LoanSubmitted event');
            assert.notEqual(receipt.logs[0].args._loanId, 0x0, 'logs the generated guarantee id');
            loanId = receipt.logs[0].args._loanId;

            return loanManagerInstance.getLenderLoans(lender);
        }).then(function(loans){
            assert(loans.length, 1, 'adds loan to lender loans');

            return loanManagerInstance.getLoans();
        }).then(function(loans){
            assert(loans.length, 1, 'loan added to list');

            return loanManagerInstance.getLoan(loanId);
        }).then(function(loan){
            assert(loanId, loan.id, 'loan object added');

            return loanManagerInstance.getLoanRequest(loanId);
        }).then(function(id){
            assert(id, requestId, 'loan mapped to request');

            return loanManagerInstance.getRequest(requestId);
        }).then(function (request){
            assert(request[5], 2, 'request status updated');
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
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');

            return loanTokenInstance.transfer(borrower, 150);
        }).then(function(){
            return loanTokenInstance.approve(loanManagerInstance.address, (numberOfTokens + interest), {from: borrower});
        }).then(function(){
            return loanManagerInstance.repayLoan(loanId, {from: borrower});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'LoanRepaid', 'should be the LoanRepaid event');

            return loanManagerInstance.repayLoan(loanId, {from: borrower});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');

            return loanManagerInstance.getRequest(requestId);
        }).then(function (request){
            assert(request[5], 3, 'request status updated');

            return loanManagerInstance.getLoan(loanId);
        }).then(function(loan){
            assert(loan[2], 4, 'loan status updated');
        });
    })

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
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');

            return loanManagerInstance.withdrawGuarantee(loanId, {from: lender});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'GuaranteeWithdrawn', 'should be the GuaranteeWithdrawn event');

            return loanManagerInstance.getGuarantee(guaranteeId);
        }).then(function(guarantee){
            assert(guarantee[2], 6, 'guarantee status updated');

            return loanManagerInstance.getLoan(loanId);
        }).then(function(loan){
            assert(loan[2], 7, 'loan status updated');
        });
    })
});