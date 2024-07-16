# The React Bitfinity Bridge Widget Application demo

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
  projectId: 'YOUR_PROJECT_ID',
  chains: [...BITFINITY_CHAINS]
});

// default mainnet bridge configuration
const networks = [
  {
    name: 'mainnet',
    icHost: 'https://ic0.app',
    ethCain: 355110,
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

const widget = (
  <BridgeWidget
    showWidgetModal={false}
    networks={networks}
    networkUrls={[]}
    network={'mainnet'}
    config={config}
    tokensListed={[]}
    btcOptions={}
    btcConnectors={[
      new UnisatConnector(),
      new OKXConnector(),
      new XverseConnector()
    ]}
  />
);
```
