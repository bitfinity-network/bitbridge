import z from 'zod';
import axios from 'axios';
import {
  setupCache,
  buildWebStorage,
  buildMemoryStorage,
  AxiosCacheInstance
} from 'axios-cache-interceptor';

export const BridgeType = z.enum(['icrc_evm', 'btc_evm', 'rune_evm']);
export type BridgeType = z.infer<typeof BridgeType>;

export const BridgeBase = z.object({
  type: BridgeType,
  bftAddress: z.string(),
  feeChargeAddress: z.string(),
  icHost: z.string(),
  ethCain: z.number()
});

export const BridgeIcrc = BridgeBase.extend({
  type: z.literal('icrc_evm').default('icrc_evm'),
  iCRC2MinterCanisterId: z.string()
});
export type BridgeIcrc = z.infer<typeof BridgeIcrc>;

export const BridgeBtc = BridgeBase.extend({
  type: z.literal('btc_evm').default('btc_evm'),
  btcBridgeCanisterId: z.string()
});
export type BridgeBtc = z.infer<typeof BridgeBtc>;

export const BridgeRune = BridgeBase.extend({
  type: z.literal('rune_evm').default('rune_evm'),
  runeBridgeCanisterId: z.string()
});
export type BridgeRune = z.infer<typeof BridgeRune>;

export const Bridge = z.discriminatedUnion('type', [
  BridgeIcrc,
  BridgeBtc,
  BridgeRune
]);

export const BridgeNetwork = z.object({
  name: z.string(),
  bridges: z.array(Bridge)
});
export type BridgeNetwork = z.infer<typeof BridgeNetwork>;

export const BrdidgeNetworkUrl = z.object({
  url: z.string(),
  ttl: z.number().default(3 * 60 * 60 * 1000) // 3 hours
});
export type BrdidgeNetworkUrl = z.infer<typeof BrdidgeNetworkUrl>;

export const FetchRemoteSchema = z.object({
  networks: z.array(BridgeNetwork)
});

export type GetBridgeInfo<T extends BridgeType> = T extends 'icrc_evm'
  ? BridgeIcrc
  : T extends 'btc_evm'
    ? BridgeBtc
    : BridgeRune;

export class Networks {
  protected axios: AxiosCacheInstance;
  protected networks: BridgeNetwork[] = [];

  constructor() {
    const instance = axios.create();
    this.axios = setupCache(instance, {
      storage:
        typeof localStorage !== 'undefined'
          ? buildWebStorage(localStorage, 'axios-cache')
          : buildMemoryStorage()
    });
  }

  add(network: BridgeNetwork) {
    const netIndex = this.networks.findIndex((n) => n.name === network.name);

    if (netIndex !== -1) {
      this.networks[netIndex] = network;
    } else {
      this.networks.push(network);
    }
  }

  get(name: string) {
    const network = this.networks.find((network) => network.name === name);

    if (!network) {
      throw new Error('Network not found');
    }

    return network;
  }

  getBridge<T extends BridgeType>(name: string, type: T): GetBridgeInfo<T> {
    const network = this.get(name);

    const bridge = network.bridges.find((bridge) => bridge.type === type);

    if (!bridge) {
      throw new Error('Bridge not found');
    }

    return bridge as GetBridgeInfo<T>;
  }

  all() {
    return this.networks;
  }

  async fetch(urls: BrdidgeNetworkUrl[]) {
    await Promise.all(
      urls.map(async ({ url, ttl }) => {
        try {
          const response = await this.axios.get(url, {
            cache: { ttl, interpretHeader: true }
          });

          const { networks } = FetchRemoteSchema.parse(response.data);

          networks.forEach((network) => this.add(network));
        } catch (err) {
          console.error(
            `Error fetching tokens url: ${url}`,
            err instanceof z.ZodError ? err.issues : err
          );
        }
      })
    );
  }
}
