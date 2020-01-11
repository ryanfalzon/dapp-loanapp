pragma solidity ^0.5.11;

contract LoanToken {

    // Contract properties
    string public name = 'Loan Token';
    string public symbol = 'LTX';
    uint256 public totalSupply;

    // Mappings
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Events
    event Transfered(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    event Approved(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // Contract constructor
    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    /* Transfer function
    Parameters:
        address _to - address of the recipient to whome we send te amount to
        uint 256 _value - amount of tokens to send to the recipient
    */
    function transfer(address _to, uint256 _value) public returns(bool success){
        // Check request parameters - _value should be smaller than balance of message sender
        require(balanceOf[msg.sender] >= _value, 'Insufficient funds');

        // Updates balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // Emit event
        emit Transfered(msg.sender, _to, _value);
        return true;
    }

    /* Approve function
    Parameters:
        address _spender - address of the spender who will be spending balance of message sender
        uint256 _value - amount of tokens spender has available from message sender balance
    */
    function approve(address _spender, uint256 _value) public returns(bool success){
        allowance[msg.sender][_spender] = _value;

        // Emit event
        emit Approved(msg.sender, _spender, _value);
        return true;
    }

    /* TransferFrom function
    Paramaters:
        address _from - address of the entity whose balance will be deducted
        address _to - address of the recipient who will be receiving the tokens
        uint256 _value - amount of tokens to send to _to address
    */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        /*  Check request parameters - _value should be smaller than balance of _from address and should be smaller
            than allowance that _spender approved to message sender
        */
        require(_value <= balanceOf[_from], 'Insufficient funds');
        require(_value <= allowance[_from][msg.sender], 'Value exceed allowed funds');

        // Update balances and allowance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;

        // Emit event
        emit Transfered(_from, _to, _value);
        return true;
    }
}