import React from 'react';
import ReactDOM from 'react-dom/client';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  OKXConnector,
  UnisatConnector,
  XverseConnector
} from '@particle-network/btc-connectkit';

import { BridgeWidget } from './components/BridgeWidget';
import { BITFINITY_CHAINS } from './utils';

const config = getDefaultConfig({
  appName: 'bridge-widget',
  projectId: 'YOUR_PROJECT_ID',
  chains: [...BITFINITY_CHAINS]
});

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BridgeWidget
      showWidgetModal={false}
      networks={networks}
      networkUrls={[]}
      network={'mainnet'}
      config={config}
      tokensListed={[]}
      btcOptions={{
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
      }}
      btcConnectors={[
        new UnisatConnector(),
        new OKXConnector(),
        new XverseConnector()
      ]}
    />
  </React.StrictMode>
);
