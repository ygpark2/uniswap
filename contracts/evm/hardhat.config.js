import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory's .env (two levels up)
dotenv.config({ path: path.join(__dirname, "../../.env") });

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env['SEPOLIA_RPC_URL'] || "",
      accounts: process.env['SEPOLIA_PRIVATE_KEY'] ? [process.env['SEPOLIA_PRIVATE_KEY']] : [],
    },
  },
  paths: {
    sources: "./contracts", // Specific folder for contracts
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;
