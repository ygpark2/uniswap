import { ethers } from "ethers";
import { TronWeb } from "tronweb";
import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import * as solana from "@solana/web3.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATE_FILE = path.join(__dirname, "processed_deposits.json");

// ABI with events and functions
const EVM_ABI = [
  "event Deposited(uint256 indexed depositId, address indexed user, address indexed token, uint256 amount, string targetChain, string targetAddress)",
  "function markProcessed(uint256 depositId) external"
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

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);
const aptosPrivateKey = new Ed25519PrivateKey(process.env['APTOS_PRIVATE_KEY']!);
const aptosAccount = Account.fromPrivateKey({ privateKey: aptosPrivateKey });

const getSolanaConnection = () => {
    const rpcUrl = process.env['SOLANA_RPC_URL'];
    const network = process.env['SOLANA_NETWORK'];

    if (rpcUrl) return new solana.Connection(rpcUrl, "confirmed");
    if (network) return new solana.Connection(solana.clusterApiUrl(network as solana.Cluster), "confirmed");
    
    return new solana.Connection("http://127.0.0.1:8899", "confirmed"); // Default to local
};

const solanaConnection = getSolanaConnection();
const solanaKeypair = solana.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env['SOLANA_PRIVATE_KEY'] || "[]")));

// Relay Functions
async function relayToTron(sourceChain: string, depositId: string, targetAddress: string, amount: string) {
  const key = `${sourceChain}_${depositId}`;
  if (processedState[key]) return;
  console.log(`[Relayer] Processing ${sourceChain} Deposit ${depositId} -> TRON ${targetAddress}`);
  try {
    const tronContractAddress = process.env['TRON_CONTRACT_ADDRESS']!;
    const contract = await tronWeb.contract().at(tronContractAddress);
    const tx = await (contract as any).markProcessed(depositId).send();
    console.log(`[Relayer] Successfully processed on TRON. Tx: ${tx}`);
    processedState[key] = true;
    saveProcessedState(processedState);
  } catch (error) {
    console.error(`[Relayer] Failed to relay to TRON:`, error);
  }
}

async function relayToEvm(sourceChain: string, depositId: string, targetAddress: string, amount: string) {
  const key = `${sourceChain}_${depositId}`;
  if (processedState[key]) return;
  console.log(`[Relayer] Processing ${sourceChain} Deposit ${depositId} -> EVM ${targetAddress}`);
  try {
    const tx = await (evmContract as any).markProcessed(depositId);
    await tx.wait();
    console.log(`[Relayer] Successfully processed on EVM. Tx: ${tx.hash}`);
    processedState[key] = true;
    saveProcessedState(processedState);
  } catch (error) {
    console.error(`[Relayer] Failed to relay to EVM:`, error);
  }
}

async function relayToAptos(sourceChain: string, depositId: string, targetAddress: string, amount: string) {
  const key = `${sourceChain}_${depositId}`;
  if (processedState[key]) return;
  console.log(`[Relayer] Processing ${sourceChain} Deposit ${depositId} -> APTOS ${targetAddress}`);
  try {
    const adminAddr = process.env['APTOS_ACCOUNT_ADDRESS']!;
    const transaction = await aptos.transaction.build.simple({
        sender: aptosAccount.accountAddress,
        data: {
            function: `${adminAddr}::swap_gateway_v2::mark_processed`,
            functionArguments: [depositId],
        },
    });
    const senderAuthenticator = aptos.transaction.sign({ signer: aptosAccount, transaction });
    const pendingTx = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
    await aptos.waitForTransaction({ transactionHash: pendingTx.hash });
    console.log(`[Relayer] Successfully processed on APTOS. Tx: ${pendingTx.hash}`);
    processedState[key] = true;
    saveProcessedState(processedState);
  } catch (error) {
    console.error(`[Relayer] Failed to relay to APTOS:`, error);
  }
}

async function relayToSolana(sourceChain: string, depositId: string, targetAddress: string, amount: string) {
  const key = `${sourceChain}_${depositId}`;
  if (processedState[key]) return;
  console.log(`[Relayer] Processing ${sourceChain} Deposit ${depositId} -> SOLANA ${targetAddress}`);
  try {
    const programId = new solana.PublicKey(process.env['SOLANA_PROGRAM_ID']!);
    const stateAccount = new solana.PublicKey(process.env['SOLANA_STATE_ACCOUNT']!);
    
    // Instruction 1: MarkProcessed (Borsh enum index 1)
    const instructionData = Buffer.from([1]); // 1 is MarkProcessed in enum
    const transaction = new solana.Transaction().add(
      new solana.TransactionInstruction({
        keys: [
          { pubkey: stateAccount, isSigner: false, isWritable: true },
          { pubkey: solanaKeypair.publicKey, isSigner: true, isWritable: false },
        ],
        programId,
        data: instructionData,
      })
    );
    const signature = await solana.sendAndConfirmTransaction(solanaConnection, transaction, [solanaKeypair]);
    console.log(`[Relayer] Successfully processed on SOLANA. Tx: ${signature}`);
    processedState[key] = true;
    saveProcessedState(processedState);
  } catch (error) {
    console.error(`[Relayer] Failed to relay to SOLANA:`, error);
  }
}

// Global Dispatcher
async function handleDeposit(source: string, depositId: string, targetChain: string, targetAddress: string, amount: string) {
    const chain = targetChain.toLowerCase();
    if (chain === 'tron') await relayToTron(source, depositId, targetAddress, amount);
    else if (chain === 'aptos') await relayToAptos(source, depositId, targetAddress, amount);
    else if (chain === 'solana') await relayToSolana(source, depositId, targetAddress, amount);
    else if (chain === 'evm' || chain === 'ethereum') await relayToEvm(source, depositId, targetAddress, amount);
}

// Watching Functions
async function watchSepolia() {
  const contractAddress = process.env['SEPOLIA_CONTRACT_ADDRESS']!;
  if (!contractAddress || contractAddress.startsWith('0x000')) return;
  const method = (process.env['EVM_WATCH_METHOD'] || 'polling').toLowerCase();
  if (method === 'listener') {
    console.log(`[Solver][Sepolia] Watching (Listener): ${contractAddress}`);
    evmContract.on("Deposited", async (depositId, user, token, amount, targetChain, targetAddress) => {
      console.log(`[Sepolia] New Deposit: ID ${depositId}`);
      await handleDeposit('evm', depositId.toString(), targetChain, targetAddress, amount.toString());
    });
  } else {
    console.log(`[Solver][Sepolia] Watching (Polling): ${contractAddress}`);
    let lastBlock = await evmProvider.getBlockNumber();
    setInterval(async () => {
      try {
        const currentBlock = await evmProvider.getBlockNumber();
        if (lastBlock >= currentBlock) return;
        const events = await evmContract.queryFilter("Deposited", lastBlock + 1, currentBlock);
        for (const event of events) {
          if ("args" in event) {
            const { depositId, targetChain, targetAddress, amount } = (event as any).args;
            console.log(`[Sepolia] New Deposit: ID ${depositId}`);
            await handleDeposit('evm', depositId.toString(), targetChain, targetAddress, amount.toString());
          }
        }
        lastBlock = currentBlock;
      } catch (error) {}
    }, 10000);
  }
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
        const { depositId, targetChain, targetAddress, amount } = ev.result;
        console.log(`[TRON] New Deposit: ID ${depositId}`);
        await handleDeposit('tron', depositId.toString(), targetChain, targetAddress, amount.toString());
        lastTimestamp = Math.max(lastTimestamp, ev.timestamp);
      }
    } catch (error) {}
  }, 5000);
}

async function watchAptos() {
    const adminAddr = process.env['APTOS_ACCOUNT_ADDRESS']!;
    if (!adminAddr || adminAddr.startsWith('0x000')) return;
    console.log(`[Solver][Aptos] Watching (Resource): ${adminAddr}`);
    
    let lastProcessedId = -1;

    setInterval(async () => {
        try {
            const resource = await aptos.getAccountResource({
                accountAddress: adminAddr,
                resourceType: `${adminAddr}::swap_gateway_v2::Gateway`
            });

            const gatewayData = resource as any;
            const deposits = gatewayData.deposits || [];

            for (const d of deposits) {
                const id = parseInt(d.id);
                if (id > lastProcessedId) {
                    console.log(`[Aptos] New Deposit detected: ID ${id}`);
                    await handleDeposit('aptos', id.toString(), d.target_chain, d.target_address, d.amount.toString());
                    lastProcessedId = id;
                }
            }
        } catch (error) {}
    }, 5000);
}

async function watchSolana() {
    const programIdStr = process.env['SOLANA_PROGRAM_ID']!;
    if (!programIdStr || programIdStr.startsWith('Prog')) return;
    const programId = new solana.PublicKey(programIdStr);
    console.log(`[Solver][Solana] Watching: ${programIdStr}`);

    solanaConnection.onLogs(programId, (logs) => {
        for (const log of logs.logs) {
            // Pattern: msg!("Deposited: {amount}, {target_chain}, {target_address}, {user}");
            const match = log.match(/Deposited: (\d+), ([^,]+), ([^,]+), ([^,]+)/);
            if (match) {
                const [_, amount, targetChain, targetAddress, user] = match;
                const depositId = logs.signature.slice(0, 8); // Use part of tx signature as depositId for Solana
                console.log(`[Solana] New Deposit: Amount ${amount}, Target: ${targetChain}`);
                handleDeposit('solana', depositId, targetChain, targetAddress, amount);
            }
        }
    }, "confirmed");
}

async function main() {
  console.log("--- Multi-chain Swap Solver/Relayer Active ---");
  console.log(`[State] Loaded ${Object.keys(processedState).length} processed transactions.`);
  await Promise.all([
    watchSepolia(),
    watchTron(),
    watchAptos(),
    watchSolana()
  ]);
}

main().catch(console.error);
