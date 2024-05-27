import * as ethers from 'ethers';
import { Id256Factory } from '@bitfinity-network/id256';
import type { Agent } from '@dfinity/agent';

import { RuneActor, createRuneBridgeActor } from './ic';
import WrappedTokenABI from './abi/WrappedToken';
import { wait } from './utils';
import { encodeBtcAddress } from './utils';
import BFTBridgeABI from './abi/BFTBridge';
import { Bridge } from './bridge';
import { BridgeToken } from './tokens';

interface RuneBridgeOptions {
  agent: Agent;
  bftAddress: string;
  wrappedTokenAddress: string;
  runeBridgeCanisterId: string;
  runeId: string;
}

export class RuneBridge implements Bridge {
  protected agent: Agent;
  protected bftAddress: string;
  protected runeBridgeCanisterId: string;
  protected wrappedTokenAddress: string;
  protected runeId: string;
  protected walletActors: {
    wallet?: ethers.Signer;
    runeActor?: typeof RuneActor;
  } = {};
  protected eth: {
    bftBridge?: ethers.Contract;
  } = {};

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

  connectEthWallet(wallet?: ethers.Signer) {
    this.walletActors.wallet = wallet;
    this.eth = {};
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
    if (!this.eth.bftBridge) {
      this.eth.bftBridge = new ethers.Contract(
        this.bftAddress,
        BFTBridgeABI,
        this.wallet
      );
    }

    return this.eth.bftBridge;
  }

  async getDepositAddress(ethAddress: string) {
    const result = await this.runeActor.get_deposit_address(ethAddress);

    if (!('Ok' in result)) {
      throw new Error('Err');
    }

    return result.Ok;
  }

  private async getWrappedTokenContract() {
    const address = await this.getWrappedTokenEthAddress();

    return new ethers.Contract(address, WrappedTokenABI, this.wallet);
  }

  async getWrappedTokenEthAddress(): Promise<string> {
    const [b, t] = this.runeId.split(':');

    return await this.bftBridge.getWrappedToken(
      Id256Factory.fromBtcTxIndex(BigInt(b), parseInt(t, 10))
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
      await this.bftBridge.getAddress(),
      amount
    );
    await approveTx.wait(2);

    const tokenAddress = await this.getWrappedTokenEthAddress();

    const burnTx = await this.bftBridge.burn(
      amount,
      tokenAddress,
      `0x${encodeBtcAddress(address)}`
    );
    await burnTx.wait(2);
  }

  async getRunesBalance(address: string) {
    return await this.runeActor.get_rune_balances(address);
  }
}
