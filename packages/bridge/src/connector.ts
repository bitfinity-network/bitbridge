import * as ethers from 'ethers';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

import {
  IC_HOST,
  BFT_ETH_ADDRESS,
  BTC_BRIDGE_CANISTER_ID,
  BTC_TOKEN_WRAPPED_ADDRESS,
  RUNE_BRIDGE_CANISTER_ID,
  ICRC2_MINTER_CANISTER_ID,
  ICRC2_TOKEN_CANISTER_ID
} from './constants';

import { IcrcBridge } from './icrc';
import { RuneBridge } from './rune';
import { BtcBridge } from './btc';

export interface Bridges {
  icrc: IcrcBridge;
  btc: BtcBridge;
  rune: RuneBridge;
}

export interface BridgeConfig {
  icrc: {
    iCRC2MinterCanisterId: string;
    baseTokenCanisterId: string;
  };
  btc: {
    btcBridgeCanisterId: string;
    wrappedTokenAddress: string;
  };
  rune: {
    runeBridgeCanisterId: string;
  };
}

export type BridgeNetwork<B extends Partial<Bridges>> = {
  icHost: string;
  bftAddress: string;
} & { [k in keyof B]: BridgeConfig[k extends keyof BridgeConfig ? k : never] };

export interface BridgeOptions<B extends Partial<Bridges>> {
  wallet: ethers.Signer;
  bitfinityWallet: BitfinityWallet;
  network?: BridgeNetwork<B>;
  bridges: (keyof B)[];
}

export class Connector<T extends Partial<Bridges>> {
  bitfinityWallet: BitfinityWallet;
  bridges = {} as T;

  private constructor({
    wallet,
    bitfinityWallet,
    network,
    bridges
  }: BridgeOptions<T>) {
    this.bitfinityWallet = bitfinityWallet;

    if (!network) {
      network = {
        icHost: IC_HOST,
        bftAddress: BFT_ETH_ADDRESS
      } as unknown as typeof network;
    }

    if (!network) {
      throw new Error('Unreachable');
    }

    if (bridges.includes('icrc')) {
      if (!network.icrc) {
        network.icrc = {
          iCRC2MinterCanisterId: ICRC2_MINTER_CANISTER_ID,
          baseTokenCanisterId: ICRC2_TOKEN_CANISTER_ID
        };
      }

      this.bridges.icrc = new IcrcBridge({
        wallet: wallet,
        bitfinityWallet: bitfinityWallet,
        icHost: network.icHost,
        bftAddress: network.bftAddress,
        iCRC2MinterCanisterId: network.icrc.iCRC2MinterCanisterId,
        baseTokenCanisterId: network.icrc.baseTokenCanisterId
      });
    }

    if (bridges.includes('btc')) {
      if (!network.btc) {
        network.btc = {
          wrappedTokenAddress: BTC_TOKEN_WRAPPED_ADDRESS,
          btcBridgeCanisterId: BTC_BRIDGE_CANISTER_ID
        };
      }

      this.bridges.btc = new BtcBridge({
        wallet: wallet,
        bitfinityWallet: bitfinityWallet,
        icHost: network.icHost,
        bftAddress: network.bftAddress,
        btcBridgeCanisterId: network.btc.btcBridgeCanisterId,
        wrappedTokenAddress: network.btc.wrappedTokenAddress
      });
    }

    if (bridges.includes('rune')) {
      if (!network.rune) {
        network.rune = {
          runeBridgeCanisterId: RUNE_BRIDGE_CANISTER_ID
        };
      }

      this.bridges.rune = new RuneBridge({
        wallet: wallet,
        bitfinityWallet: bitfinityWallet,
        icHost: network.icHost,
        bftAddress: network.bftAddress,
        runeBridgeCanisterId: network.rune.runeBridgeCanisterId
      });
    }
  }

  static create<K extends keyof Bridges>(
    options: BridgeOptions<Pick<Bridges, K>>
  ): Connector<Pick<Bridges, K>> {
    return new Connector(options);
  }

  async init() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, bridge] of Object.entries(this.bridges)) {
      await bridge.init();
    }
  }

  async requestIcConnect() {
    const whitelist = (
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(this.bridges).map(([_, bridge]) => {
          return bridge.icWhitelist();
        })
      )
    ).flat();

    await this.bitfinityWallet.requestConnect({ whitelist });
  }

  getBridge<K extends keyof T>(type: K): T[K] {
    return this.bridges[type];
  }
}
