import * as ethers from 'ethers';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';
import { Wallets } from '@bitfinity-network/bridge-bft';

import { BridgeType, BridgeNetwork, Networks } from './network';
import { IcrcBridge } from './icrc';
import { RuneBridge } from './rune';
import { BtcBridge } from './btc';

export type BridgeClass = IcrcBridge | BtcBridge | RuneBridge;

export type GetBridge<T extends BridgeType> = T extends 'icrc_evm'
  ? IcrcBridge
  : T extends 'btc_evm'
    ? BtcBridge
    : RuneBridge;

export interface BridgerOptions {
  networks: Networks;
}

export class Bridger {
  protected networks: Networks;
  protected bridges: Record<string, BridgeClass[]> = {};
  protected wallets: Wallets;

  constructor({ networks }: BridgerOptions) {
    this.networks = networks;
    this.wallets = new Wallets();
  }

  connectEthWallet(wallet?: ethers.Signer) {
    this.wallets.connectEthWallet(wallet);
  }

  connectBitfinityWallet(bitfinityWallet?: BitfinityWallet) {
    this.wallets.connectBitfinityWallet(bitfinityWallet);
  }

  protected createBridge(network: BridgeNetwork) {
    if (this.bridges[network.name]) {
      return;
    }

    this.bridges[network.name] = [];

    network.bridges.forEach((netBridge) => {
      let bridge;

      if (netBridge.type === 'icrc_evm') {
        bridge = new IcrcBridge({
          network: network.name,
          networks: this.networks,
          wallets: this.wallets
        });
      } else if (netBridge.type === 'btc_evm') {
        bridge = new BtcBridge({
          network: network.name,
          networks: this.networks,
          wallets: this.wallets
        });
      } else if (netBridge.type === 'rune_evm') {
        bridge = new RuneBridge({
          network: network.name,
          networks: this.networks,
          wallets: this.wallets
        });
      }

      if (bridge) {
        this.bridges[network.name].push(bridge);
      }
    });
  }

  createBridges() {
    this.networks.all().forEach((network) => this.createBridge(network));
  }

  getBridge<T extends BridgeType>(netName: string, type: T): GetBridge<T> {
    const network = Object.entries(this.bridges).find(
      ([name]) => name === netName
    );

    if (!network) {
      throw new Error('Bridge not found');
    }

    const bridge = network[1].find((bridge) => {
      if (type === 'icrc_evm') {
        return bridge instanceof IcrcBridge;
      } else if (type === 'btc_evm') {
        return bridge instanceof BtcBridge;
      } else if (type === 'rune_evm') {
        return bridge instanceof RuneBridge;
      } else {
        throw new Error('Unknown bridge type');
      }
    });

    if (!bridge) {
      throw new Error('Bridge not found');
    }

    return bridge as GetBridge<T>;
  }

  icWhiteList() {
    return Object.entries(this.bridges)
      .map(([, bridges]) => {
        return bridges.map((bridge) => bridge.icWhitelist());
      })
      .flat(2)
      .filter((v, i, a) => a.indexOf(v) === i);
  }
}
