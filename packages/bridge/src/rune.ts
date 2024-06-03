import * as ethers from 'ethers';
import type { Agent } from '@dfinity/agent';
import { BridgeToken } from '@bitfinity-network/bridge-tokens';
import { Bft } from '@bitfinity-network/bridge-bft';

import { RuneActor, createRuneBridgeActor } from './ic';
import WrappedTokenABI from './abi/WrappedToken';
import { wait } from './utils';
import { Bridge } from './bridge';

interface RuneBridgeOptions {
  agent: Agent;
  bftAddress: string;
  wrappedTokenAddress: string;
  runeBridgeCanisterId: string;
  runeId: string;
}

export class RuneBridge implements Bridge {
  protected agent: Agent;
  protected runeBridgeCanisterId: string;
  protected wrappedTokenAddress: string;
  protected runeId: string;
  protected walletActors: {
    wallet?: ethers.Signer;
    runeActor?: typeof RuneActor;
  } = {};
  protected eth: {
    bft?: Bft;
  } = {};
  readonly bftAddress: string;

  constructor({
    agent,
    bftAddress,
    wrappedTokenAddress,
    runeBridgeCanisterId,
    runeId
  }: RuneBridgeOptions) {
    this.agent = agent;
    this.wrappedTokenAddress = wrappedTokenAddress;
    this.runeBridgeCanisterId = runeBridgeCanisterId;
    this.runeId = runeId;
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
    return [this.runeBridgeCanisterId];
  }

  get wallet() {
    if (!this.walletActors.wallet) {
      throw new Error('ETH wallet not connected yet');
    }

    return this.walletActors.wallet;
  }

  get runeActor() {
    if (!this.walletActors.runeActor) {
      this.walletActors.runeActor = createRuneBridgeActor(
        this.runeBridgeCanisterId,
        { agent: this.agent }
      );
    }

    return this.walletActors.runeActor;
  }

  get bftBridge() {
    if (!this.eth.bft) {
      throw new Error('Bft not connected yet');
    }

    return this.eth.bft;
  }

  async getDepositAddress(ethAddress: string) {
    const result = await this.runeActor.get_deposit_address(ethAddress);

    if (!('Ok' in result)) {
      throw new Error('Err');
    }

    return result.Ok;
  }

  private async getWrappedTokenContract() {
    return new ethers.Contract(
      this.wrappedTokenAddress,
      WrappedTokenABI,
      this.wallet
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

    const approveTx = await wrappedTokenContract.approve(
      this.bftBridge.address,
      amount
    );
    await approveTx.wait(2);

    await this.bftBridge.burn(
      address,
      this.wrappedTokenAddress,
      BigInt(amount)
    );
  }

  async getRunesBalance(address: string) {
    return await this.runeActor.get_rune_balances(address);
  }
}
