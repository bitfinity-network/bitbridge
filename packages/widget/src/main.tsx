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
// import { TokenListed } from './provider/TokensListsProvider.tsx';

const config = getDefaultConfig({
  appName: 'bridge-widget',
  projectId: 'YOUR_PROJECT_ID',
  chains: [...BITFINITY_CHAINS]
});

/*

ICRC-2 Minter  = "drcah-cqaaa-aaaal-qjfva-cai"
MinterAddress = "0x914d667275fb624f6ca5f95ca2c0fc12aaf8f763"

/// Contracts
FeechargeAddress = "0x37f0688d93d7897b00a5da8fbbac157954506f61"

Implementation address: 0x56fd6a2ac7a7aa46795e4afe06c3798ece302a6b
BFT Proxy address: 0xce0c298fa7f12afb68ce6ba8a1644c9e5410ee54
 */

const networks = [
  {
    name: 'testnet',
    icHost: 'https://ic0.app',
    ethCain: 355113,
    bridges: [
      {
        type: 'icrc_evm',
        iCRC2MinterCanisterId: 'hvqpb-hyaaa-aaaal-qjfoq-cai',
        bftAddress: '0x87d8d72876fcaa4580b961563c2e6802371bd56f',
        feeChargeAddress: '0xad662954110b46cb91dd83c664c0f9983d2fa75c'
      } as const
    ]
  },
  {
    name: 'mainnet',
    icHost: 'https://ic0.app',
    ethCain: 355110,
    bridges: [
      {
        type: 'icrc_evm',
        iCRC2MinterCanisterId: 'zzh7g-qiaaa-aaaag-aldva-cai',
        bftAddress: '0x1328fd8c11977e0056955ad2b2def7a6e3c35ce4',
        feeChargeAddress: '0x99c968d7f6b30a21e29d611553cc3f58ebbdf139'
      } as const
    ]
  }
];

// const tokens = [
//   {
//     type: 'icrc',
//     id: '',
//     name: '',
//     symbol: '',
//     decimals: 8,
//     fee: 10,
//     logo: ''
//   } as TokenListed
// ];

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
        },
        // walletOptions: {
        //   // optional: wallet options
        //   visible: true
        // }
      }}
      btcConnectors={[
        new UnisatConnector(),
        new OKXConnector(),
        new XverseConnector()
      ]}
    />
  </React.StrictMode>
);
