# Multi-Chain Swap Gateway POC

이 프로젝트는 EVM(Sepolia), TRON(Nile), Solana(Devnet), Aptos(Testnet) 간의 교차 체인 스왑 기능을 검증하기 위한 Proof of Concept (POC)입니다.

## 🚀 주요 기능

1.  **멀티 체인 입금 게이트웨이**: 4개 체인(EVM, TRON, Solana, Aptos)에 최적화된 스마트 컨트랙트 제공.
2.  **Native & Token 스왑 지원**: ETH/TRX 등 네이티브 코인뿐만 아니라 ERC-20/TRC-20 토큰 스왑 가능.
3.  **통합 프론트엔드**: Angular 기반의 UI에서 메타마스크, 트론링크, 팬텀, 페트라 지갑을 모두 지원.
4.  **자동화된 솔버(Solver)**: 소스 체인의 입금 이벤트를 감지하여 목적지 체인의 상태를 자동으로 업데이트하는 릴레이어 포함.
5.  **상태 관리**: JSON 기반의 로컬 DB를 사용하여 중복 처리 방지.

---

## 📂 프로젝트 구조

```text
.
├── contracts/              # 스마트 컨트랙트 소스 코드
│   ├── evm/                # Solidity (Sepolia)
│   ├── tron/               # Solidity (Nile) + TronBox 설정
│   ├── solana/             # Rust (Devnet)
│   └── aptos/              # Move (Testnet)
├── scripts/                # 오프체인 스크립트
│   ├── solver.ts           # 통합 이벤트 와쳐 및 릴레이어
│   └── deploy-sepolia.ts   # EVM 배포 스크립트
├── src/app/modules/swap/   # Angular 스왑 UI 및 로직
└── Makefile                # 주요 명령어 자동화
```

---

## 🛠 환경 설정

1.  **의존성 설치**:
    ```bash
    make install
    ```

2.  **.env 파일 설정**:
    루트 폴더의 `.env` 파일을 자신의 지갑 개인키와 RPC URL로 수정하세요.
    ```env
    SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
    SEPOLIA_PRIVATE_KEY=your_private_key
    SEPOLIA_CONTRACT_ADDRESS=0x...

    TRON_PRIVATE_KEY=your_private_key
    TRON_API_KEY=your_trongrid_api_key
3. **설정값 가져오는 방법 (테스트넷 vs. 메인넷)**:

| 항목 | **테스트넷 (개발용)** | **메인넷 (프로덕션)** |
| :--- | :--- | :--- |
| **EVM RPC URL** | [Infura](https://infura.io) (Sepolia) | [Infura](https://infura.io) (Mainnet) |
| **TRON Host** | `https://nile.trongrid.io` (Nile) | `https://api.trongrid.io` (Mainnet) |
| **Solana RPC** | `https://api.devnet.solana.com` | `https://api.mainnet-beta.solana.com` |
| **Aptos Node** | `https://fullnode.testnet.aptoslabs.com/v1` | `https://fullnode.mainnet.aptoslabs.com/v1` |
| **Private Key** | **테스트용 지갑** 사용 권장 | **하드웨어 월렛** 등 보안 강화 |

*   **테스트 코인 받기**:
    *   **Sepolia ETH**: [Alchemy Faucet](https://sepoliafaucet.com/).
    *   **TRON Nile TRX**: [Nile Faucet](https://nileex.io/join/get_faucet).
    *   **Solana Devnet**: [Solana Faucet](https://faucet.solana.com/).                                     │
    *   **Aptos Testnet**: [Aptos Faucet](https://aptoslabs.com/developers/faucet).
*   **개인키 추출 방법**:
    *   **⚠️ 보안 주의사항**: 개인키는 메인넷과 테스트넷에서 동일하게 작동합니다. 만약 개인키가 노출되면 메인넷에 있는 **실제 자산**이 도난당할 수 있습니다.
    *   **권장 사항**: 지갑(메타마스크, 팬텀 등)에서 **반드시 '새 계정 생성'**을 눌러 개발 전용 계정을 따로 만드세요. 실제 돈이 들어있는 계정은 절대 개발에 사용하지 마세요.
    *   **MetaMask (EVM)**: 메타마스크 실행 -> 우측 상단 계정 아이콘 클릭 -> '계정 추가' -> 이름을 '개발용'으로 설정 후 개인키 추출.
    *   **TronLink (TRON)**: 트론링크 실행 -> '+' 아이콘 클릭 -> 'Create Wallet' -> '개발용' 계정 생성 후 개인키 추출.
    *   **솔라나 (Devnet)**: 팬텀 지갑 설정 -> 계정 관리 -> '지갑 추가/연결' -> '새 계정 생성'.
    *   **앱토스 (Testnet)**: Petra 지갑 설정 -> Manage Account -> 'Add Account' -> 'Create New Account'.
*   **배포 후 계약 주소 및 프로그램 ID 확인 방법**:
    *   **SEPOLIA_CONTRACT_ADDRESS**: `make deploy-evm` 실행 후 터미널에 출력되는 `Contract Address: 0x...`를 확인하세요.
    *   **TRON_CONTRACT_ADDRESS**: `make deploy-tron` 실행 후 TronBox의 마이그레이션 결과에 나오는 주소를 확인하세요.
    *   **SOLANA_PROGRAM_ID**: `make deploy-solana` 실행 후 터미널에 출력되는 `Program Id: ...`를 확인하세요.
    *   **SOLANA_STATE_ACCOUNT**: 프로그램 데이터를 저장할 계정이 필요합니다. `solana-keygen new -o state-keypair.json`으로 키파일을 생성한 후, 그 공개키(`solana-keygen pubkey state-keypair.json`)를 사용하세요.
    *   **APTOS_CONTRACT_ADDRESS**: `make deploy-aptos` 실행 시 사용된 계정 주소(모듈을 게시한 본인 계정)가 계약 주소가 됩니다.
*   *⚠️ 주의: 개인키는 절대 타인에게 공유하거나 소스 코드에 커밋하지 마세요.*

---

## 🚢 배포 방법 (Smart Contracts)

### 1. EVM (Sepolia) 배포
```bash
make deploy-evm
```

### 2. TRON (Nile) 배포
```bash
make deploy-tron
```

### 3. Solana (Devnet) 배포
*실행 전 [Solana CLI](https://docs.solanalabs.com/cli/install)와 Rust/Cargo가 설치되어 있어야 합니다 (설치: `sh -c "$(curl -sSfL https://release.solana.com/stable/install)"`).*
```bash
make deploy-solana
```

### 4. Aptos (Testnet) 배포
*실행 전 [Aptos CLI](https://aptos.dev/tools/aptos-cli/install-cli/)가 설치되어 있어야 합니다 (macOS: `brew install aptos`).*
```bash
make deploy-aptos
```

*배포 후 출력된 주소를 `.env` 파일과 `src/app/modules/swap/components/home/home.component.ts`의 `contractAddresses` 객체에 업데이트하세요.*

---

## 💻 사용 및 테스트 방법

### 1. 프론트엔드 실행
```bash
npm start
```
*   `http://localhost:4200/swap` 접속.
*   지갑(MetaMask, TronLink 등)을 연결하고 대상 체인, 토큰 주소, 금액을 입력 후 **Swap Now** 클릭.

### 2. 솔버(Solver) 실행
사용자가 입금을 완료하면, 솔버가 이를 감지하고 목적지 체인에서 처리를 완료합니다.
```bash
make solve
```
*   와쳐가 `Deposited` 이벤트를 실시간으로 스캔합니다.
*   이벤트 감지 시 목적지 체인의 `markProcessed` 함수를 자동 호출합니다.
*   처리된 내역은 `scripts/processed_deposits.json`에 저장되어 중복 처리를 방지합니다.

### 3. 토큰 스왑 테스트 (ERC-20/TRC-20)
*   네이티브 코인(ETH/TRX)을 보낼 때는 Token Address 칸에 `0x00...00` (기본값)을 입력합니다.
*   특정 토큰을 스왑할 때는 해당 테스트넷의 토큰 컨트랙트 주소를 입력하세요. (솔버가 자동으로 `approve`와 `transferFrom` 로직을 처리합니다.)

---

## ⚠️ 주의 사항

*   이 프로젝트는 **테스트넷 전용**입니다. 메인넷에서 사용하지 마세요.
*   솔버를 실행하는 지갑에는 각 체인의 가스비(ETH, TRX)가 충분히 있어야 합니다.
*   Solana와 Aptos의 온체인 프로그램은 `contracts/` 폴더의 소스를 참고하여 별도로 배포해야 합니다. (EVM/TRON 위주로 자동화되어 있습니다.)
