import { Injectable } from '@angular/core';
import { Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl, Cluster } from '@solana/web3.js';
import { environment } from '@env/environment';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class SolanaService {
  private connection: Connection;

  constructor() {
    const network = (window.localStorage.getItem('solana_network') || 'devnet') as Cluster;
    this.connection = new Connection(clusterApiUrl(network), 'confirmed');
  }

  async connectWallet(): Promise<string> {
    if (!window.solana) {
      throw new Error('Solana wallet (e.g. Phantom) is not installed');
    }
    const resp = await window.solana.connect();
    return resp.publicKey.toString();
  }

  async deposit(programId: string, stateAccount: string, amount: number, targetChain: string = 'tron', targetAddress: string = ''): Promise<string> {
    if (!window.solana) throw new Error('No solana wallet');

    const userPublicKey = window.solana.publicKey;
    const programPubKey = new PublicKey(programId);
    const statePubKey = new PublicKey(stateAccount);

    const amountLittleEndian = Buffer.alloc(8);
    amountLittleEndian.writeBigUInt64LE(BigInt(Math.floor(amount * 1e9)));

    // Manual Borsh-like encoding for strings: 4 bytes length LE + UTF-8 bytes
    const encodeString = (str: string) => {
      const b = Buffer.from(str, 'utf8');
      const len = Buffer.alloc(4);
      len.writeUInt32LE(b.length);
      return Buffer.concat([len, b]);
    };

    const data = Buffer.concat([
      Buffer.from([0]), // Instruction index for 'Deposit'
      amountLittleEndian,
      encodeString(targetChain),
      encodeString(targetAddress)
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

    const signed = await window.solana.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(signed.serialize());
    await this.connection.confirmTransaction(signature);
    
    return signature;
  }
}
