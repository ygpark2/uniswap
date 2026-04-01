import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EthersService } from '@app/@shared/services/ethers.service';
import { TronService } from '@app/@shared/services/tron.service';
import { SolanaService } from '@app/@shared/services/solana.service';
import { AptosService } from '@app/@shared/services/aptos.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '@env/environment';

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
  connectedAddress: string | null = null;

  contractAddresses = environment.contractAddresses;

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
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.swapForm = this.fb.group({
      sourceChain: ['evm', [Validators.required]],
      targetChain: ['tron', [Validators.required]],
      tokenAddress: ['0x0000000000000000000000000000000000000000', [Validators.required]],
      amount: [0.01, [Validators.required, Validators.min(0.000001)]],
      targetAddress: ['', [Validators.required]]
    });

    // Reset token address template when source chain changes
    this.swapForm.get('sourceChain')?.valueChanges.subscribe(chain => {
      if (chain === 'evm' || chain === 'aptos') {
        this.swapForm.get('tokenAddress')?.setValue('0x0000000000000000000000000000000000000000');
      } else if (chain === 'tron') {
        this.swapForm.get('tokenAddress')?.setValue('T9yD14Nj9j7xAB4dbGeiX9hADU7GV3nwdG');
      }
    });
  }

  async connectWallet(): Promise<void> {
    try {
      const accounts = await this.ethersService.connectWallet();
      if (accounts && accounts.length > 0) {
        this.connectedAddress = accounts[0];
        this.cdr.detectChanges();
      }
    } catch (error: any) {
      console.error('Initial wallet connection failed:', error);
    }
  }

  async onSwap(): Promise<void> {
    if (this.swapForm.invalid) {
      return;
    }

    if (!this.connectedAddress) {
        await this.connectWallet();
        if (!this.connectedAddress) return;
    }

    this.isProcessing = true;
    this.txHash = null;
    this.cdr.detectChanges();

    const { sourceChain, targetChain, tokenAddress, amount, targetAddress } = this.swapForm.value;
    const trimmedTokenAddress = (tokenAddress || '').trim();
    const trimmedTargetAddress = (targetAddress || '').trim();

    console.log('Initiating swap:', { sourceChain, targetChain, trimmedTokenAddress, amount, trimmedTargetAddress });

    try {
      if (sourceChain === 'evm') {
        this.txHash = await this.ethersService.deposit(
          this.contractAddresses['evm'],
          trimmedTokenAddress,
          amount,
          targetChain,
          trimmedTargetAddress
        );
      } else if (sourceChain === 'tron') {
        this.txHash = await this.tronService.deposit(
          this.contractAddresses['tron'],
          trimmedTokenAddress,
          amount,
          targetChain,
          trimmedTargetAddress
        );
      } else if (sourceChain === 'solana') {
        this.txHash = await this.solanaService.deposit(
          this.contractAddresses['solana'],
          this.contractAddresses['solanaState'],
          amount,
          targetChain,
          trimmedTargetAddress
        );
      } else if (sourceChain === 'aptos') {
        this.txHash = await this.aptosService.deposit(
          this.contractAddresses['aptos'],
          amount,
          targetChain,
          trimmedTargetAddress
        );
      } else {
        throw new Error(`${sourceChain} is not implemented yet.`);
      }

      this.message.success(`${sourceChain.toUpperCase()} Swap transaction sent!`);
    } catch (error: any) {
      console.error('Swap failed:', error);
      const msg = error.reason || error.message || error;
      this.message.error(`Swap failed: ${msg}`);
    } finally {
      this.isProcessing = false;
      this.cdr.detectChanges();
    }
  }
}
