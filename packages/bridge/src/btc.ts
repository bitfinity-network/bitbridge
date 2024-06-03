import { Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import * as ethers from 'ethers';
import type { Agent } from '@dfinity/agent';
import { BridgeToken } from '@bitfinity-network/bridge-tokens';
import { Bft } from '@bitfinity-network/bridge-bft';

import { Bridge } from './bridge';
import { BtcActor, createBtcBridgeActor } from './ic';
import { ethAddrToSubaccount } from './utils';
import WrappedTokenABI from './abi/WrappedToken';

interface BtcBridgeOptions {
  agent: Agent;
  bftAddress: string;
  wrappedTokenAddress: string;
  btcBridgeCanisterId: string;
}

export class BtcBridge implements Bridge {
  protected agent: Agent;
  protected btcBridgeCanisterId: string;
  protected wrappedTokenAddress: string;
  protected walletActors: {
    wallet?: ethers.Signer;
    btcActor?: typeof BtcActor;
  } = {};
  protected eth: {
    bft?: Bft;
  } = {};
  readonly bftAddress: string;

  constructor({
    agent,
    bftAddress,
    wrappedTokenAddress,
    btcBridgeCanisterId
  }: BtcBridgeOptions) {
    this.agent = agent;
    this.wrappedTokenAddress = wrappedTokenAddress;
    this.btcBridgeCanisterId = btcBridgeCanisterId;
    this.bftAddress = bftAddress;
  }

  connectEthWallet(wallet?: ethers.Signer, bft?: Bft) {
    if (this.walletActors.wallet !== wallet) {
      this.walletActors.wallet = wallet;
      this.eth = {};
    }

    if (this.eth.bft !== bft) {
      this.eth.bft = bft;
    }
  }

  connectBitfinityWallet() {}

  idMatch(token: BridgeToken) {
    return this.wrappedTokenAddress === token.wrappedTokenAddress;
  }

  icWhitelist() {
    return [this.btcBridgeCanisterId];
  }

  get wallet() {
    if (!this.walletActors.wallet) {
      throw new Error('ETH wallet not connected yet');
    }

    return this.walletActors.wallet;
  }

  get btcActor() {
    if (!this.walletActors.btcActor) {
      this.walletActors.btcActor = createBtcBridgeActor(
        this.btcBridgeCanisterId,
        { agent: this.agent }
      );
    }

    return this.walletActors.btcActor;
  }

  get bftBridge() {
    if (!this.eth.bft) {
      throw new Error('Bft not connected yet');
    }

    return this.eth.bft;
  }

  getWrappedTokenContract() {
    return new ethers.Contract(
      this.wrappedTokenAddress,
      WrappedTokenABI,
      this.wallet
    );
  }

  async getWrappedTokenBalance(address: string) {
    const wrappedTokenContract = this.getWrappedTokenContract();

    return await wrappedTokenContract.balanceOf(address);
  }

  async getBTCAddress(address: string) {
    const btcAddress = await this.btcActor.get_btc_address({
      owner: [Principal.fromText(Actor.canisterIdOf(this.btcActor).toText())],
      subaccount: [ethAddrToSubaccount(address)]
    });

    return btcAddress;
  }

  /**
   * After you sent the BTC to the address returned
   * by getBTCAddress, this function will bridge
   * the tokens to EVM.
   *
   * @param address
   */
  async bridgeToEvmc(address: string) {
    return await this.btcActor.btc_to_erc20(address);
  }

  async bridgeFromEvmc(address: string, satoshis: number) {
    const wrappedTokenContract = this.getWrappedTokenContract();

    const approveTx = await wrappedTokenContract.approve(
      this.bftBridge.address,
      satoshis
    );
    await approveTx.wait(2);

    await this.bftBridge.burn(
      address,
      this.wrappedTokenAddress,
      BigInt(satoshis),
    );
  }
}
