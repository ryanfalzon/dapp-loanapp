const SafeMath = artifacts.require("./contracts/SafeMath.sol");
const ContractRegistry = artifacts.require("./contracts/ContractRegistry.sol");
const LoanToken = artifacts.require("./contracts/LoanToken.sol");
const LoanTokenSale = artifacts.require("./contracts/LoanTokenSale.sol");
const GuarantorManager = artifacts.require("./contracts/GuarantorManager.sol");
const LoanManager = artifacts.require("./contracts/LoanManager.sol");

module.exports = async (deployer) => {
  const initialTokenSupply = 1000000;
  const tokenPrice = 1000000000000000;

  deployer.deploy(SafeMath);
  deployer.link(SafeMath, LoanToken);
  deployer.link(SafeMath, LoanTokenSale);
  deployer.link(SafeMath, LoanManager);

  await deployer.deploy(ContractRegistry);
  const registryInstance = await ContractRegistry.deployed();

  await deployer.deploy(LoanToken, initialTokenSupply);
  await deployer.deploy(LoanTokenSale, registryInstance.address, tokenPrice);
  await deployer.deploy(GuarantorManager);
  await deployer.deploy(LoanManager, registryInstance.address);

  registryInstance.registerName('LoanToken', LoanToken.address, 1);
  registryInstance.registerName('LoanTokenSale', LoanTokenSale.address, 1);
  registryInstance.registerName('GuarantorManager', GuarantorManager.address, 1);
  registryInstance.registerName('LoanManager', LoanManager.address, 1);
};
