import * as ethers from 'ethers';
import { Principal } from '@dfinity/principal';
import { Address, Id256, Id256Factory } from '@bitfinity-network/id256';

import BftBridgeABI from './abi/BFTBridge';
import { Buffer } from 'buffer';

export interface BftOptions {
  wallet: ethers.Signer;
  bftAddress: string;
}

export class Bft {
  protected bftBridge: ethers.Contract;
  protected wallet: ethers.Signer;
  readonly address: string;

  constructor({ bftAddress, wallet }: BftOptions) {
    this.wallet = wallet;
    this.bftBridge = this.getBftBridgeContract(bftAddress);
    this.address = bftAddress;
  }

  protected getBftBridgeContract(address: string) {
    return new ethers.Contract(address, BftBridgeABI, this.wallet);
  }

  protected idFromCanister(baseTokenCanisterId: string): Id256 {
    return Id256Factory.fromPrincipal(Principal.fromText(baseTokenCanisterId));
  }

  protected idFromRune(runeId: string) {
    const [b, t] = runeId.split(':');
    return Id256Factory.fromBtcTxIndex(BigInt(b), parseInt(t, 10));
  }

  async depositNativeTokens(owner: string) {
    const data = this.bftBridge.interface.encodeFunctionData(
      'nativeTokenDeposit',
      [[Id256Factory.fromPrincipal(Principal.fromText(owner))]]
    );

    const nonce = await this.wallet.getNonce();

    const tx: ethers.ethers.TransactionRequest = {
      nonce,
      to: await this.bftBridge.getAddress(),
      value: BigInt(Math.pow(10, 17)),
      data
    };

    const dpTx = await this.wallet.sendTransaction(tx);
    await dpTx.wait(2);
  }

  async checkAndDeposit(owner: string, recipient: string) {
    const nativeBalance = await this.bftBridge.nativeTokenBalance(recipient);

    if (nativeBalance <= 0) {
      await this.depositNativeTokens(owner);

      const nativeBalance = await this.bftBridge.nativeTokenBalance(recipient);

      if (nativeBalance <= 0) {
        throw new Error('No native tokens on bft');
      }
    }
  }

  async deployIcrcWrappedToken(
    baseTokenCanisterId: string,
    name: string,
    symbol: string
  ): Promise<string> {
    const wrappedTokenAddress =
      await this.getWrappedTokenAddress(baseTokenCanisterId);

    if (wrappedTokenAddress && new Address(wrappedTokenAddress).isZero()) {
      const id256 = this.idFromCanister(baseTokenCanisterId);
      const tx = await this.bftBridge.deployERC20(name, symbol, id256);
      await tx.wait(2);
    }

    return await this.getWrappedTokenAddress(baseTokenCanisterId);
  }

  async deployRuneWrappedToken(runeId: string, name: string): Promise<string> {
    const wrappedTokenAddress = await this.getWrappedTokenAddress(runeId);

    if (wrappedTokenAddress && new Address(wrappedTokenAddress).isZero()) {
      const id256 = this.idFromRune(runeId);

      const tx = await this.bftBridge.deployERC20(name, name, id256);
      await tx.wait(2);
    }

    return await this.getWrappedTokenAddress(runeId);
  }

  async getWrappedTokenAddress(id: string): Promise<string> {
    return await this.bftBridge.getWrappedToken(
      id.includes(':') ? this.idFromRune(id) : this.idFromCanister(id)
    );
  }

  async burn(recipient: string, tokenAddress: string, amount: bigint) {
    let send;

    try {
      Principal.fromText(recipient);
      send = Id256Factory.fromPrincipal(Principal.fromText(recipient));
    } catch (_) {
      /* empty */
    }

    if (!send) {
      send = `0x${Buffer.from(recipient, 'utf8').toString('hex')}`;
    }

    const tx = await this.bftBridge.burn(amount, tokenAddress, send);

    await tx.wait(2);

    return tx;
  }
}
