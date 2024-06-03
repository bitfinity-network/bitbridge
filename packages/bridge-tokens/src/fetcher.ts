import {
  FetchRemoteSchema,
  FetchUrl,
  FetchUrlRemote,
  remoteUrls
} from './tokens-urls';
import { DeployedToken, FetchedToken, id } from './tokens-fetched';
import { BridgeToken, idStrMatch } from './tokens';

export class Fetcher {
  protected tokensFetched: FetchedToken[] = [];

  protected splitTokens(
    tokens: FetchedToken[]
  ): [BridgeToken[], DeployedToken[]] {
    const bridged: BridgeToken[] = [];
    const deployed: DeployedToken[] = [];

    tokens.forEach((token) => {
      if (token.type === 'icrc' && 'wrappedTokenAddress' in token) {
        bridged.push(token);
      } else if (token.type === 'btc' && 'wrappedTokenAddress' in token) {
        bridged.push(token);
      } else if (token.type === 'rune' && 'wrappedTokenAddress' in token) {
        bridged.push(token);
      } else if (token.type === 'icrc' && 'symbol' in token) {
        deployed.push(token);
      } else if (token.type === 'rune' && 'name' in token) {
        deployed.push(token);
      }
    });

    return [bridged, deployed];
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

  async fetchDefault(network: keyof typeof remoteUrls) {
    return await this.fetch([
      FetchUrlRemote.parse({ src: remoteUrls[network] })
    ]);
  }

  removeDeployedTokens(deployed: BridgeToken[]) {
    if (!deployed.length) {
      return;
    }

    this.tokensFetched = this.tokensFetched.filter((fetched) => {
      return !deployed.some((token) => idStrMatch(id(fetched), token));
    });
  }

  getTokensAll() {
    const [bridged, toDeploy] = this.splitTokens(this.tokensFetched);

    return [bridged, toDeploy] as const;
  }
}
