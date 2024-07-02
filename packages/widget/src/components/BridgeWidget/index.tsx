import { WagmiProvider, WagmiProviderProps } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  ConnectProvider as BTCConnectProvider,
  BaseConnector
} from '@particle-network/btc-connectkit';

import '@rainbow-me/rainbowkit/styles.css';

import { Bridge, BridgeWidgetProps } from './Bridge.tsx';
import { ReactQuery } from '../../provider/ReactQuery.tsx';

export type BtcOptions = Parameters<typeof BTCConnectProvider>[0]['options'];

export const BridgeWidget = ({
  config,
  btcOptions,
  btcConnectors,
  ...props
}: BridgeWidgetProps & {
  config: WagmiProviderProps['config'];
  btcOptions: BtcOptions;
  btcConnectors: BaseConnector[];
}) => {
  return (
    <BTCConnectProvider options={btcOptions} connectors={btcConnectors}>
      <WagmiProvider config={config}>
        <ReactQuery>
          <RainbowKitProvider>
            <Bridge {...props} />
          </RainbowKitProvider>
        </ReactQuery>
      </WagmiProvider>
    </BTCConnectProvider>
  );
};
