pragma solidity ^0.5.11;

contract ContractRegistry {

    // Contract Properties
    mapping(string => ContractDetails) registry;

    // Structures
    struct ContractDetails {
        address owner;
        address contractAddress;
        uint16 version;
    }

    /* Function to register a new contract
    Parameters:
        string _name - The name label of the contract
        address _address - The address of the contract
        uint16 _version - The version of the contract
    */
    function registerName(string memory _name, address _address, uint16 _version) public returns(bool) {

        // Check parameters - Versions must be greater than 1
        require(_version >= 1, 'Invalid version. Versions should start from 1');

        // Get contract details
        ContractDetails memory contractDetails = registry[_name];

        // Check if contract details already exists
        if(contractDetails.contractAddress == address(0)){

            // New version must be greater than previous
            require(contractDetails.version < _version, 'New version must be greater than previous');
            contractDetails = ContractDetails(msg.sender, _address, _version);
        }
        else{
            require(contractDetails.owner == msg.sender, '');
            contractDetails.version = _version;
            contractDetails.contractAddress = _address;
        }

        // Store contract details
        registry[_name] = contractDetails;
        return true;
    }

    /* Function to get the details of a contract
    Parameters:
        string _name - The name of the contract whose details are to be returned
    */
    function getContract(string memory _name) public view returns(address) {
        ContractDetails memory contractDetails = registry[_name];
        return (contractDetails.contractAddress);
    }
}