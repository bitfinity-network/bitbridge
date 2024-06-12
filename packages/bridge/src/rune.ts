import { Wallets } from '@bitfinity-network/bridge-bft';

import { RuneActor, RuneBridgeIdlFactory } from './ic';
import {
  Bridge,
  BridgeFromEvmc,
  BridgeToEvmc,
  DeployWrappedToken
} from './bridge';
import { Networks } from './network';
import { wait } from './utils';

interface RuneBridgeOptions {
  wallets: Wallets;
  network: string;
  networks: Networks;
}

export class RuneBridge implements Bridge {
  protected wallets: Wallets;
  protected networkName: string;
  protected networks: Networks;

  constructor({ network, wallets, networks }: RuneBridgeOptions) {
    this.networkName = network;
    this.networks = networks;
    this.wallets = wallets;
  }

  protected get network() {
    return this.networks.getBridge(this.networkName, 'rune_evm');
  }

  protected get runeActor(): RuneActor {
    return this.wallets.getActor(
      this.network.icHost,
      this.network.runeBridgeCanisterId,
      RuneBridgeIdlFactory
    );
  }

  protected get bftBridge() {
    return this.wallets.getBft(this.network.bftAddress);
  }

  icWhitelist() {
    return [this.network.runeBridgeCanisterId];
  }

  async getTokensPairs() {
    return await this.bftBridge.getRuneTokensPairs();
  }

  async deployWrappedToken({ id, name }: DeployWrappedToken) {
    return await this.bftBridge.deployRuneWrappedToken(id, name);
  }

  async getDepositAddress(recipient: string) {
    const result = this.runeActor.get_deposit_address(recipient);

    if (!('Ok' in result)) {
      throw new Error('Err');
    }

    return result.Ok;
  }

  async getBaseTokenBalance() {
    return 0n;
  }

  async getWrappedTokenInfo(wrapped: string) {
    return await this.wallets.getWrappedTokenInfo(wrapped);
  }

  async getWrappedTokenBalance(
    wrapped: string,
    address: string
  ): Promise<bigint> {
    return await this.wallets.getWrappedTokenBalance(wrapped, address);
  }

  /**
   *  After you sent the Rune to the address returned
   *  by getDepositAddress, this function will bridge
   *  tokens to EVM.
   *
   * @param recipient - ETH receiver address of the bridged tokens
   */
  async bridgeToEvmc({ recipient }: Pick<BridgeToEvmc, 'recipient'>) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await this.runeActor.deposit(recipient!);

      if ('Ok' in result) {
        return result.Ok;
      }

      await wait(7000);
    }
  }

  /**
   * Will bridge the amount of rune tokens to the given BTC address.
   *
   */
  async bridgeFromEvmc({ wrappedToken, amount, recipient }: BridgeFromEvmc) {
    const wrappedTokenContract =
      this.wallets.getWrappedTokenContract(wrappedToken);

    const approveTx = await wrappedTokenContract.approve(
      this.network.bftAddress,
      amount
    );
    await approveTx.wait(2);

    await this.bftBridge.burn(recipient, wrappedToken, BigInt(amount));
  }
}
