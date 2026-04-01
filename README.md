# Multi-Chain Swap Gateway POC

This project is a Proof of Concept (POC) designed to verify cross-chain swap functionality between EVM (Sepolia), TRON (Nile), Solana (Devnet), and Aptos (Testnet).

## 🚀 Key Features

1.  **Multi-Chain Deposit Gateway**: Optimized smart contracts for four chains (EVM, TRON, Solana, Aptos).
2.  **Native & Token Swap Support**: Supports swapping of native coins like ETH/TRX as well as ERC-20/TRC-20 tokens.
3.  **Unified Frontend**: Angular-based UI supporting MetaMask, TronLink, Phantom, and Petra wallets.
4.  **Automated Solver**: Includes a relayer that detects deposit events on the source chain and automatically updates the status on the destination chain.
5.  **State Management**: Uses a JSON-based local database to prevent duplicate processing.

## 📸 Screenshots

| TRON (Nile) | Solana (Devnet) | Aptos (Testnet) |
| :---: | :---: | :---: |
| ![TRON](docs/images/tron.png) | ![Solana](docs/images/solana.png) | ![Aptos](docs/images/aptos.png) |

---

## 🧠 Technical Challenges & Solutions

During the development of this cross-chain POC, several chain-specific technical hurdles were encountered and resolved:

### 1. Ethereum (EVM / Sepolia)
*   **Challenge**: Public RPC nodes (e.g., PublicNode, Infura) often drop event filters after a short period, leading to "filter not found" errors in `ethers.js`.
*   **Solution**: Implemented a **Manual Polling Strategy**. Instead of using `contract.on()`, the relayer now tracks the last processed block and manually calls `queryFilter()` every 10 seconds.
*   **Challenge**: Modern build tools (like Angular 21's Esbuild) do not include Node.js polyfills, but `ethers.js` and other SDKs require `Buffer`, `global`, and `process`.
*   **Solution**: Manually configured `src/polyfills.ts` to inject these globals into the `window` object and installed the `buffer` package.

### 2. TRON (Nile)
*   **Challenge**: TRON addresses exist in two formats: Base58 (`T...`) and Hex (`41...`). Mixing them causes contract call failures.
*   **Solution**: Standardized on **Base58** for all frontend and config interactions, while ensuring the Solidity code correctly handles the `address` type internally.
*   **Challenge**: Conflict between Hardhat's ESM requirement (`"type": "module"`) and TronBox's CommonJS requirement (`require`).
*   **Solution**: Decoupled the contract environments. Each chain folder (`contracts/evm`, `contracts/tron`) now has its own `package.json` and local configuration to prevent dependency clashes.

### 3. Solana (Devnet)
*   **Challenge**: Unlike EVM, Solana doesn't have built-in "Indexed Events". Monitoring program activity is harder for relayers.
*   **Solution**: Implemented **Structured Logging**. The Rust program emits specific `msg!` strings (e.g., `Deposited: {amount}, {target}, ...`), and the solver uses `connection.onLogs()` with a Regex parser to extract data in real-time.
*   **Challenge**: Manual instruction encoding without high-level frameworks like Anchor.
*   **Solution**: Built a manual **Borsh-compatible buffer encoder** in TypeScript to handle `U64` (Little Endian) and `String` (Length + Bytes) serialization for contract calls.

### 4. Aptos (Devnet)
*   **Challenge**: Aptos enforces strict **Resource Safety**. Changing a struct layout (e.g., adding an event handle) causes a `BACKWARD_INCOMPATIBLE_MODULE_UPDATE` error.
*   **Solution**: During development, we used versioned module names (`swap_gateway_v2`). For the production flow, we learned to finalize data structures before deployment.
*   **Challenge**: Inconsistencies in SDK v6 for fetching specific module events.
*   **Solution**: Switched to **Resource Polling**. The relayer now uses `getAccountResource` to fetch the entire `Gateway` state and compares the `deposits` vector length to detect new transactions, ensuring 100% reliability regardless of indexer status.

---

## 📂 Project Structure

```text
.
├── contracts/              # Smart contract source code
│   ├── evm/                # Hardhat environment (Sepolia)
│   │   ├── contracts/      # Solidity sources
│   │   ├── scripts/        # Deployment scripts (.js)
│   │   └── package.json    # Isolated EVM dependencies (ESM)
│   ├── tron/               # TronBox environment (Nile)
│   │   ├── contracts/      # Solidity sources
│   │   ├── migrations/     # Deployment scripts
│   │   └── tronbox.js      # TRON configuration
│   ├── solana/             # Rust/Cargo environment (Local/Devnet)
│   │   └── lib.rs          # Solana program logic
│   └── aptos/              # Move environment (Devnet)
│       ├── sources/        # Move sources
│       └── Move.toml       # Aptos configuration
├── scripts/                # Off-chain relayer
│   ├── solver.ts           # Unified 4-chain event watcher & relayer
│   └── processed_deposits.json # Relayer state database
├── src/app/                # Angular Frontend
│   ├── modules/swap/       # Main Swap UI
│   └── @shared/services/   # Blockchain interaction logic (ethers, tron, solana, aptos)
└── Makefile                # Centralized command automation
```

---

## 🛠 Solana Local Development Setup


1.  **Install Dependencies**:
    ```bash
    make install
    ```

2.  **Configure .env**:
    Modify the `.env` file in the root directory with your wallet's private keys and RPC URLs.
    ```env
    SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
    SEPOLIA_PRIVATE_KEY=your_private_key
    SEPOLIA_CONTRACT_ADDRESS=0x...

    TRON_PRIVATE_KEY=your_private_key
    TRON_API_KEY=your_trongrid_api_key
3. **How to Obtain Configuration Values (Testnet vs. Production)**:

| Category | **Testnet (Development)** | **Mainnet (Production)** |
| :--- | :--- | :--- |
| **EVM RPC URL** | [Infura](https://infura.io) / [Alchemy](https://alchemy.com) (Sepolia) | Same providers (Ethereum Mainnet) |
| **TRON Host** | `https://nile.trongrid.io` (Nile) | `https://api.trongrid.io` (Mainnet) |
| **Solana RPC** | `https://api.devnet.solana.com` | `https://api.mainnet-beta.solana.com` |
| **Aptos Node** | `https://fullnode.testnet.aptoslabs.com/v1` | `https://fullnode.mainnet.aptoslabs.com/v1` |
| **Private Key** | **Use a temporary wallet** for testing | **Use a Hardware Wallet** (High Security) |

*   **How to Get Test Coins (Faucets)**:
    *   **Sepolia ETH**: [Alchemy Faucet](https://sepoliafaucet.com/).
    *   **TRON Nile TRX**: [Nile Faucet](https://nileex.io/join/get_faucet).
    *   **Solana Devnet**: [Solana Faucet](https://faucet.solana.com/).
    *   **Aptos Testnet**: [Aptos Faucet](https://aptoslabs.com/developers/faucet).
*   **How to Export Private Keys**:
    *   **⚠️ CRITICAL SECURITY WARNING**: The private key is the same for both Mainnet and Testnet. If you leak your private key, your **real funds** on the Mainnet will be stolen.
    *   **Recommendation**: **Create a NEW, separate account** in your wallet (MetaMask, Phantom, etc.) specifically for development. Never use an account that holds real assets.
    *   **MetaMask (EVM)**: Open MetaMask -> Click account icon (top right) -> 'Add account' -> Name it 'Dev Account' -> Export its private key.
    *   **TronLink (TRON)**: Open TronLink -> Click '+' icon -> 'Create Wallet' -> Name it 'Dev Account' -> Export its private key.
    *   **Solana Key (Devnet)**: Open Phantom -> Settings -> Manage Accounts -> 'Add/Connect Wallet' -> 'Create a new account'.
    *   **Aptos Key (Testnet)**: Open Petra -> Settings -> Manage Account -> 'Add Account' -> 'Create New Account'.
*   **How to Get Contract & Program IDs (After Deployment)**:
    *   **SEPOLIA_CONTRACT_ADDRESS**: After running `make deploy-evm`, look for `Contract Address: 0x...` in the console.
    *   **TRON_CONTRACT_ADDRESS**: After `make deploy-tron`, the address will be shown in the TronBox migration output.
    *   **SOLANA_PROGRAM_ID**: After `make deploy-solana`, the console will output `Program Id: ...`.
    *   **SOLANA_STATE_ACCOUNT**: You need a data account. Create one using `solana-keygen new -o state-keypair.json`, then use its public key (`solana-keygen pubkey state-keypair.json`).
    *   **APTOS_CONTRACT_ADDRESS**: After `make deploy-aptos`, the account address used for publishing (typically your own account) becomes the contract address.
*   *⚠️ Warning: Never share your private keys or commit them to version control.*

---

## 🛠 Solana Local Development Setup

If the Solana Devnet Faucet is unavailable, you can use `solana-test-validator` to build and test locally.

1.  **Start Local Validator**:
    Open a new terminal and run:
    ```bash
    solana-test-validator
    ```
    *Keep this terminal running during your development.*

2.  **Configure CLI to Localhost**:
    ```bash
    solana config set --url localhost
    ```

3.  **Airdrop Local SOL**:
    ```bash
    solana airdrop 100
    ```

4.  **Update .env for Localhost**:
    ```env
    SOLANA_RPC_URL=http://127.0.0.1:8899
    SOLANA_NETWORK= # Leave empty to use RPC_URL
    ```

5.  **Deploy to Local Validator**:
    ```bash
    make deploy-solana
    ```
    *Note: The `make deploy-solana` command is pre-configured to use your local CLI settings.*

---

## 🚢 Deployment Method (Smart Contracts)

### 1. EVM (Sepolia) Deployment
```bash
make deploy-evm
```

### 2. TRON (Nile) Deployment
```bash
make deploy-tron
```

### 3. Solana (Devnet) Deployment
*Requires [Solana CLI](https://docs.solanalabs.com/cli/install) and Rust/Cargo installed.*
```bash
make deploy-solana
```

### 4. Aptos (Testnet) Deployment
*Requires [Aptos CLI](https://aptos.dev/tools/aptos-cli/install-cli/) installed.*
```bash
make deploy-aptos
```

*After deployment, update the generated addresses in the `.env` file and the `contractAddresses` object in `src/app/modules/swap/components/home/home.component.ts`.*

---

## 💻 Usage & Testing

### 1. Run Frontend
```bash
npm start
```
*   Access `http://localhost:4200/swap`.
*   Connect your wallet (MetaMask, TronLink, etc.), enter the target chain, token address, and amount, then click **Swap Now**.

### 2. Run Solver
Once a user completes a deposit, the solver detects it and completes the processing on the destination chain.
```bash
make solve
```
*   The watcher scans for `Deposited` events in real-time.
*   Upon detecting an event, it automatically calls the `markProcessed` function on the destination chain.
*   Processed records are saved in `scripts/processed_deposits.json` to prevent duplicates.

### 3. Token Swap Test (ERC-20/TRC-20)
*   To send native coins (ETH/TRX), enter `0x00...00` (default) in the Token Address field.
*   To swap a specific token, enter the token contract address for that testnet. (The solver handles `approve` and `transferFrom` logic automatically.)

---

## ⚠️ Important Notes

*   This project is for **Testnet use only**. Do not use it on the Mainnet.
*   The wallet running the solver must have sufficient funds for gas fees (ETH, TRX) on each chain.
*   On-chain programs for Solana and Aptos must be deployed separately using the sources in the `contracts/` folder. (Automation is focused on EVM/TRON.)
