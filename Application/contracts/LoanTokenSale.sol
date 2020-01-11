pragma solidity ^0.5.11;

import './LoanToken.sol';

contract LoanTokenSale {

    // Contract properties
    address payable administrator;
    LoanToken public loanToken;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    // Events
    event TokensSold(
        address indexed _buyerAddress,
        uint256 indexed _amount
    );

    /* Contract constructor
    Params:
        LoanToken _loanToken - address of LoanToken contract
        uint256 _tokenPrice - Price in wei of 1 loan token
    */
    constructor (LoanToken _loanToken, uint256 _tokenPrice) public {
        administrator = msg.sender;
        loanToken = _loanToken;
        tokenPrice = _tokenPrice;
    }

    /* Function to buy tokens
    Params:
        uint256 _amount - amount of tokens to buy
    */
    function buy(uint256 _amount) public payable {
        /*  Check request parameters - amount of ether sent must equal to the amount of tokens needed multiplied by the token price
            token balance of the contract must be greater than the amount of tokens being requested
        */
        require(msg.value == multiply(tokenPrice, _amount), 'Insufficient wei value sent with message');
        require(loanToken.balanceOf(address(this)) >= _amount, 'Insufficient tokens available in contract');

        // Transfer funds and update number of tokens sold
        require(loanToken.transfer(msg.sender, _amount), 'Error occured while loan transfer function was executing');
        tokensSold += _amount;

        // Emit event
        emit TokensSold(msg.sender, _amount);
    }

    // Function to end the token sale
    function DestroyContract() public IsAdministrator {
        // Transfer all tokens owned by the contract to the administrator
        require(loanToken.transfer(administrator, loanToken.balanceOf(address(this))),
            'Error occured while loan transfer function was executing');

        // Destroy contract and send ether balance of this contract to the administrator
        selfdestruct(administrator);
    }

    // Function to check of message sender is the administrator
    modifier IsAdministrator(){
        require((administrator == msg.sender), "Only Administrators Are Able To Run This Function");
        _;
    }

    // An interneal helper function to multiply two numbers
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, 'Invalid parameters passed to function multiply');
    }
}