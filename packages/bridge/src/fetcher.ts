import {
  FetchRemoteSchema,
  FetchUrl,
  FetchUrlLocal,
  FetchUrlRemote,
  remoteUrls
} from './tokens-urls';
import { FetchedToken, id, splitTokens } from './tokens-fetched';
import { BridgeToken, idStrMatch } from './tokens';

export class Fetcher {
  protected tokensFetched: FetchedToken[] = [];

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
    return await this.fetch([FetchUrlLocal.parse({})]);
  }

  async fetchDefault(network: keyof typeof remoteUrls) {
    return await this.fetch([
      FetchUrlRemote.parse({ src: remoteUrls[network] })
    ]);
  }

  removeDeployedTokens(deployed: BridgeToken[]) {
    this.tokensFetched = this.tokensFetched.filter((fetched) => {
      return !deployed.some((token) => idStrMatch(id(fetched), token));
    });
  }

  getTokensAll() {
    const [bridged, toDeploy] = splitTokens(this.tokensFetched);

    return [bridged, toDeploy] as const;
  }
}
