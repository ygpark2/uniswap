const TronSwapGateway = artifacts.require("TronSwapGateway");

module.exports = async function (deployer) {
  await deployer.deploy(TronSwapGateway);
};
