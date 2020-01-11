pragma solidity ^0.5.11;

import './LoanToken.sol';
import './GuarantorManager.sol';

contract LoanManager{

    // Contract properties
    address public administrator;
    GuarantorManager public guarantorManager;
    LoanToken public loanToken;
    bytes32[] private requests;
    bytes32[] private guarantees;
    bytes32[] private loans;

    // Mappings
    mapping(bytes32 => Request) private requestsMappedToId;         // Id => Request
    mapping(address => bytes32[]) private borrowerRequests;         // Borrower => Requests

    mapping(bytes32 => Guarantee) private guaranteesMappedToId;     // Id => Guarantee
    mapping(bytes32 => bytes32) private guaranteesMappedToRequests; // Request => Guarantee
    mapping(address => bytes32[]) private guarantorGuarantees;      // Guarantor => Guarantees

    mapping(bytes32 => Loan) private loansMappedToId;               // Id => Loan
    mapping(bytes32 => bytes32) private requestsMappedToLoans;      // Loan => Request
    mapping(address => bytes32[]) private lenderLoans;              // Lender => Loans

    // Events
    event RequestSubmitted(
        bytes32 indexed _requestId
    );
    event GuaranteeSubmitted(
        bytes32 indexed _guaranteeId
    );
    event GuaranteeAccepted();
    event GuaranteeDeclined();
    event LoanSubmitted(
        bytes32 indexed _loanId
    );
    event LoanRepaid();
    event GuaranteeWithdrawn();

    // Structures and enums
    struct Request{
        bytes32 id;
        address payable borrower;
        uint256 amount;
        uint256 payUntil;
        uint256 interest;
        States state;
    }
    struct Guarantee{
        bytes32 id;
        address payable guarantor;
        uint256 interest;
        States state;
    }
    struct Loan{
        bytes32 id;
        address payable lender;
        States state;
    }
    enum States{
        AwaitingGuarantee,
        AwaitingGuaranteeApproval,
        AwaitingLoan,
        Cancelled,
        Completed,
        AwaitingPayment,
        GuaranteeWithdrawn,
        Overdue
    }

    // Contract constructor
    constructor(GuarantorManager _guarantorManager, LoanToken _loanToken) public {
        administrator = msg.sender;
        guarantorManager = _guarantorManager;
        loanToken = _loanToken;
    }

    /* Function to submit a request for a loan
    Parameters:
        uint256 _amount - amount of tokens needed for the loan
        uint256 _payUntil - unix timestamp of by when the loan is to be paid
        uint256 _interest - interest that will be paid by the borrower
    */
    function submitRequest(uint256 _amount, uint256 _payUntil, uint256 _interest) public {
        // Check request parameters - Loan amount should be more than 0 and date by which loan is to be paid should be greater than current timestamp
        require(_amount > 0, 'Loan amount should be greater than 0');
        require(_payUntil > block.number,
            'Date by which loan should be paid must be greater than the current block');

        // Create the request object
        bytes32 id = keccak256(abi.encodePacked(msg.sender, _amount, _payUntil, _interest, now));
        Request memory request = Request(id, msg.sender, _amount, _payUntil, _interest, States.AwaitingGuarantee);

        // Store request
        requestsMappedToId[id] = request;
        borrowerRequests[msg.sender].push(id);
        requests.push(id);

        // Emit event
        emit RequestSubmitted(id);
    }

    // Function to get all requests
    function getRequests() public view returns(bytes32[] memory){
        return requests;
    }

    /* Function to get a request
    Parameters:
        bytes32 _requestId - id of the request to be returned
    */
    function getRequest(bytes32 _requestId) public view returns(bytes32, address, uint256, uint256, uint256, States){
        Request memory request = requestsMappedToId[_requestId];
        return (request.id, request.borrower, request.amount, request.payUntil, request.interest, request.state);
    }

    /* Function to get a list of requests for a borrower address
    Parameters:
        address _borrower - the address of the borrower's requests that will be returned
    */
    function getBorrowerRequests(address _borrower) public view returns(bytes32[] memory){
        return borrowerRequests[_borrower];
    }

    /* Function to place guarantee on a loan
    Parameters:
        bytes32 _requestId - id of the request that the guarantor wants to guarantee
        uint256 _interestRequest - the amount of interest the guarantor is expecting
    */
    function submitGuarantee(bytes32 _requestId, uint256 _interestRequest) public RequireGuarantorStatus {
        Request memory request = requestsMappedToId[_requestId];

        // Check request parameters - Interest should be less than that specified in request and guarantor should have enough tokens
        require(_interestRequest <= request.interest, 'Interest should be less than interest offered by borrower');
        require(loanToken.balanceOf(msg.sender) >= request.amount, 'You do not have enough tokens to guarantee this loan');

        // Create the guarantee object
        bytes32 id = keccak256(abi.encodePacked(msg.sender, _interestRequest, now));
        Guarantee memory guarantee = Guarantee(id, msg.sender, _interestRequest, States.AwaitingGuaranteeApproval);

        // Transfer tokens from guarantor to address of this contract
        require(loanToken.transferFrom(msg.sender, address(this), request.amount), 'Error occured while withdrawing tokens from message sender');

        // Store guarantee
        guaranteesMappedToId[id] = guarantee;
        guarantorGuarantees[msg.sender].push(id);
        guaranteesMappedToRequests[_requestId] = id;
        guarantees.push(id);
        updateRequestState(_requestId, States.AwaitingGuaranteeApproval);

        // Emit event
        emit GuaranteeSubmitted(id);
    }

    /* Function to get a request guarantee
    Parameters:
        bytes32 _requestId - id of the guarantee's request to be returned
    */
    function getRequestGuarantee(bytes32 _requestId) public view returns(bytes32, address, uint256, States){
        Guarantee memory guarantee = guaranteesMappedToId[guaranteesMappedToRequests[_requestId]];
        return (guarantee.id, guarantee.guarantor, guarantee.interest, guarantee.state);
    }

    // Function to get all guarantees
    function getGuarantees() public view returns(bytes32[] memory){
        return guarantees;
    }

    /* Function to get a guarantee
    Parameters:
        bytes32 _guaranteeId - id of the guarantee to be returned
    */
    function getGuarantee(bytes32 _guaranteeId) public view returns(bytes32, address, uint256, States){
        Guarantee memory guarantee = guaranteesMappedToId[_guaranteeId];
        return (guarantee.id, guarantee.guarantor, guarantee.interest, guarantee.state);
    }

    /* Function to get a list of guarantees for a guarantor address
    Parameters:
        address _guarantor - address of the guarantor whose guarantees need to be returned
    */
    function getGuarantorGuarantees(address _guarantor) public view returns(bytes32[] memory){
        return guarantorGuarantees[_guarantor];
    }

    /* Function to accept guarantee
    Parameters:
        bytes32 _requestId - id of request whose guarantee needs to be accepted
    */
    function acceptGuarantee(bytes32 _requestId) public RequireRequestBorrowerStatus(_requestId) {
        // Check request parameters - A guarantee needs to be provided for a request
        require(requestsMappedToId[_requestId].state == States.AwaitingGuaranteeApproval, 'No guarantee has been provided for this request');

        // Update request and guarantee state
        updateRequestState(_requestId, States.AwaitingLoan);
        updateGuaranteeState(guaranteesMappedToRequests[_requestId], States.AwaitingPayment);

        // Emit event
        emit GuaranteeAccepted();
    }

    /* Function to decline guarantee
    Parameters:
        bytes32 _requestId - id of request whose guarantee needs to be declined
    */
    function declineGuarantee(bytes32 _requestId) public RequireRequestBorrowerStatus(_requestId) payable{
        // Check request parameters - A guarantee needs to be provided for a request
        require(requestsMappedToId[_requestId].state == States.AwaitingGuaranteeApproval, 'No guarantee has been provided for this request');

        Request memory request = requestsMappedToId[_requestId];
        Guarantee memory guarantee = guaranteesMappedToId[guaranteesMappedToRequests[_requestId]];

        // Send money back to guarantor
        require(loanToken.transfer(guarantee.guarantor, request.amount),
            'An error occured while transfering tokens from contract to guarantor');

        // Update request and guarantee state
        updateRequestState(_requestId, States.Cancelled);
        updateGuaranteeState(guaranteesMappedToRequests[_requestId], States.Cancelled);

        // Emit event
        emit GuaranteeDeclined();
    }

    /* Function to accept loan request
    Parameters:
        bytes32 _requestId - The id of the request to approve
    */
    function submitLoan(bytes32 _requestId) public RequireLenderNotToBeGuarantor(_requestId) payable {
        Request memory request = requestsMappedToId[_requestId];

        // Check request paramaters - guarantee needs to be accepted and lender needs to have enough tokens
        require(request.state == States.AwaitingLoan, 'No guarantee has been accepted for this request');
        require(loanToken.balanceOf(msg.sender) >= request.amount, 'You do not have enough tokens to provide this loan');

        // Send tokens to borrower
        require(loanToken.transferFrom(msg.sender, request.borrower, request.amount), 'An error occured while transfering tokens');
        updateRequestState(_requestId, States.Completed);

        // Create the loan object
        bytes32 id = keccak256(abi.encodePacked(msg.sender, now));
        Loan memory loan = Loan(id, msg.sender, States.AwaitingPayment);

        // Store request
        loansMappedToId[id] = loan;
        lenderLoans[msg.sender].push(id);
        requestsMappedToLoans[id] = _requestId;
        loans.push(id);

        // Emit event
        emit LoanSubmitted(id);
    }

    /* Function to get a request loan
    Parameters:
        bytes32 _loanId - id of the loan whose request is to be returned
    */
    function getLoanRequest(bytes32 _loanId) public view returns(bytes32, address, uint256, uint256, uint256, States){
        Request memory request = requestsMappedToId[requestsMappedToLoans[_loanId]];
        return (request.id, request.borrower, request.amount, request.payUntil, request.interest, request.state);
    }

    // Function to get all loans
    function getLoans() public view returns(bytes32[] memory){
        return loans;
    }

    /* Function to get a loan
    Parameters:
        bytes32 _loanId - id of the loan to be returned
    */
    function getLoan(bytes32 _loanId) public view returns(bytes32, address, States){
        Loan memory loan = loansMappedToId[_loanId];
        return (loan.id, loan.lender, loan.state);
    }

    /* Function to get a list of loans for a lender address
    Parameters:
        address _lender - address of the lender whose loans are to be returned
    */
    function getLenderLoans(address _lender) public view returns(bytes32[] memory){
        return lenderLoans[_lender];
    }

    /* Function to repay loan
    Parameters:
        bytes32 _loanId - id of the loan the borrower is going to be paying back
    */
    function repayLoan(bytes32 _loanId) public RequireLoanBorrowerStatus(_loanId) payable {
        Request memory request = requestsMappedToId[requestsMappedToLoans[_loanId]];
        Guarantee memory guarantee = guaranteesMappedToId[guaranteesMappedToRequests[request.id]];
        Loan memory loan = loansMappedToId[_loanId];
        uint256 totalAmount = request.amount + request.interest;

        // Check request parameters - Loean needs to be provided for the request and borrower needs to have enough tokens to cover payment
        require(loan.state == States.AwaitingPayment, 'Invalid status for loan matching passed Id');
        require(loanToken.balanceOf(msg.sender) >= totalAmount, 'You do not have enough tokens to repay the loan');

        // Send money back to Lender and guarantor
        uint256 amountToGuarantor = request.amount + guarantee.interest;
        uint256 amountToLender = request.amount + (request.interest - guarantee.interest);
        require(loanToken.transferFrom(request.borrower, address(this), totalAmount),
            'Error occured while withdrawing tokens from message sender');
        require(loanToken.approve(address(this), totalAmount),
            'Error occured while approving amount to be spent by contract from borrower');
        require(loanToken.transfer(loan.lender, amountToLender), 'Error occured while sending tokens to lender');
        require(loanToken.transfer(guarantee.guarantor, amountToGuarantor), 'Error occured while sending tokens back to guarantor');

        updateLoanState(_loanId, States.Completed);
        updateGuaranteeState(guarantee.id, States.Completed);

        // Emit event
        emit LoanRepaid();
    }

    /* Function to withdraw guarantee
    Paramaters:
        bytes32 _loanId - id of the loan whose guarantee needs to be withdrawn
    */
    function withdrawGuarantee(bytes32 _loanId) public RequireLoanLenderStatus(_loanId) payable {
        Request memory request = requestsMappedToId[requestsMappedToLoans[_loanId]];
        Loan memory loan = loansMappedToId[_loanId];

        // Check request parameters
        require(loan.state == States.AwaitingPayment, 'Invalid status for loan matching passed Id');
        require(request.payUntil < block.number, 'Time stipulated by loan request has not passed');

        // Withdraw guarantee
        require(loanToken.transfer(loan.lender, request.amount), 'Error occured while transfering guarantee to lender');

        updateLoanState(_loanId, States.Cancelled);
        updateGuaranteeState(guaranteesMappedToId[guaranteesMappedToRequests[request.id]].id, States.Cancelled);

        // Emit event
        emit GuaranteeWithdrawn();
    }

    // Function to update request state
    function updateRequestState(bytes32 _requestId, States _state) internal {
        requestsMappedToId[_requestId].state = _state;
    }

    // Function to update guarantee state
    function updateGuaranteeState(bytes32 _guaranteeId, States _state) internal {
        guaranteesMappedToId[_guaranteeId].state = _state;
    }

    // Function to update loan state
    function updateLoanState(bytes32 _loanId, States _state) internal {
        loansMappedToId[_loanId].state = _state;
    }

    // Fallback function
    function() external {
        revert("Please use the correct function name");
    }

    // Modifier to check if message sender is request borrower
    modifier RequireRequestBorrowerStatus(bytes32 _requestId){
        require(requestsMappedToId[_requestId].borrower == msg.sender, "Request borrower status required");
        _;
    }

    // Modifier to check if message sender is loan borrower
    modifier RequireLoanBorrowerStatus(bytes32 _loanId){
        require(requestsMappedToId[requestsMappedToLoans[_loanId]].borrower == msg.sender, "Loan borrower status required");
        _;
    }

    // Modifier to check if message sender is loan lender
    modifier RequireLoanLenderStatus(bytes32 _loanId){
        require(loansMappedToId[_loanId].lender == msg.sender, "Loan lender status required");
        _;
    }

    // Modifier to check if message sneder is a guarantor
    modifier RequireGuarantorStatus(){
        require(msg.sender == msg.sender, "Guarantor status required");
        _;
    }

    // Modifier to check if loan approver is a guarantor
    modifier RequireLenderNotToBeGuarantor(bytes32 _requestId){
        require(guaranteesMappedToId[guaranteesMappedToRequests[_requestId]].guarantor != msg.sender, "Lender cannot be guarantor");
        _;
    }
}