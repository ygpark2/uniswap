import { ethers } from "ethers";
import { TronWeb } from "tronweb";
import * as dotenv from "dotenv";

dotenv.config();

// EVM ABI (이벤트만 포함)
const EVM_ABI = [
  "event Deposited(uint256 indexed depositId, address indexed user, uint256 amount, string targetChain, string targetAddress)"
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

  contract.on("Deposited", (depositId, user, amount, targetChain, targetAddress, event) => {
    console.log("\n********** [Sepolia Event Detected] **********");
    console.log(`- Deposit ID: ${depositId}`);
    console.log(`- User: ${user}`);
    console.log(`- Amount: ${ethers.formatEther(amount)} ETH`);
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

  // TRON은 폴링(Polling) 방식으로 이벤트를 체크하는 것이 안정적입니다.
  setInterval(async () => {
    try {
      const events = await (tronWeb as any).getEventResult(contractAddress, {
        eventName: "Deposited",
        size: 10,
        onlyConfirmed: true,
      });

      if (!events || events.length === 0) return;

      // 새로운 이벤트만 필터링 (최신순으로 올 수 있으므로 정렬 고려)
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
    } catch (error) {
      // 에러 무시 (네트워크 이슈 등)
    }
  }, 5000); // 5초마다 확인
}

async function main() {
  console.log("--- Multi-chain Swap Event Watcher Start ---");
  
  await Promise.all([
    watchSepolia(),
    watchTron()
  ]);
}

main().catch(console.error);
