pragma solidity ^0.5.11;

contract GuarantorManager{

    // Contract properties
    address payable public administrator;
    address[] private guarantors;

    // Mappings
    mapping(address => bool) public isGuarantor;

    // Events
    event GuarantorAdded(
        address indexed _guarantorAddress
    );
    event GuarantorDeleted(
        address indexed _guarantorAddress
    );

    // Contract constructor
    constructor() public{
        administrator = msg.sender;
    }

    // Self destruction
    function destroyContract() public IsAdministrator{
        selfdestruct(administrator);
    }

    /* Function to add a new guarantor
    Parameters:
        address _guarantor - Address of the guarantor to add
    */
    function addGuarantor(address _guarantor) public IsAdministrator {

        // Make sure address passed is not already a manager
        require(isGuarantor[_guarantor] == false, "Address is already a guarantor");

        isGuarantor[_guarantor] = true;
        guarantors.push(_guarantor);
        emit GuarantorAdded(_guarantor);
    }

    /* Function to remove a guarantor
    Parameters
        address _guarantor - Address of the guarantor to remove
    */
    function removeGuarantor(address _guarantor) public IsAdministrator {

        // Make sure address passed is actually a guarantor
        require(isGuarantor[_guarantor] == true, "Address is not a guarantor");

        isGuarantor[_guarantor] = false;

        // Delete guarantor from array of all guarantors
        uint guarantorCount = guarantors.length;
        for(uint i = 0; i < guarantorCount; i++){
            if(guarantors[i] == _guarantor){
                delete guarantors[i];
                break;
            }
        }

        emit GuarantorDeleted(_guarantor);
    }

    // Function to get all the guarantorsz
    function getGuarantors() public view returns(address[] memory) {
        return guarantors;
    }

    // Modifier to check of message sender is the administrator
    modifier IsAdministrator(){
        require((administrator == msg.sender), "Only Administrators Are Able To Run This Function");
        _;
    }
}