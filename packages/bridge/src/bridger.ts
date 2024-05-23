import * as ethers from 'ethers';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';
import type { Agent } from '@dfinity/agent';

import { BridgeToken, idMatch, idStrMatch } from './tokens';

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
  protected bridges: Bridges[keyof Bridges][] = [];
  protected tokensBridged: BridgeToken[] = [];

  constructor({ wallet, agent }: BridgerOptions) {
    this.wallet = wallet;
    this.agent = agent;
  }

  connectBitfinityWallet(bitfinityWallet: BitfinityWallet) {
    this.bitfinityWallet = bitfinityWallet;
  }

  protected createBridges() {
    this.tokensBridged.forEach((token) => {
      if (this.bridges.find((bridge) => bridge.idMatch(token))) {
        return;
      }

      if (token.type === 'icrc') {
        if (!this.bitfinityWallet) {
          throw new Error('No IC wallet is connected');
        }

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
      }
    });
  }

  addBridgedTokens(tokens: BridgeToken[]) {
    const addedCount = tokens.reduce((total, t1) => {
      if (this.tokensBridged.find((t2) => idMatch(t1, t2))) {
        return total;
      }

      this.tokensBridged.push(t1);

      return total + 1;
    }, 0);

    this.createBridges();

    return addedCount;
  }

  getBridge<T extends keyof Bridges>(id: string) {
    const token = this.tokensBridged.find((b) => idStrMatch(id, b));

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
