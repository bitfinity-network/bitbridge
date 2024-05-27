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
  agent: Agent;
}

export class Bridger {
  protected agent: Agent;
  public bridges: Bridges[keyof Bridges][] = [];
  protected tokensBridged: BridgeToken[] = [];

  constructor({ agent }: BridgerOptions) {
    this.agent = agent;
  }

  connectEthWallet(wallet?: ethers.Signer) {
    this.bridges.forEach((bridge) => {
      bridge.connectEthWallet(wallet);
    });
  }

  connectBitfinityWallet(bitfinityWallet?: BitfinityWallet) {
    this.bridges.forEach((bridge) => {
      bridge.connectBitfinityWallet(bitfinityWallet);
    });
  }

  protected createBridge(token: BridgeToken) {
    if (this.bridges.find((bridge) => bridge.idMatch(token))) {
      return;
    }

    if (token.type === 'icrc') {
      this.bridges.push(
        new IcrcBridge({
          agent: this.agent,
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
          agent: this.agent,
          bftAddress: token.bftAddress,
          runeBridgeCanisterId: token.runeBridgeCanisterId,
          wrappedTokenAddress: token.wrappedTokenAddress,
          runeId: token.runeId
        })
      );
    }
  }

  addBridgedTokens(tokens: BridgeToken[]) {
    tokens.forEach((token) => {
      this.createBridge(token);

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
