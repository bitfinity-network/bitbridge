import type { Handler } from 'vite-plugin-mix';

import {
  ICRC2_TOKEN_CANISTER_ID,
  BFT_ETH_ADDRESS,
  ICRC2_MINTER_CANISTER_ID
} from '@bitfinity-network/bridge';

const icTokens = {
  tokens: [
    {
      id: ICRC2_TOKEN_CANISTER_ID,
      logo: '/vite.svg',
      fee: 10000,
      decimals: 8,
      name: 'AUX',
      symbol: 'AUX',
      standard: 'ICRC1'
    }
  ]
};

const evmTokens = {
  tokens: [
    {
      address: '0x3a961f066881D5fEfD3e8f9C2Fa9312e9DcfaDE1',
      name: 'Cashium',
      symbol: 'CSM',
      decimals: 18,
      logo: 'https://raw.githubusercontent.com/infinity-swap/token-lists/main/logos/Cashium.png'
    },
    {
      address: '0x960BCBbB2793d0CED37d5c53D8D0e419579402aD',
      name: 'Coinaro',
      symbol: 'CNR',
      decimals: 18,
      logo: 'https://raw.githubusercontent.com/infinity-swap/token-lists/main/logos/Coinaro.png'
    },
    {
      address: '0xb486f56205Bc39Bd748d316F00a70359D581C2F4',
      name: 'Coinverse',
      symbol: 'CVS',
      decimals: 18,
      logo: 'https://raw.githubusercontent.com/infinity-swap/token-lists/main/logos/Coinverse.png'
    },
    {
      address: '0x4aa6392683177E3f89b2a940794d5D30ad711d5B',
      name: 'Coinovation',
      symbol: 'COV',
      decimals: 18,
      logo: 'https://raw.githubusercontent.com/infinity-swap/token-lists/main/logos/Coinovation.png'
    },
    {
      address: '0xA8F171031f561cCBEc960fFda11a9fa43253749D',
      name: 'Intellicoin',
      symbol: 'ITC',
      decimals: 18,
      logo: 'https://raw.githubusercontent.com/infinity-swap/token-lists/main/logos/Intellicoin.png'
    }
  ]
};

const networks = {
  networks: [
    {
      name: 'devnet',
      bridges: [
        {
          type: 'icrc_evm',
          bftAddress: BFT_ETH_ADDRESS,
          iCRC2MinterCanisterId: ICRC2_MINTER_CANISTER_ID
        }
      ]
    }
  ]
};

export const handler: Handler = (req, res, next) => {
  if (req.path === '/tokenlist.json') {
    return res.end(JSON.stringify(icTokens));
  }

  if (req.path === '/evm.tokenlist.json') {
    return res.end(JSON.stringify(evmTokens));
  }
  if (req.path === '/networks.json') {
    return res.end(JSON.stringify(networks));
  }
  next();
};
