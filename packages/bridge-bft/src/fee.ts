import * as ethers from 'ethers';
import { Id256Factory } from '@bitfinity-network/id256';
import { Principal } from '@dfinity/principal';

import FeeChargeABI from './abi/FeeCharge';

export interface FeeChargeOptions {
  address: string;
  wallet: ethers.Signer;
}

export class FeeCharge {
  protected eth: {
    feeCharge?: ethers.Contract;
  } = {};
  protected wallet: ethers.Signer;
  protected address: string;

  constructor({ address, wallet }: FeeChargeOptions) {
    this.address = address;
    this.wallet = wallet;
  }

  protected get feeCharge() {
    if (!this.eth.feeCharge) {
      this.eth.feeCharge = new ethers.Contract(
        this.address,
        FeeChargeABI,
        this.wallet
      );
    }

    return this.eth.feeCharge;
  }

  async depositNativeTokens(owner: string) {
    const data = this.feeCharge.interface.encodeFunctionData(
      'nativeTokenDeposit',
      [[Id256Factory.fromPrincipal(Principal.fromText(owner))]]
    );

    const nonce = await this.wallet.getNonce();

    const tx: ethers.ethers.TransactionRequest = {
      nonce,
      to: await this.feeCharge.getAddress(),
      value: BigInt(Math.pow(10, 14)),
      data
    };

    const dpTx = await this.wallet.sendTransaction(tx);
    await dpTx.wait(2);
  }

  async checkAndDeposit(owner: string, recipient: string) {
    const nativeBalance = await this.feeCharge.nativeTokenBalance(recipient);

    if (nativeBalance <= 0) {
      await this.depositNativeTokens(owner);

      const nativeBalance = await this.feeCharge.nativeTokenBalance(recipient);

      if (nativeBalance <= 0) {
        throw new Error('No native tokens deposited');
      }
    }
  }
}
