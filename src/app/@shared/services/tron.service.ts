import { Injectable } from '@angular/core';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class TronService {
  constructor() {}

  async connectWallet(): Promise<string> {
    if (!window.tronWeb) throw new Error('TronLink is not installed');
    const accounts = await window.tronWeb.request({ method: 'tron_requestAccounts' });
    return accounts.base58;
  }

  async deposit(contractAddress: string, tokenAddress: string, amount: number, targetChain: string, targetAddress: string): Promise<string> {
    if (!window.tronWeb) throw new Error('TronLink is not installed');

    const contract = await window.tronWeb.contract().at(contractAddress);

    if (tokenAddress === 'T9yD14Nj9j7xAB4dbGeiX9hADU7GV3nwdG' || tokenAddress === '0x0000000000000000000000000000000000000000' || !tokenAddress) {
      // Native TRX (using a common dummy address or zero address check)
      const sunAmount = window.tronWeb.toSun(amount);
      return await contract.deposit('0x0000000000000000000000000000000000000000', 0, targetChain, targetAddress).send({
        callValue: sunAmount,
        feeLimit: 100_000_000
      });
    } else {
      // TRC20
      const tokenContract = await window.tronWeb.contract().at(tokenAddress);
      const decimals = await tokenContract.decimals().call();
      const finalAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));

      // Check Allowance
      const userAddress = window.tronWeb.defaultAddress.base58;
      const allowance = await tokenContract.allowance(userAddress, contractAddress).call();
      
      if (BigInt(allowance.toString()) < finalAmount) {
        await tokenContract.approve(contractAddress, finalAmount.toString()).send();
      }

      return await contract.deposit(tokenAddress, finalAmount.toString(), targetChain, targetAddress).send({
        feeLimit: 100_000_000
      });
    }
  }
}
