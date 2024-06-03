import * as ethers from 'ethers';

import { Agent } from '@dfinity/agent';

import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';
import {
  BridgeBaseToken,
  BridgeIcrcToken,
  BridgeRuneToken,
  BridgeToken,
  FetchUrl,
  remoteUrls,
  Fetcher
} from '@bitfinity-network/bridge-tokens';

import { Bridger, Bridges } from './bridger';

import { wait } from './utils';
import { defaultLocalUrl } from './tokens';

export interface ConnectorOptions {
  agent: Agent;
}

export class Connector {
  protected wallet?: ethers.Signer;
  protected bitfinityWallet?: BitfinityWallet;
  protected bridger: Bridger;
  protected fetcher: Fetcher;

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
    this.bitfinityWallet = bitfinityWallet;
    this.bridger.connectBitfinityWallet(bitfinityWallet);
  }

  disconnectBitfinityWallet() {
    this.bitfinityWallet = undefined;
    this.bridger.connectBitfinityWallet(undefined);
  }

  static create(options: ConnectorOptions): Connector {
    return new Connector(options);
  }

  async bridge() {
    const [bridged, toDeploy] = this.fetcher.getTokensAll();

    const deployed: BridgeToken[] = [];

    for (const token of toDeploy) {
      if (token.type === 'btc') {
        continue;
      }

      const id =
        'baseTokenCanisterId' in token
          ? token.baseTokenCanisterId
          : 'runeId' in token
            ? token.runeId
            : '';

      if (this.bridger.isBridge(id)) {
        continue;
      }

      const prevDeployed = this.getBridgedToken(id);

      if (prevDeployed) {
        deployed.push(prevDeployed);
        continue;
      }

      const bft = this.bridger.getBft(token.bftAddress);

      if (!bft) {
        continue;
      }

      const baseToken = BridgeBaseToken.parse(token);

      if (token.type === 'icrc') {
        const wrappedAddress = await bft.deployIcrcWrappedToken(
          token.baseTokenCanisterId,
          token.name,
          token.symbol
        );

        deployed.push({
          ...baseToken,
          type: 'icrc',
          baseTokenCanisterId: token.baseTokenCanisterId,
          iCRC2MinterCanisterId: token.iCRC2MinterCanisterId,
          wrappedTokenAddress: wrappedAddress
        } satisfies BridgeIcrcToken);
      } else {
        const wrappedAddress = await bft.deployRuneWrappedToken(
          token.runeId,
          token.name
        );

        deployed.push({
          ...baseToken,
          type: 'rune',
          runeId: token.runeId,
          runeBridgeCanisterId: token.runeBridgeCanisterId,
          wrappedTokenAddress: wrappedAddress
        } satisfies BridgeRuneToken);
      }

      await wait(250);
    }

    const deployedTokens = bridged.concat(deployed);

    this.bridger.addBridgedTokens(
      deployedTokens,
      this.wallet,
      this.bitfinityWallet
    );
    this.fetcher.removeDeployedTokens(deployedTokens);

    return this.fetcher.getTokensAll().flat().length === 0;
  }

  async fetch(tokensUrls: FetchUrl[]) {
    return await this.fetcher.fetch(tokensUrls);
  }

  async fetchLocal() {
    return await this.fetch([defaultLocalUrl]);
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
