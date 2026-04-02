import { ethers } from "ethers";
import { TronWeb } from "tronweb";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import * as solana from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

// EVM ABI (이벤트만 포함)
const EVM_ABI = [
  "event Deposited(uint256 indexed depositId, address indexed user, address indexed token, uint256 amount, string targetChain, string targetAddress)"
];

async function watchSepolia() {
  const rpcUrl = process.env['SEPOLIA_RPC_URL']!;
  const contractAddress = process.env['SEPOLIA_CONTRACT_ADDRESS']!;

  if (!rpcUrl || !contractAddress || contractAddress.startsWith('0x000')) {
    console.warn("[Sepolia] 설정이 올바르지 않아 감시를 건너뜁니다.");
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, EVM_ABI, provider);

  console.log(`[Sepolia] 감시 시작: ${contractAddress}`);

  contract.on("Deposited", (depositId, user, token, amount, targetChain, targetAddress, event) => {
    console.log("\n********** [Sepolia Event Detected] **********");
    console.log(`- Deposit ID: ${depositId}`);
    console.log(`- User: ${user}`);
    console.log(`- Token: ${token}`);
    console.log(`- Amount: ${ethers.formatEther(amount)} ETH/Token`);
    console.log(`- Target Chain: ${targetChain}`);
    console.log(`- Target Address: ${targetAddress}`);
    console.log(`- Transaction: ${event.log.transactionHash}`);
    console.log("**********************************************\n");
  });
}

async function watchTron() {
  const fullHost = "https://nile.trongrid.io";
  const contractAddress = process.env['TRON_CONTRACT_ADDRESS']!;
  const apiKey = process.env['TRON_API_KEY'] || "";

  if (!contractAddress || contractAddress.startsWith('T000')) {
    console.warn("[TRON Nile] 설정이 올바르지 않아 감시를 건너뜁니다.");
    return;
  }

  const tronWeb = new TronWeb({
    fullHost,
    headers: { "TRON-PRO-API-KEY": apiKey }
  });

  console.log(`[TRON Nile] 감시 시작: ${contractAddress}`);

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
        console.log("\n********** [TRON Event Detected] **********");
        console.log(`- Deposit ID: ${ev.result.depositId}`);
        console.log(`- User: ${tronWeb.address.fromHex(ev.result.user)}`);
        console.log(`- Amount: ${tronWeb.fromSun(ev.result.amount)} TRX`);
        console.log(`- Target Chain: ${ev.result.targetChain}`);
        console.log(`- Target Address: ${ev.result.targetAddress}`);
        console.log(`- Transaction: ${ev.transaction}`);
        console.log("********************************************\n");
        if (ev.timestamp > lastTimestamp) lastTimestamp = ev.timestamp;
      }
    } catch (error) {}
  }, 5000);
}

async function watchAptos() {
  const adminAddr = process.env['APTOS_ACCOUNT_ADDRESS']!;
  if (!adminAddr || adminAddr.startsWith('0x000')) {
    console.warn("[Aptos Devnet] 설정이 올바르지 않아 감시를 건너뜁니다.");
    return;
  }

  const aptosConfig = new AptosConfig({ network: Network.DEVNET });
  const aptos = new Aptos(aptosConfig);

  console.log(`[Aptos Devnet] 감시 시작: ${adminAddr}`);
  
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
          console.log("\n********** [Aptos Event Detected] **********");
          console.log(`- Deposit ID: ${id}`);
          console.log(`- Amount: ${d.amount}`);
          console.log(`- Target Chain: ${d.target_chain}`);
          console.log(`- Target Address: ${d.target_address}`);
          console.log("********************************************\n");
          lastProcessedId = id;
        }
      }
    } catch (error) {}
  }, 5000);
}

async function watchSolana() {
  const programIdStr = process.env['SOLANA_PROGRAM_ID']!;
  if (!programIdStr || programIdStr.startsWith('Prog')) {
    console.warn("[Solana] 설정이 올바르지 않아 감시를 건너뜁니다.");
    return;
  }

  const rpcUrl = process.env['SOLANA_RPC_URL'] || "http://127.0.0.1:8899";
  const connection = new solana.Connection(rpcUrl, "confirmed");
  const programId = new solana.PublicKey(programIdStr);

  console.log(`[Solana] 감시 시작: ${programIdStr}`);

  connection.onLogs(programId, (logs) => {
    for (const log of logs.logs) {
      const match = log.match(/Deposited: (\d+), ([^,]+), ([^,]+), ([^,]+)/);
      if (match) {
        const [_, amount, targetChain, targetAddress, user] = match;
        console.log("\n********** [Solana Event Detected] **********");
        console.log(`- Signature: ${logs.signature}`);
        console.log(`- User: ${user}`);
        console.log(`- Amount: ${amount}`);
        console.log(`- Target Chain: ${targetChain}`);
        console.log(`- Target Address: ${targetAddress}`);
        console.log("*********************************************\n");
      }
    }
  }, "confirmed");
}

async function main() {
  console.log("--- Multi-chain Swap Event Watcher Start (All 4 Layers) ---");
  
  await Promise.all([
    watchSepolia(),
    watchTron(),
    watchAptos(),
    watchSolana()
  ]);
}

main().catch(console.error);
