import * as ethers from 'ethers';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

import { Bridger, Bridges } from './bridger';
import {
  BridgeBaseToken,
  BridgeIcrcToken,
  BridgeRuneToken,
  BridgeToken
} from './tokens';
import { FetchUrl, remoteUrls } from './tokens-urls';
import { Deployer } from './deployer';
import { Fetcher } from './fetcher';

export interface ConnectorOptions {
  wallet: ethers.Signer;
  bitfinityWallet: BitfinityWallet;
  deployer?: { address: string; deployer: Deployer };
}

export class Connector {
  protected wallet: ethers.Signer;
  protected bitfinityWallet: BitfinityWallet;
  protected bridger: Bridger;
  protected fetcher: Fetcher;
  protected deployers: Record<string, Deployer> = {};

  private constructor({ wallet, bitfinityWallet, deployer }: ConnectorOptions) {
    this.wallet = wallet;
    this.bitfinityWallet = bitfinityWallet;
    if (deployer) {
      this.deployers[deployer.address] = deployer.deployer;
    }
    this.fetcher = new Fetcher();
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

  bridge() {
    const tokens = this.fetcher.getTokensBridged();

    return this.bridger.addBridgedTokens(tokens);
  }

  async bridgeAfterDeploy() {
    const [bridged, toDeploy] = this.fetcher.getTokensAll();

    const deployed: BridgeToken[] = (
      await Promise.all(
        toDeploy.map(async (token) => {
          if (token.type === 'btc') {
            return undefined!;
          }

          const id =
            'baseTokenCanisterId' in token
              ? token.baseTokenCanisterId
              : 'runeId' in token
                ? token.runeId
                : '';

          if (this.bridger.getBridgedToken(id)) {
            return undefined!;
          }

          const deployer = this.getDeployer(token.bftAddress);

          const baseToken = BridgeBaseToken.parse(token);

          if (token.type === 'icrc') {
            const wrappedAddress = await deployer.deployIcrcWrappedToken(
              token.baseTokenCanisterId,
              token.name,
              token.symbol
            );

            return {
              ...baseToken,
              type: 'icrc',
              baseTokenCanisterId: token.baseTokenCanisterId,
              iCRC2MinterCanisterId: token.iCRC2MinterCanisterId,
              wrappedTokenAddress: wrappedAddress
            } satisfies BridgeIcrcToken;
          } else {
            const wrappedAddress = await deployer.deployRuneWrappedToken(
              token.runeId,
              token.name
            );

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

    return this.bridger.addBridgedTokens(bridged.concat(deployed));
  }

  async fetch(tokensUrls: FetchUrl[]) {
    return await this.fetcher.fetch(tokensUrls);
  }

  async fetchLocal() {
    return await this.fetcher.fetchLocal();
  }

  async fetchDefault(network: keyof typeof remoteUrls) {
    return await this.fetcher.fetchDefault(network);
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
