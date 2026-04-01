require('dotenv').config({ path: '../../.env' });

module.exports = {
  networks: {
    nile: {
      privateKey: process.env.TRON_PRIVATE_KEY,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: "https://nile.trongrid.io",
      network_id: "3"
    }
  },
  compilers: {
    solc: {
      version: "0.8.20"
    }
  },
  contracts_directory: "contracts",
  migrations_directory: "migrations"
};
