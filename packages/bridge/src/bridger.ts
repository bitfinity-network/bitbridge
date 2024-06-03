import * as ethers from 'ethers';
import type { Agent } from '@dfinity/agent';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';
import { BridgeToken, idStrMatch } from '@bitfinity-network/bridge-tokens';
import { Bft } from '@bitfinity-network/bridge-bft';

import { IcrcBridge } from './icrc';
import { RuneBridge } from './rune';
import { BtcBridge } from './btc';

export type Bridges = {
  icrc: IcrcBridge;
  btc: BtcBridge;
  rune: RuneBridge;
};

export interface BridgerOptions {
  agent: Agent;
}

export class Bridger {
  protected agent: Agent;
  protected wallet?: ethers.Signer
  protected bridges: Bridges[keyof Bridges][] = [];
  protected tokensBridged: BridgeToken[] = [];
  protected bfts: Record<string, Bft> = {};

  constructor({ agent }: BridgerOptions) {
    this.agent = agent;
  }

  connectEthWallet(wallet?: ethers.Signer) {
    this.wallet = wallet;
    this.bridges.forEach((bridge) => {
      bridge.connectEthWallet(wallet, this.getBft(bridge.bftAddress));
    });
  }

  connectBitfinityWallet(bitfinityWallet?: BitfinityWallet) {
    this.bridges.forEach((bridge) => {
      bridge.connectBitfinityWallet(bitfinityWallet);
    });
  }

  getBft(bftAddress: string) {
    if (!this.wallet) {
      this.bfts = {};
      return undefined;
    }

    if (this.bfts[bftAddress]) {
      return this.bfts[bftAddress];
    }

    const bft = new Bft({
      bftAddress: bftAddress,
      wallet: this.wallet
    });

    this.bfts[bftAddress] = bft;

    return bft;
  }

  protected createBridge(
    token: BridgeToken,
    wallet?: ethers.Signer,
    bitfinityWallet?: BitfinityWallet
  ) {
    let bridge = this.bridges.find((bridge) => bridge.idMatch(token));

    if (!bridge) {
      if (token.type === 'icrc') {
        bridge = new IcrcBridge({
          agent: this.agent,
          bftAddress: token.bftAddress,
          iCRC2MinterCanisterId: token.iCRC2MinterCanisterId,
          baseTokenCanisterId: token.baseTokenCanisterId,
          wrappedTokenAddress: token.wrappedTokenAddress
        });

        this.bridges.push(bridge);
      }

      if (token.type === 'btc') {
        bridge = new BtcBridge({
          agent: this.agent,
          bftAddress: token.bftAddress,
          btcBridgeCanisterId: token.btcBridgeCanisterId,
          wrappedTokenAddress: token.wrappedTokenAddress
        });

        this.bridges.push(bridge);
      }

      if (token.type === 'rune') {
        bridge = new RuneBridge({
          agent: this.agent,
          bftAddress: token.bftAddress,
          runeBridgeCanisterId: token.runeBridgeCanisterId,
          wrappedTokenAddress: token.wrappedTokenAddress,
          runeId: token.runeId
        });

        this.bridges.push(bridge);
      }
    }

    bridge?.connectEthWallet(wallet, this.getBft(bridge?.bftAddress));
    bridge?.connectBitfinityWallet(bitfinityWallet);
  }

  addBridgedTokens(
    tokens: BridgeToken[],
    wallet?: ethers.Signer,
    bitfinityWallet?: BitfinityWallet
  ) {
    tokens.forEach((token) => {
      this.createBridge(token, wallet, bitfinityWallet);

      const isInBridgeTokens = this.tokensBridged.some(
        (t2) => t2.wrappedTokenAddress === token.wrappedTokenAddress
      );

      if (!isInBridgeTokens) {
        this.tokensBridged.push(token);
      }
    });
  }

  isBridge(id: string) {
    const token = this.getBridgedToken(id);

    if (!token) {
      return false;
    }

    return !!this.bridges.find((bridge) => bridge.idMatch(token));
  }

  getBridge<T extends keyof Bridges>(id: string) {
    const token = this.getBridgedToken(id);

    if (!token) {
      throw new Error('Bridge not found');
    }

    const bridge = this.bridges.find((bridge) => bridge.idMatch(token)) as
      | Bridges[T]
      | undefined;

    if (!bridge) {
      throw new Error('Bridge not found');
    }

    return bridge;
  }

  getBridgedToken(id: string) {
    return this.tokensBridged.find((token) => idStrMatch(id, token));
  }

  getBridgedTokens() {
    return this.tokensBridged;
  }

  icWhiteList() {
    return this.bridges
      .map((bridge) => bridge.icWhitelist())
      .flat()
      .filter((v, i, a) => a.indexOf(v) === i);
  }
}
