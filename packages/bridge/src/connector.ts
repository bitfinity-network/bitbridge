import * as ethers from 'ethers';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';
import { Agent } from '@dfinity/agent';

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
  agent: Agent;
  deployer?: { address: string; deployer: Deployer };
}

export class Connector {
  protected wallet?: ethers.Signer;
  protected bridger: Bridger;
  protected fetcher: Fetcher;
  protected deployers: Record<string, Deployer> = {};

  private constructor({ agent }: ConnectorOptions) {
    this.fetcher = new Fetcher();
    this.bridger = new Bridger({ agent });
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
    this.bridger.connectBitfinityWallet(bitfinityWallet);
  }

  disconnectBitfinityWallet() {
    this.bridger.connectBitfinityWallet(undefined);
  }

  static create(options: ConnectorOptions): Connector {
    return new Connector(options);
  }

  protected getDeployer(bftAddress: string) {
    if (!this.wallet) {
      this.deployers = {};
      return undefined;
    }

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

  async bridge() {
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

          if (this.bridger.isBridge(id)) {
            return undefined!;
          }

          const prevDeployed = this.getBridgedToken(id);

          if (prevDeployed) {
            return prevDeployed;
          }

          const deployer = this.getDeployer(token.bftAddress);

          if (!deployer) {
            return undefined!;
          }

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

    const deployedTokens = bridged.concat(deployed)

    this.bridger.addBridgedTokens(deployedTokens);
    this.fetcher.removeDeployedTokens(deployedTokens);

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

  icWhiteList() {
    return this.bridger.icWhiteList();
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
