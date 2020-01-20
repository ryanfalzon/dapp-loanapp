pragma solidity ^0.5.11;

import './ContractRegistry.sol';
import './LoanToken.sol';
import './SafeMath.sol';

contract LoanTokenSale {
    using SafeMath for uint256;

    // Contract properties
    address payable administrator;
    ContractRegistry public registry;
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
    constructor (ContractRegistry _registry, uint256 _tokenPrice) public {
        administrator = msg.sender;
        registry = _registry;
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
        require(msg.value == tokenPrice.mul(_amount), 'Insufficient wei value sent with message');
        require(LoanToken(registry.getContract('LoanToken')).balanceOf(address(this)) >= _amount, 'Insufficient tokens available in contract');

        // Transfer funds and update number of tokens sold
        require(LoanToken(registry.getContract('LoanToken')).transfer(msg.sender, _amount),
            'Error occured while loan transfer function was executing');
        tokensSold += _amount;

        // Emit event
        emit TokensSold(msg.sender, _amount);
    }

    // Function to end the token sale
    function DestroyContract() public IsAdministrator {
        // Transfer all tokens owned by the contract to the administrator
        require(LoanToken(registry.getContract('LoanToken'))
            .transfer(administrator, LoanToken(registry.getContract('LoanToken')).balanceOf(address(this))),
            'Error occured while loan transfer function was executing');

        // Destroy contract and send ether balance of this contract to the administrator
        selfdestruct(administrator);
    }

    // Function to check of message sender is the administrator
    modifier IsAdministrator(){
        require((administrator == msg.sender), "Only Administrators Are Able To Run This Function");
        _;
    }
}