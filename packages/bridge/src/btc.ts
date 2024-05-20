import { Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import * as ethers from 'ethers';

import { Bridge } from './bridge';
import { BtcActor, BtcBridgeIdlFactory } from './ic';
import { encodeBtcAddress, ethAddrToSubaccount } from './utils';
import WrappedTokenABI from './abi/WrappedToken';
import BFTBridgeABI from './abi/BFTBridge';
import { wait } from './utils';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

interface BtcBridgeOptions {
  wallet: ethers.Signer;
  bitfinityWallet: BitfinityWallet;
  bftAddress: string;
  icHost: string;
  wrappedTokenAddress: string;
  btcBridgeCanisterId: string;
}

export class BtcBridge implements Bridge {
  protected bitfinityWallet: BitfinityWallet;
  protected wallet: ethers.Signer;
  protected bftBridge: ethers.Contract;
  protected icHost: string;
  protected btcBridgeCanisterId: string;
  public wrappedTokenAddress: string;
  protected walletActors: {
    btcActor?: typeof BtcActor;
  } = {};

  constructor({
    wallet,
    bitfinityWallet,
    bftAddress,
    icHost,
    wrappedTokenAddress,
    btcBridgeCanisterId
  }: BtcBridgeOptions) {
    this.wallet = wallet;
    this.bitfinityWallet = bitfinityWallet;
    this.bftBridge = this.getBftBridgeContract(bftAddress);
    this.icHost = icHost;
    this.wrappedTokenAddress = wrappedTokenAddress;
    this.btcBridgeCanisterId = btcBridgeCanisterId;
  }

  async init() {
    await this.initBtcActor();
  }

  async icWhitelist() {
    return [this.btcBridgeCanisterId];
  }

  protected async initBtcActor() {
    if (this.walletActors.btcActor) {
      return this.walletActors.btcActor;
    }

    this.walletActors.btcActor = await this.bitfinityWallet.createActor<
      typeof BtcActor
    >({
      canisterId: this.btcBridgeCanisterId,
      interfaceFactory: BtcBridgeIdlFactory,
      host: this.icHost
    });
  }

  get btcActor() {
    if (!this.walletActors.btcActor) {
      throw new Error('Wallet actors not init yet. Call init() before');
    }

    return this.walletActors.btcActor;
  }

  getWrappedTokenContract() {
    return new ethers.Contract(
      this.wrappedTokenAddress,
      WrappedTokenABI,
      this.wallet
    );
  }

  getBftBridgeContract(address: string) {
    return new ethers.Contract(address, BFTBridgeABI, this.wallet);
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
      await this.bftBridge.getAddress(),
      satoshis
    );
    await approveTx.wait(2);

    await wait(10000);

    const burnTx = await this.bftBridge.burn(
      satoshis,
      this.wrappedTokenAddress,
      `0x${encodeBtcAddress(address)}`
    );

    await burnTx.wait(2);
  }
}
