import * as ethers from 'ethers';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';
import type { Agent } from '@dfinity/agent';

import { BridgeToken, idStrMatch } from './tokens';

import { IcrcBridge } from './icrc';
import { RuneBridge } from './rune';
import { BtcBridge } from './btc';

export type Bridges = {
  icrc: IcrcBridge;
  btc: BtcBridge;
  rune: RuneBridge;
};

export interface BridgerOptions {
  wallet: ethers.Signer;
  agent: Agent;
}

export class Bridger {
  protected wallet: ethers.Signer;
  protected bitfinityWallet?: BitfinityWallet;
  protected agent: Agent;
  public bridges: Bridges[keyof Bridges][] = [];
  protected tokensBridged: BridgeToken[] = [];

  constructor({ wallet, agent }: BridgerOptions) {
    this.wallet = wallet;
    this.agent = agent;
  }

  connectBitfinityWallet(bitfinityWallet: BitfinityWallet) {
    this.bitfinityWallet = bitfinityWallet;
  }

  protected createBridge(token: BridgeToken) {
    if (this.bridges.find((bridge) => bridge.idMatch(token))) {
      return false;
    }

    if (token.type === 'icrc' && this.bitfinityWallet) {
      this.bridges.push(
        new IcrcBridge({
          wallet: this.wallet,
          agent: this.agent,
          bitfinityWallet: this.bitfinityWallet,
          bftAddress: token.bftAddress,
          iCRC2MinterCanisterId: token.iCRC2MinterCanisterId,
          baseTokenCanisterId: token.baseTokenCanisterId,
          wrappedTokenAddress: token.wrappedTokenAddress
        })
      );

      return true;
    }

    if (token.type === 'btc') {
      this.bridges.push(
        new BtcBridge({
          wallet: this.wallet,
          agent: this.agent,
          bftAddress: token.bftAddress,
          btcBridgeCanisterId: token.btcBridgeCanisterId,
          wrappedTokenAddress: token.wrappedTokenAddress
        })
      );

      return true;
    }

    if (token.type === 'rune') {
      this.bridges.push(
        new RuneBridge({
          wallet: this.wallet,
          agent: this.agent,
          bftAddress: token.bftAddress,
          runeBridgeCanisterId: token.runeBridgeCanisterId,
          wrappedTokenAddress: token.wrappedTokenAddress,
          runeId: token.runeId
        })
      );

      return true;
    }

    return false;
  }

  addBridgedTokens(tokens: BridgeToken[]) {
    return tokens.reduce((total, token) => {
      const bridgeCreated = this.createBridge(token);

      const isInBridgeTokens = this.tokensBridged.some(
        (t2) => t2.wrappedTokenAddress === token.wrappedTokenAddress
      );

      if (!isInBridgeTokens) {
        this.tokensBridged.push(token);
      }

      return total + (bridgeCreated ? 1 : 0);
    }, 0);
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

  async init() {
    await Promise.all(this.bridges.map((bridge) => bridge.init()));
  }

  async icWhiteList() {
    return (
      await Promise.all(this.bridges.map((bridge) => bridge.icWhitelist()))
    )
      .flat()
      .filter((v, i, a) => a.indexOf(v) === i);
  }
}
