import * as ethers from 'ethers';

import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

import {
  BridgeNetwork,
  BridgeType,
  Networks,
  BrdidgeNetworkUrl
} from './network';
import { Bridger, GetBridge } from './bridger';

export class Connector {
  protected wallet?: ethers.Signer;
  protected bitfinityWallet?: BitfinityWallet;
  protected bridger: Bridger;
  protected networks: Networks;

  private constructor() {
    this.networks = new Networks();
    this.bridger = new Bridger({ networks: this.networks });
  }

  addNetwork(network: BridgeNetwork) {
    this.networks.add(network);
    this.bridger.createBridges();
  }

  addNetworks(networks: BridgeNetwork[]) {
    networks.forEach((network) => this.addNetwork(network));
  }

  getNetworks() {
    return this.networks.all();
  }

  async fetch(urls: BrdidgeNetworkUrl[]) {
    await this.networks.fetch(urls);
    this.bridger.createBridges();
  }

  connectEthWallet(wallet: ethers.Signer) {
    this.wallet = wallet;
    this.bridger.connectEthWallet(wallet);
  }

  disconnectEthWallet() {
    this.wallet = undefined;
    this.bridger.connectEthWallet(undefined);
  }

  connectBitfinityWallet(bitfinityWallet: BitfinityWallet) {
    this.bitfinityWallet = bitfinityWallet;
    this.bridger.connectBitfinityWallet(bitfinityWallet);
  }

  disconnectBitfinityWallet() {
    this.bitfinityWallet = undefined;
    this.bridger.connectBitfinityWallet(undefined);
  }

  static create(): Connector {
    return new Connector();
  }

  icWhiteList() {
    return this.bridger.icWhiteList();
  }

  getBridge<T extends BridgeType>(netName: string, type: T): GetBridge<T> {
    return this.bridger.getBridge<T>(netName, type);
  }
}
