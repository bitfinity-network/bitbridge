import { Actor } from '@dfinity/agent';
import * as ethers from 'ethers';

import { RuneActor, RuneBridgeIdlFactory } from './ic';
import { Id256Factory } from './validation';
import WrappedTokenABI from './abi/WrappedToken';
import { wait } from './utils';
import { encodeBtcAddress } from './utils';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';
import BFTBridgeABI from './abi/BFTBridge';
import { Bridge } from './bridge';

interface RuneBridgeOptions {
  wallet: ethers.Signer;
  bitfinityWallet: BitfinityWallet;
  bftAddress: string;
  icHost: string;
  runeBridgeCanisterId: string;
}

export class RuneBridge implements Bridge {
  protected bitfinityWallet: BitfinityWallet;
  protected wallet: ethers.Signer;
  protected bftBridge: ethers.Contract;
  protected icHost: string;
  protected runeBridgeCanisterId: string;
  protected walletActors: {
    runeActor?: typeof RuneActor;
  } = {};

  constructor({
    wallet,
    bitfinityWallet,
    bftAddress,
    icHost,
    runeBridgeCanisterId
  }: RuneBridgeOptions) {
    this.wallet = wallet;
    this.bitfinityWallet = bitfinityWallet;
    this.bftBridge = this.getBftBridgeContract(bftAddress);
    this.icHost = icHost;
    this.runeBridgeCanisterId = runeBridgeCanisterId;
  }

  async init() {
    await this.initRuneActor();
  }

  async icWhitelist() {
    return [this.runeBridgeCanisterId];
  }

  protected async initRuneActor() {
    if (this.walletActors.runeActor) {
      return this.walletActors.runeActor;
    }

    this.walletActors.runeActor = await this.bitfinityWallet.createActor<
      typeof RuneActor
    >({
      canisterId: this.runeBridgeCanisterId,
      interfaceFactory: RuneBridgeIdlFactory,
      host: this.icHost
    });
  }

  get runeActor() {
    if (!this.walletActors.runeActor) {
      throw new Error('Wallet actors not init yet. Call init() before');
    }

    return this.walletActors.runeActor;
  }

  async getDepositAddress(ethAddress: string) {
    const result = await this.runeActor.get_deposit_address(ethAddress);

    if (!('Ok' in result)) {
      throw new Error('Err');
    }

    return result.Ok;
  }

  protected getBftBridgeContract(address: string) {
    return new ethers.Contract(address, BFTBridgeABI, this.wallet);
  }

  private async getWrappedTokenContract() {
    const address = await this.getWrappedTokenEthAddress();

    return new ethers.Contract(address, WrappedTokenABI, this.wallet);
  }

  async getWrappedTokenEthAddress(): Promise<string> {
    // TODO: is the TOKEN_ETH_ADDRESS only depends on token-id?
    return await this.bftBridge.getWrappedToken(
      Id256Factory.fromPrincipal(Actor.canisterIdOf(this.runeActor))
    );
  }

  async getWrappedTokenBalance(address: string) {
    const wrappedTokenContract = await this.getWrappedTokenContract();

    return await wrappedTokenContract.balanceOf(address);
  }

  /**
   * After you sent the BTC to the address returned
   * by getDepositAddress, this function will bridge
   * the tokens to EVM.
   *
   * @param address
   */
  async bridgeToEvmc(address: string) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await this.runeActor.deposit(address);

      if ('Ok' in result) {
        return result.Ok;
      }

      await wait(7000);
    }
  }

  /**
   * Will send (bridge) the amount to the given BTC address.
   *
   * @param address
   * @param amount
   */
  async bridgeFromEvmc(address: string, amount: number) {
    const wrappedTokenContract = await this.getWrappedTokenContract();

    await wrappedTokenContract.approve(
      await this.bftBridge.getAddress(),
      amount
    );

    await wait(15000);

    const tokenAddress = await this.getWrappedTokenEthAddress();

    await this.bftBridge.burn(
      amount,
      tokenAddress,
      `0x${encodeBtcAddress(address)}`
    );
  }

  async getRunesBalance(address: string) {
    return await this.runeActor.get_rune_balances(address);
  }
}
