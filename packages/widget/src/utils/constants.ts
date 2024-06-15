import z from 'zod';
import { BrdidgeNetworkUrl } from '@bitfinity-network/bridge';
import { Chain } from '@rainbow-me/rainbowkit';

import { ListsUrl } from '../provider/TokensListsProvider.tsx';

export const BITFINITY_INSTALLATION_URL =
  'https://chrome.google.com/webstore/detail/bitfinity-wallet/jnldfbidonfeldmalbflbmlebbipcnle?hl=kk';

export const IS_DEV = z.coerce.boolean().default(false).parse(process.env.IS_DEV);

const NETWORK_URLS_BASE = IS_DEV
  ? ''
  : 'https://raw.githubusercontent.com/infinity-swap/token-lists/main/src/';

export const NETWORK_URLS: BrdidgeNetworkUrl[] = [
  BrdidgeNetworkUrl.parse({
    url: `${NETWORK_URLS_BASE}/networks.json`,
    ttl: IS_DEV ? 0 : undefined
  })
];

const TOKENS_URL_BASE =
  'https://raw.githubusercontent.com/infinity-swap/token-lists/main/src/';

const IC_TOKENS_URL_MAIN = `${TOKENS_URL_BASE}/tokenlist.json`;
const IC_TOKENS_URL_TEST = `${TOKENS_URL_BASE}/tokenlist.testnet.json`;

const ETH_TOKENS_URL_MAIN = `${TOKENS_URL_BASE}/evm.tokenlist.json`;
const ETH_TOKENS_URL_TEST = `${TOKENS_URL_BASE}/evm.tokenlist.testnet.json`;

export const LIST_URLS: ListsUrl[] = (
  IS_DEV
    ? [
        {
          name: 'devnet',
          icUrl: '/tokenlist.json',
          ethUrl: '/evm.tokenlist.json'
        }
      ]
    : []
).concat([
  { name: 'mainnet', icUrl: IC_TOKENS_URL_MAIN, ethUrl: ETH_TOKENS_URL_MAIN },
  { name: 'testnet', icUrl: IC_TOKENS_URL_TEST, ethUrl: ETH_TOKENS_URL_TEST }
]);

export const IC_HOST = z.string().parse(process.env.IC_HOST);
export const RPC_URL = z.string().parse(process.env.RPC_URL);

const nativeCurrency = {
  name: 'Bitfinity',
  symbol: 'BFT',
  decimals: 18
};

export const BITFINITY_CHAINS: [Chain] | [Chain, Chain] = IS_DEV
  ? [
      {
        id: 355113,
        name: 'Bitfinity Devnet',
        nativeCurrency,
        rpcUrls: {
          public: { http: [IC_HOST] },
          default: { http: [RPC_URL] }
        }
      } as const satisfies Chain
    ]
  : [
      {
        id: 355110,
        name: 'Bitfinity Testnet',
        nativeCurrency,
        rpcUrls: {
          public: { http: ['https://testnet.bitfinity.network'] },
          default: { http: ['https://testnet.bitfinity.network'] }
        }
      } as const satisfies Chain,
      {
        id: 355113,
        name: 'Bitfinity Mainnet',
        nativeCurrency,
        rpcUrls: {
          public: { http: ['https://testnet.bitfinity.network'] },
          default: { http: ['https://testnet.bitfinity.network'] }
        }
      } as const satisfies Chain
    ];

console.log(BITFINITY_CHAINS.map(c => c.id));
