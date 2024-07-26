# The React Bitfinity Bridge Widget Application demo

### Install deps:

```
"@bitfinity-network/bridge": "^1.1.0",
"@bitfinity-network/bridge-widget": "^1.1.0",
"@rainbow-me/rainbowkit": "^2.0.7",
"@particle-network/btc-connectkit": "^1.0.0-alpha.25"
```    

### Setup packer

Here is an example for Vite:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true
      }
    })
  ],
  define: {
    'process.env': process.env,
    global: 'window'
  }
});
```

### Setup widget

You could clone this repository to bootstrap the integration.

Or to get started use the following config to init the widget:

```typescript
// import configuration for the ETH based wallet
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// importing BTC wallet connection methods
import {
  OKXConnector,
  UnisatConnector,
  XverseConnector
} from '@particle-network/btc-connectkit';

import {
  BridgeWidget,
  BITFINITY_CHAINS
} from '@bitfinity-network/bridge-widget';

// use BITFINITY_CHAINS to allow wallet to connect to Bitfinity EVM
// also you can add your custom chains
const config = getDefaultConfig({
  appName: 'bridge-widget',
  projectId: 'YOUR_PROJECT_ID', // leave as is if you don't have rainbowkit projectId
  chains: [...BITFINITY_CHAINS]
});

// sample mainnet bridge configuration
// use at your own caution. Bridges have not been audited, and Bitfinity makes no warrantee about the security. 
// this is hooks up to an example bridge that is not deployed by Bitfinity.
const networks = [
  {
    name: 'mainnet',
    icHost: 'https://ic0.app',
    ethChain: 355110,
    bridges: [
      {
        type: 'icrc_evm',
        iCRC2MinterCanisterId: 'zzh7g-qiaaa-aaaag-aldva-cai',
        bftAddress: '0x880548aa74d8955f42764d336c9bc37bf49669d1',
        feeChargeAddress: '0x8435b704d20ec3a370c9ecfcec43773f7eaaff97'
      } as const
    ]
  }
];

// leave as is if you don't have btc-connectkit projectId
const btcOptions = {
  projectId: 'xxxx', 
  clientKey: 'xxxx',
  appId: 'xxxx',
  aaOptions: {
    accountContracts: {
      BTC: [
        {
          chainIds: [],
          version: '1.0.0'
        }
      ]
    }
  }
};

const widget = (
  <BridgeWidget
    showWidgetModal={false}
    networks={networks}
    networkUrls={[]}
    network={'mainnet'}
    config={config}
    tokensListed={[]}
    btcOptions={btcOptions}
    btcConnectors={[
      new UnisatConnector(),
      new OKXConnector(),
      new XverseConnector()
    ]}
  />
);

```
