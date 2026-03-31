import { Injectable } from '@angular/core';
import { Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  }

  async connectWallet(): Promise<string> {
    if (!window.solana) {
      throw new Error('Solana wallet (e.g. Phantom) is not installed');
    }
    const resp = await window.solana.connect();
    return resp.publicKey.toString();
  }

  async deposit(programId: string, stateAccount: string, amount: number): Promise<string> {
    if (!window.solana) throw new Error('No solana wallet');

    const userPublicKey = window.solana.publicKey;
    const programPubKey = new PublicKey(programId);
    const statePubKey = new PublicKey(stateAccount);

    // Simplified instruction data for the POC (matching SwapInstruction::Deposit { amount })
    // In a real scenario, you'd use a library like @coral-xyz/anchor or borsh to encode this properly
    const amountLittleEndian = Buffer.alloc(8);
    amountLittleEndian.writeBigUInt64LE(BigInt(amount * 1e9)); // Assuming 1e9 lamports per SOL

    const data = Buffer.concat([
      Buffer.from([0]), // Instruction index for 'Deposit'
      amountLittleEndian
    ]);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: statePubKey, isSigner: false, isWritable: true },
        { pubkey: userPublicKey, isSigner: true, isWritable: false },
      ],
      programId: programPubKey,
      data: data,
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = userPublicKey;
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const { signature } = await window.solana.signAndSendTransaction(transaction);
    await this.connection.confirmTransaction(signature);
    
    return signature;
  }
}
