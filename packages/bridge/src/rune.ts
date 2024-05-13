import { Actor } from '@dfinity/agent';
import * as ethers from 'ethers';

import { RuneActor } from './ic';
import { EthAddress, Id256Factory } from './validation';
import WrappedTokenABI from './abi/WrappedToken';
import BftBridgeABI from './abi/BFTBridge';
import { wait } from './utils';
import { encodeBtcAddress } from './utils';
import { BFT_ETH_ADDRESS } from './constants';

interface RuneBridgeOptions {
  bftBridge?: ethers.Contract;
  wallet: ethers.Signer;
  runeActor?: typeof RuneActor;
}

export class RuneBridge {
  protected bftBridge: ethers.Contract;
  protected runeActor: typeof RuneActor;
  protected wallet: ethers.Signer;

  constructor({ wallet, runeActor, bftBridge }: RuneBridgeOptions) {
    this.bftBridge = bftBridge || this.getBftBridgeContract();
    this.wallet = wallet;
    this.runeActor = runeActor || RuneActor;
  }

  async getDepositAddress(ethAddress: EthAddress) {
    const result = await this.runeActor.get_deposit_address(ethAddress);

    if (!('Ok' in result)) {
      throw new Error('Err');
    }

    return result.Ok;
  }

  private getBftBridgeContract() {
    return new ethers.Contract(BFT_ETH_ADDRESS, BftBridgeABI, this.wallet);
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

  async getWrappedTokenBalance(address: EthAddress) {
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
  async bridgeBtc(address: EthAddress) {
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
  async bridgeEVMc(address: string, amount: number) {
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
