import * as ethers from 'ethers';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

import {
  BridgeBaseToken,
  BridgeBtcToken,
  BridgeIcrcToken,
  BridgeRuneToken,
  BridgeToken,
  idMatch,
  idStrMatch
} from './tokens';
import { FetchedToken, splitTokens } from './tokens-fetched';
import { FetchRemoteSchema, FetchUrl, FetchUrlLocal } from './tokens-urls';

import { IcrcBridge } from './icrc';
import { RuneBridge } from './rune';
import { BtcBridge } from './btc';
import { Deployer } from './deployer';

export type Bridges = {
  icrc: IcrcBridge;
  btc: BtcBridge;
  rune: RuneBridge;
};

export interface BridgeOptions {
  wallet: ethers.Signer;
  bitfinityWallet: BitfinityWallet;
  deployer?: { address: string; deployer: Deployer };
}

export class Connector {
  protected deployers: Record<string, Deployer> = {};
  protected wallet: ethers.Signer;
  protected bitfinityWallet: BitfinityWallet;
  protected bridges: Bridges[keyof Bridges][] = [];
  protected tokensBridged: BridgeToken[] = [];
  protected tokensFetched: FetchedToken[] = [];

  private constructor({ wallet, bitfinityWallet, deployer }: BridgeOptions) {
    this.wallet = wallet;
    this.bitfinityWallet = bitfinityWallet;
    if (deployer) {
      this.deployers[deployer.address] = deployer.deployer;
    }
  }

  static create(options: BridgeOptions): Connector {
    return new Connector(options);
  }

  protected createBridges() {
    this.tokensBridged.forEach((token) => {
      if (this.bridges.find((bridge) => bridge.idMatch(token))) {
        return;
      }

      if (token.type === 'icrc') {
        this.bridges.push(
          new IcrcBridge({
            wallet: this.wallet,
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
            bitfinityWallet: this.bitfinityWallet,
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
            bitfinityWallet: this.bitfinityWallet,
            bftAddress: token.bftAddress,
            runeBridgeCanisterId: token.runeBridgeCanisterId
          })
        );
      }
    });
  }

  protected getDeployer(bftAddress: string) {
    if (this.deployers[bftAddress]) {
      return this.deployers[bftAddress];
    }

    const deployer = new Deployer({
      bftAddress: bftAddress,
      wallet: this.wallet
    });

    this.deployers[bftAddress] = deployer;

    return deployer;
  }

  protected addBridgedTokens(tokens: BridgeToken[]) {
    return tokens.reduce((total, t1) => {
      if (this.tokensBridged.find((t2) => idMatch(t1, t2))) {
        return total;
      }

      this.tokensBridged.push(t1);

      return total + 1;
    }, 0);
  }

  protected resetFetchedTokens() {
    this.tokensFetched = [];
  }

  bridge() {
    const [tokens] = splitTokens(this.tokensFetched);

    const addedCount = this.addBridgedTokens(tokens);

    this.resetFetchedTokens();

    this.createBridges();

    return addedCount;
  }

  async bridgeAfterDeploy() {
    const [bridged, toBeDeployed] = splitTokens(this.tokensFetched);

    const deployed: BridgeToken[] = (
      await Promise.all(
        toBeDeployed.map(async (token) => {
          if (token.type === 'btc') {
            return undefined!;
          }

          const deployer = this.getDeployer(token.bftAddress);

          const wrappedAddress = await deployer.deployBftWrappedToken(
            'baseTokenCanisterId' in token ? token.baseTokenCanisterId : '', // todo: RUNE! !!!
            token.name,
            token.symbol
          );

          const baseToken = BridgeBaseToken.parse(token);

          if (token.type === 'icrc') {
            return {
              ...baseToken,
              type: 'icrc',
              baseTokenCanisterId: token.baseTokenCanisterId,
              iCRC2MinterCanisterId: token.iCRC2MinterCanisterId,
              wrappedTokenAddress: wrappedAddress
            } satisfies BridgeIcrcToken;
          } else {
            return {
              ...baseToken,
              type: 'rune',
              runeId: token.runeId,
              runeBridgeCanisterId: token.runeBridgeCanisterId,
              wrappedTokenAddress: wrappedAddress
            } satisfies BridgeRuneToken;
          }
        })
      )
    ).filter((token) => !!token);

    const addedCount = this.addBridgedTokens(bridged.concat(deployed));

    this.resetFetchedTokens();

    this.createBridges();

    return addedCount;
  }

  async fetch(tokensUrls: FetchUrl[]) {
    const tokens: FetchedToken[] = (
      await Promise.all(
        tokensUrls.map(async (url) => {
          url = FetchUrl.parse(url);

          if (url.type === 'local') {
            return url.tokens;
          }

          try {
            const response = await fetch(url.src);

            const json = await response.json();

            return FetchRemoteSchema.parse(json).tokens;
          } catch (err) {
            console.error('Error fetching tokens url', err);
          }

          return [];
        })
      )
    ).flat();

    this.tokensFetched = this.tokensFetched.concat(tokens);

    return tokens.length;
  }

  async fetchLocal() {
    return await this.fetch([FetchUrlLocal.parse({ type: 'local' })]);
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

  async requestIcConnect(whitelist: string[] = []) {
    await this.bitfinityWallet.requestConnect({
      whitelist: whitelist.concat(await this.icWhiteList())
    });
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
}
