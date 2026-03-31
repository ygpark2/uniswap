import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EthersService } from '@app/@shared/services/ethers.service';
import { TronService } from '@app/@shared/services/tron.service';
import { SolanaService } from '@app/@shared/services/solana.service';
import { AptosService } from '@app/@shared/services/aptos.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-swap-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  swapForm!: FormGroup;
  isProcessing = false;
  txHash: string | null = null;

  // Placeholder contract addresses (replace with real ones after deployment)
  contractAddresses: Record<string, string> = {
    evm: '0x0000000000000000000000000000000000000000',     // Sepolia Gateway
    tron: 'T000000000000000000000000000000000',             // Nile Gateway
    solana: 'ProgramId00000000000000000000000000000000',    // Devnet Program ID
    solanaState: 'StateAccount00000000000000000000000000',  // Solana State Account
    aptos: '0x0000000000000000000000000000000000000000'     // Testnet Admin Address
  };

  chains = [
    { label: 'Ethereum (Sepolia)', value: 'evm' },
    { label: 'TRON (Nile)', value: 'tron' },
    { label: 'Solana (Devnet)', value: 'solana' },
    { label: 'Aptos (Testnet)', value: 'aptos' }
  ];

  constructor(
    private fb: FormBuilder,
    private ethersService: EthersService,
    private tronService: TronService,
    private solanaService: SolanaService,
    private aptosService: AptosService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.swapForm = this.fb.group({
      sourceChain: ['evm', [Validators.required]],
      targetChain: ['tron', [Validators.required]],
      tokenAddress: ['0x0000000000000000000000000000000000000000', [Validators.required]],
      amount: [0.01, [Validators.required, Validators.min(0.000001)]],
      targetAddress: ['', [Validators.required]]
    });
  }

  async onSwap(): Promise<void> {
    if (this.swapForm.invalid) {
      return;
    }

    this.isProcessing = true;
    this.txHash = null;

    const { sourceChain, targetChain, tokenAddress, amount, targetAddress } = this.swapForm.value;

    try {
      if (sourceChain === 'evm') {
        this.txHash = await this.ethersService.deposit(
          this.contractAddresses['evm'],
          tokenAddress,
          amount,
          targetChain,
          targetAddress
        );
      } else if (sourceChain === 'tron') {
        this.txHash = await this.tronService.deposit(
          this.contractAddresses['tron'],
          tokenAddress,
          amount,
          targetChain,
          targetAddress
        );
      } else if (sourceChain === 'solana') {
        this.txHash = await this.solanaService.deposit(
          this.contractAddresses['solana'],
          this.contractAddresses['solanaState'],
          amount
        );
      } else if (sourceChain === 'aptos') {
        this.txHash = await this.aptosService.deposit(
          this.contractAddresses['aptos'],
          amount,
          targetChain,
          targetAddress
        );
      } else {
        throw new Error(`${sourceChain} is not implemented yet.`);
      }

      this.message.success(`${sourceChain.toUpperCase()} Swap transaction sent!`);
    } catch (error: any) {
      console.error('Swap failed:', error);
      this.message.error(`Swap failed: ${error.message || error}`);
    } finally {
      this.isProcessing = false;
    }
  }
}
