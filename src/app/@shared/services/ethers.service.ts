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
    if ((window as any).ethereum) {
      this.provider = new BrowserProvider((window as any).ethereum);
    }
  }

  async connectWallet(): Promise<string[]> {
    if (!this.provider) throw new Error('MetaMask is not installed');
    const accounts = await this.provider.send('eth_requestAccounts', []);
    this.signer = await this.provider.getSigner();
    return accounts;
  }

  async deposit(contractAddress: string, tokenAddress: string, amount: number, targetChain: string, targetAddress: string): Promise<string> {
    if (!this.signer) await this.connectWallet();

    const abi = [
      "function deposit(address token, uint256 amount, string calldata targetChain, string calldata targetAddress) external payable returns (uint256)"
    ];

    const contract = new Contract(contractAddress, abi, this.signer!);
    let finalAmount: bigint;

    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      finalAmount = parseUnits(amount.toString(), 18); // ETH
      const tx = await (contract as any).deposit(tokenAddress, 0, targetChain, targetAddress, {
        value: finalAmount
      });
      const receipt = await tx.wait();
      return receipt.hash;
    } else {
      const tokenContract = new Contract(tokenAddress, this.ERC20_ABI, this.signer!);
      const decimals = await (tokenContract as any).decimals();
      finalAmount = parseUnits(amount.toString(), decimals);

      // Check allowance
      const userAddress = await this.signer!.getAddress();
      const allowance = await (tokenContract as any).allowance(userAddress, contractAddress);
      
      if (allowance < finalAmount) {
        const approveTx = await (tokenContract as any).approve(contractAddress, finalAmount);
        await approveTx.wait();
      }

      const tx = await (contract as any).deposit(tokenAddress, finalAmount, targetChain, targetAddress);
      const receipt = await tx.wait();
      return receipt.hash;
    }
  }
}
