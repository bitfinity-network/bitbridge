import { Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Wallets } from '@bitfinity-network/bridge-bft';

import {
  Bridge,
  BridgeFromEvmc,
  BridgeToEvmc,
  DeployWrappedToken
} from './bridge';
import { BtcActor, BtcBridgeIdlFactory } from './ic';
import { ethAddrToSubaccount } from './utils';
import { Networks } from './network';

interface BtcBridgeOptions {
  wallets: Wallets;
  network: string;
  networks: Networks;
}

export class BtcBridge implements Bridge {
  protected wallets: Wallets;
  protected networkName: string;
  protected networks: Networks;

  constructor({ network, wallets, networks }: BtcBridgeOptions) {
    this.networkName = network;
    this.networks = networks;
    this.wallets = wallets;
  }

  protected get icHost() {
    return this.networks.get(this.networkName).icHost;
  }

  protected get network() {
    return this.networks.getBridge(this.networkName, 'btc_evm');
  }

  get btcActor(): BtcActor {
    return this.wallets.getActor(
      this.icHost,
      this.network.btcBridgeCanisterId,
      BtcBridgeIdlFactory
    );
  }

  protected get bftBridge() {
    return this.wallets.getBft(this.network.bftAddress);
  }

  icWhitelist() {
    return [this.network.btcBridgeCanisterId];
  }

  async getTokensPairs() {
    return await this.bftBridge.getRuneTokensPairs();
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

  async deployWrappedToken({ id, name }: DeployWrappedToken) {
    return await this.bftBridge.deployRuneWrappedToken(id, name);
  }

  async getDepositAddress(recipient: string) {
    const btcAddress = await this.btcActor.get_btc_address({
      owner: [Principal.fromText(Actor.canisterIdOf(this.btcActor).toText())],
      subaccount: [ethAddrToSubaccount(recipient)]
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
  async bridgeToEvmc({ recipient }: BridgeToEvmc) {
    return await this.btcActor.btc_to_erc20(recipient);
  }

  async bridgeFromEvmc({ wrappedToken, recipient, amount }: BridgeFromEvmc) {
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
