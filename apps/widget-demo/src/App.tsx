import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  BridgeWidget,
  BITFINITY_CHAINS
} from '@bitfinity-network/bridge-widget';

const config = getDefaultConfig({
  appName: 'bridge-widget',
  projectId: 'YOUR_PROJECT_ID',
  chains: [...BITFINITY_CHAINS]
});

const networks = [
  {
    name: 'test',
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
  }
];

function App() {
  return (
    <div className="main">
      <BridgeWidget
        networks={networks}
        network={'test'}
        networkUrls={[]}
        config={config}
      />
    </div>
  );
}

export default App;
