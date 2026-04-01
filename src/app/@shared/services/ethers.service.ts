import { Injectable } from '@angular/core';
import { BrowserProvider, Contract, parseUnits, Signer } from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class EthersService {
  private provider: BrowserProvider | null = null;
  private signer: Signer | null = null;

  private ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function decimals() public view returns (uint8)"
  ];

  constructor() {
    // We don't initialize provider here to avoid immediate conflicts
  }

  private ensureProvider() {
    if (this.provider) return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error('MetaMask is not installed');

    // Handle multiple providers (e.g. MetaMask + Coinbase + Phantom)
    let selectedProvider = ethereum;
    if (ethereum.providers?.length) {
        selectedProvider = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum.providers[0];
    }

    this.provider = new BrowserProvider(selectedProvider);
  }

  async connectWallet(): Promise<string[]> {
    this.ensureProvider();
    
    try {
        // Check if already connected
        const alreadyConnected = await this.provider!.send('eth_accounts', []);
        if (alreadyConnected && alreadyConnected.length > 0) {
            this.signer = await this.provider!.getSigner();
            return alreadyConnected;
        }

        // Request connection
        const accounts = await this.provider!.send('eth_requestAccounts', []);
        this.signer = await this.provider!.getSigner();
        return accounts;
    } catch (error: any) {
        console.error('EthersService.connectWallet Error:', error);
        if (error.code === -32603) {
            throw new Error('MetaMask error (-32603). Please unlock MetaMask and ensure it is set as your default wallet.');
        }
        throw error;
    }
  }

  async deposit(contractAddress: string, tokenAddress: string, amount: number, targetChain: string, targetAddress: string): Promise<string> {
    if (!this.signer) {
        await this.connectWallet();
    }

    const network = await this.provider!.getNetwork();
    console.log('Current Network:', network.name, 'ChainId:', network.chainId.toString());
    
    if (network.chainId.toString() !== '11155111') {
        throw new Error(`Wrong network! You are on ${network.name} (ChainId: ${network.chainId}). Please switch to Sepolia.`);
    }

    const abi = [
      "function deposit(address token, uint256 amount, string calldata targetChain, string calldata targetAddress) external payable returns (uint256)"
    ];

    const contract = new Contract(contractAddress, abi, this.signer!);
    let finalAmount: bigint;

    const cleanTokenAddress = (tokenAddress || '').trim().toLowerCase();
    const isNative = cleanTokenAddress === '' || 
                     cleanTokenAddress === '0x0000000000000000000000000000000000000000' || 
                     cleanTokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

    if (isNative) {
      finalAmount = parseUnits(amount.toString(), 18);
      const tx = await (contract as any).deposit('0x0000000000000000000000000000000000000000', 0, targetChain, targetAddress, {
        value: finalAmount
      });
      const receipt = await tx.wait();
      return receipt.hash;
    } else {
      const code = await this.provider!.getCode(cleanTokenAddress);
      if (code === '0x') {
          throw new Error(`Token address is not a contract on Sepolia. Please use 0x00...00 for Native ETH.`);
      }

      const tokenContract = new Contract(cleanTokenAddress, this.ERC20_ABI, this.signer!);
      const decimals = await (tokenContract as any).decimals();
      finalAmount = parseUnits(amount.toString(), decimals);

      const userAddress = await this.signer!.getAddress();
      const allowance = await (tokenContract as any).allowance(userAddress, contractAddress);
      
      if (allowance < finalAmount) {
        const approveTx = await (tokenContract as any).approve(contractAddress, finalAmount);
        await approveTx.wait();
      }

      const tx = await (contract as any).deposit(cleanTokenAddress, finalAmount, targetChain, targetAddress);
      const receipt = await tx.wait();
      return receipt.hash;
    }
  }
}
