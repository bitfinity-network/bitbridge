import * as ethers from 'ethers';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

import { Bridger, Bridges } from './bridger';
import {
  BridgeBaseToken,
  BridgeBtcToken,
  BridgeIcrcToken,
  BridgeRuneToken,
  BridgeToken
} from './tokens';
import { FetchedToken, splitTokens } from './tokens-fetched';
import { FetchRemoteSchema, FetchUrl, FetchUrlLocal } from './tokens-urls';

import { Deployer } from './deployer';

export interface ConnectorOptions {
  wallet: ethers.Signer;
  bitfinityWallet: BitfinityWallet;
  deployer?: { address: string; deployer: Deployer };
}

export class Connector {
  protected bridger: Bridger;
  protected deployers: Record<string, Deployer> = {};
  protected wallet: ethers.Signer;
  protected bitfinityWallet: BitfinityWallet;
  protected tokensFetched: FetchedToken[] = [];

  private constructor({ wallet, bitfinityWallet, deployer }: ConnectorOptions) {
    this.wallet = wallet;
    this.bitfinityWallet = bitfinityWallet;
    if (deployer) {
      this.deployers[deployer.address] = deployer.deployer;
    }
    this.bridger = new Bridger({ wallet, bitfinityWallet });
  }

  static create(options: ConnectorOptions): Connector {
    return new Connector(options);
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

  protected resetFetchedTokens() {
    this.tokensFetched = [];
  }

  bridge() {
    const [tokens] = splitTokens(this.tokensFetched);

    const addedCount = this.bridger.addBridgedTokens(tokens);

    this.resetFetchedTokens();

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

    const addedCount = this.bridger.addBridgedTokens(bridged.concat(deployed));

    this.resetFetchedTokens();

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
    await this.bridger.init();
  }

  async requestIcConnect(whitelist: string[] = []) {
    await this.bitfinityWallet.requestConnect({
      whitelist: whitelist.concat(await this.bridger.icWhiteList())
    });
  }

  getBridge<T extends keyof Bridges>(id: string) {
    return this.bridger.getBridge<T>(id);
  }

  getBridgedToken(id: string) {
    return this.bridger.getBridgedToken(id);
  }

  getBridgedTokens() {
    return this.bridger.getBridgedTokens();
  }
}
