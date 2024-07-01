import { WagmiProvider, WagmiProviderProps } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import '@rainbow-me/rainbowkit/styles.css';

import { Bridge, BridgeWidgetProps } from './Bridge.tsx';
import { ReactQuery } from '../../provider/ReactQuery.tsx';

export const BridgeWidget = ({
  config,
  ...props
}: BridgeWidgetProps & { config: WagmiProviderProps['config'] }) => {
  return (
    <WagmiProvider config={config}>
      <ReactQuery>
        <RainbowKitProvider>
          <Bridge {...props} />
        </RainbowKitProvider>
      </ReactQuery>
    </WagmiProvider>
  );
};
