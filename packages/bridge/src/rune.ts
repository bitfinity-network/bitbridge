import { Actor } from '@dfinity/agent';
import * as ethers from 'ethers';
import { Id256Factory } from '@bitfinity-network/id256';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

import { RuneActor, RuneBridgeIdlFactory } from './ic';
import WrappedTokenABI from './abi/WrappedToken';
import { wait } from './utils';
import { encodeBtcAddress } from './utils';
import BFTBridgeABI from './abi/BFTBridge';
import { Bridge } from './bridge';
import { BridgeToken, idStrMatch } from './tokens';

interface RuneBridgeOptions {
  wallet: ethers.Signer;
  bitfinityWallet: BitfinityWallet;
  bftAddress: string;
  wrappedTokenAddress: string;
  runeBridgeCanisterId: string;
}

export class RuneBridge implements Bridge {
  protected bitfinityWallet: BitfinityWallet;
  protected wallet: ethers.Signer;
  protected bftBridge: ethers.Contract;
  protected runeBridgeCanisterId: string;
  protected wrappedTokenAddress: string;
  protected walletActors: {
    runeActor?: typeof RuneActor;
  } = {};

  constructor({
    wallet,
    bitfinityWallet,
    bftAddress,
    wrappedTokenAddress,
    runeBridgeCanisterId
  }: RuneBridgeOptions) {
    this.wallet = wallet;
    this.bitfinityWallet = bitfinityWallet;
    this.bftBridge = this.getBftBridgeContract(bftAddress);
    this.wrappedTokenAddress = wrappedTokenAddress;
    this.runeBridgeCanisterId = runeBridgeCanisterId;
  }

  idMatch(token: BridgeToken) {
    return idStrMatch(this.wrappedTokenAddress, token);
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
      interfaceFactory: RuneBridgeIdlFactory
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
