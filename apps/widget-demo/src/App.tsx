import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  BridgeWidget,
  BITFINITY_CHAINS
} from '@bitfinity-network/bridge-widget';

// const queryClient = new QueryClient();

const nativeCurrency = {
  name: 'Bitfinity',
  symbol: 'BFT',
  decimals: 18
};

const config = getDefaultConfig({
  appName: 'bridge-widget',
  projectId: 'YOUR_PROJECT_ID',
  chains: [...BITFINITY_CHAINS]
});

function App() {
  return (
    <div className="main">
      <BridgeWidget config={config} />
    </div>
  );
}

export default App;
