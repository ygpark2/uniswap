import { ethers } from "ethers";
import { TronWeb } from "tronweb";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const STATE_FILE = path.join(__dirname, "processed_deposits.json");

// ABI with events and functions
const EVM_ABI = [
  "event Deposited(uint256 indexed depositId, address indexed user, address indexed token, uint256 amount, string targetChain, string targetAddress)",
  "function markProcessed(uint256 depositId) external"
];

const TRON_ABI = [
  {
    "entryCol": "Deposited",
    "name": "Deposited",
    "inputs": [
      { "indexed": true, "name": "depositId", "type": "uint256" },
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": true, "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "targetChain", "type": "string" },
      { "name": "targetAddress", "type": "string" }
    ],
    "type": "event"
  },
  {
    "name": "markProcessed",
    "inputs": [{ "name": "depositId", "type": "uint256" }],
    "type": "function"
  }
];

// State Management
function loadProcessedState(): Record<string, boolean> {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  }
  return {};
}

function saveProcessedState(state: Record<string, boolean>) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

const processedState = loadProcessedState();

// Solver Instances
const evmProvider = new ethers.JsonRpcProvider(process.env['SEPOLIA_RPC_URL']!);
const evmWallet = new ethers.Wallet(process.env['SEPOLIA_PRIVATE_KEY']!, evmProvider);
const evmContract = new ethers.Contract(process.env['SEPOLIA_CONTRACT_ADDRESS']!, EVM_ABI, evmWallet);

const tronWeb = new TronWeb({
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env['TRON_API_KEY'] || "" },
  privateKey: process.env['TRON_PRIVATE_KEY'] || ""
});

async function relayToTron(depositId: string, targetAddress: string, amount: string) {
  const key = `evm_${depositId}`;
  if (processedState[key]) return;

  console.log(`[Relayer] Processing EVM Deposit ${depositId} -> TRON ${targetAddress}`);

  try {
    const tronContractAddress = process.env['TRON_CONTRACT_ADDRESS']!;
    const contract = await tronWeb.contract().at(tronContractAddress);
    
    // In a real swap, this would be a "transfer" or "mint" on TRON.
    // As per your requirement, we call markProcessed on the destination chain.
    const tx = await contract.markProcessed(depositId).send();
    
    console.log(`[Relayer] Successfully processed on TRON. Tx: ${tx}`);
    processedState[key] = true;
    saveProcessedState(processedState);
  } catch (error) {
    console.error(`[Relayer] Failed to relay to TRON:`, error);
  }
}

async function relayToEvm(depositId: string, targetAddress: string, amount: string) {
  const key = `tron_${depositId}`;
  if (processedState[key]) return;

  console.log(`[Relayer] Processing TRON Deposit ${depositId} -> EVM ${targetAddress}`);

  try {
    // Calling markProcessed on EVM
    const tx = await (evmContract as any).markProcessed(depositId);
    await tx.wait();
    
    console.log(`[Relayer] Successfully processed on EVM. Tx: ${tx.hash}`);
    processedState[key] = true;
    saveProcessedState(processedState);
  } catch (error) {
    console.error(`[Relayer] Failed to relay to EVM:`, error);
  }
}

async function watchSepolia() {
  const contractAddress = process.env['SEPOLIA_CONTRACT_ADDRESS']!;
  if (!contractAddress || contractAddress.startsWith('0x000')) return;

  console.log(`[Solver][Sepolia] Watching: ${contractAddress}`);

  evmContract.on("Deposited", async (depositId, user, token, amount, targetChain, targetAddress, event) => {
    console.log(`[Sepolia] New Deposit detected: ID ${depositId}, Token: ${token}`);
    if (targetChain.toLowerCase() === 'tron') {
      await relayToTron(depositId.toString(), targetAddress, amount.toString());
    }
  });
}

async function watchTron() {
  const contractAddress = process.env['TRON_CONTRACT_ADDRESS']!;
  if (!contractAddress || contractAddress.startsWith('T000')) return;

  console.log(`[Solver][TRON Nile] Watching: ${contractAddress}`);

  let lastTimestamp = Date.now();

  setInterval(async () => {
    try {
      const events = await (tronWeb as any).getEventResult(contractAddress, {
        eventName: "Deposited",
        size: 10,
        onlyConfirmed: true,
      });

      if (!events || events.length === 0) return;

      const newEvents = events.filter((ev: any) => ev.timestamp > lastTimestamp);
      
      for (const ev of newEvents) {
        const { depositId, token, targetChain, targetAddress, amount } = ev.result;
        console.log(`[TRON] New Deposit detected: ID ${depositId}, Token: ${token}`);
        
        if (targetChain.toLowerCase() === 'evm' || targetChain.toLowerCase() === 'ethereum') {
          await relayToEvm(depositId.toString(), targetAddress, amount.toString());
        }
        lastTimestamp = Math.max(lastTimestamp, ev.timestamp);
      }
    } catch (error) {
      // Ignore network errors
    }
  }, 5000);
}

async function main() {
  console.log("--- Multi-chain Swap Solver/Relayer Active ---");
  console.log(`[State] Loaded ${Object.keys(processedState).length} processed transactions.`);
  
  await Promise.all([
    watchSepolia(),
    watchTron()
  ]);
}

main().catch(console.error);
