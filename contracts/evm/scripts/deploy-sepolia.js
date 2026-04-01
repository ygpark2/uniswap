import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("Deploying EvmSwapGateway to Sepolia...");

  const Factory = await ethers.getContractFactory("EvmSwapGateway");
  const contract = await Factory.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("EvmSwapGateway deployed successfully!");
  console.log("Contract Address:", address);
  console.log("Please update SEPOLIA_CONTRACT_ADDRESS in your .env file.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
