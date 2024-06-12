import * as ethers from 'ethers';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';
import { ActorSubclass, Actor, HttpAgent } from '@dfinity/agent';

import { Bft } from './bft';
import { FeeCharge } from './fee';
import WrappedTokenABI from './abi/WrappedToken';

export class Wallets {
  protected wallets: {
    eth?: ethers.Signer;
    bitfinityWallet?: BitfinityWallet;
  } = {};
  protected tokens: Record<string, ethers.Contract> = {};
  protected walletActors: Record<string, ActorSubclass<any>> = {};
  protected actors: Record<string, ActorSubclass<any>> = {};
  protected bfts: Record<string, Bft> = {};
  protected feeCharge: Record<string, FeeCharge> = {};

  get eth() {
    if (!this.wallets.eth) {
      throw new Error('ETH wallet not connected yet');
    }

    return this.wallets.eth;
  }

  get ic() {
    if (!this.wallets.bitfinityWallet) {
      throw new Error('Bitfinity wallet not connected yet');
    }

    return this.wallets.bitfinityWallet;
  }

  connectEthWallet(wallet?: ethers.Signer) {
    if (this.wallets.eth !== wallet) {
      this.wallets.eth = wallet;
      this.tokens = {};
      this.bfts = {};
    }
  }

  connectBitfinityWallet(bitfinityWallet?: BitfinityWallet) {
    if (this.wallets.bitfinityWallet !== bitfinityWallet) {
      this.wallets.bitfinityWallet = bitfinityWallet;
      this.walletActors = {};
    }
  }

  getWrappedTokenContract(address: string) {
    if (this.tokens[address]) {
      return this.tokens[address];
    }

    this.tokens[address] = new ethers.Contract(
      address,
      WrappedTokenABI,
      this.eth
    );

    return this.tokens[address];
  }

  async getWrappedTokenInfo(
    wrapped: string
  ): Promise<{ name: string; symbol: string; decimals: number }> {
    const wrappedTokenContract = this.getWrappedTokenContract(wrapped);

    const [name, symbol, decimals] = await Promise.all([
      wrappedTokenContract.name(),
      wrappedTokenContract.symbol(),
      wrappedTokenContract.decimals()
    ]);

    return {
      name,
      symbol,
      decimals
    };
  }

  async getWrappedTokenBalance(
    wrapped: string,
    address: string
  ): Promise<bigint> {
    const wrappedTokenContract = this.getWrappedTokenContract(wrapped);

    return await wrappedTokenContract.balanceOf(address);
  }

  getBft(address: string) {
    if (this.bfts[address]) {
      return this.bfts[address];
    }

    this.bfts[address] = new Bft({ address, wallet: this.eth });

    return this.bfts[address];
  }

  getFeeCharge(address: string) {
    if (this.feeCharge[address]) {
      return this.feeCharge[address];
    }

    this.feeCharge[address] = new FeeCharge({
      address,
      wallet: this.eth
    });

    return this.feeCharge[address];
  }

  getActor<T>(
    host: string,
    canisterId: string,
    interfaceFactory: any
  ): ActorSubclass<T> {
    if (this.actors[canisterId]) {
      return this.actors[canisterId];
    }

    const agent = new HttpAgent({ host });

    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      agent.fetchRootKey();
    }

    this.actors[canisterId] = Actor.createActor(interfaceFactory, {
      canisterId,
      agent
    });

    return this.actors[canisterId];
  }

  async getWalletActor<T>(
    canisterId: string,
    interfaceFactory: any
  ): Promise<ActorSubclass<T>> {
    if (this.walletActors[canisterId]) {
      return this.walletActors[canisterId];
    }

    this.walletActors[canisterId] = await this.ic.createActor<T>({
      canisterId,
      interfaceFactory
    });

    return this.walletActors[canisterId];
  }
}
