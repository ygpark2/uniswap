import { Injectable } from '@angular/core';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class AptosService {
  private aptos: Aptos;

  constructor() {
    const config = new AptosConfig({ network: Network.DEVNET });
    this.aptos = new Aptos(config);
  }

  async connectWallet(): Promise<string> {
    if (!window.aptos) {
      throw new Error('Aptos wallet (e.g. Petra) is not installed');
    }
    const resp = await window.aptos.connect();
    return resp.address;
  }

  async deposit(adminAddr: string, amount: number, targetChain: string, targetAddress: string): Promise<string> {
    if (!window.aptos) throw new Error('No aptos wallet');

    // Aptos typically uses 8 decimals (1e8) for Octas
    const octasAmount = BigInt(Math.floor(amount * 1e8));

    const transaction = await window.aptos.signAndSubmitTransaction({
      payload: {
        function: `${adminAddr}::swap_gateway_v2::deposit`,
        type_arguments: [],
        arguments: [
          adminAddr,
          octasAmount.toString(),
          targetChain,
          targetAddress
        ],
      }
    });

    const response = await this.aptos.waitForTransaction({ transactionHash: transaction.hash });
    return response.hash;
  }
}
