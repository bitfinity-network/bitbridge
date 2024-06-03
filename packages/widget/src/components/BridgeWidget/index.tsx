import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ChakraProvider } from '@chakra-ui/react';
import {
  getDefaultConfig,
  RainbowKitProvider,
  Chain
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { HttpAgent } from '@dfinity/agent';

import { Widget } from './Widget';
import { reactQueryClient } from '../../utils';
import { extendDefaultTheme, CustomThemeType } from '../../theme/theme';
import { BridgeProvider } from '../../provider/BridgeProvider';

import '@rainbow-me/rainbowkit/styles.css';
import { TokensProvider } from '../../provider/TokensProvider.tsx';

const IC_HOST = 'http://127.0.0.1:4943';
const BITFINITY_LOCAL_CHAIN_RPC_URL = 'http://127.0.0.1:8545';

const BITFINITY_LOCAL_CHAIN = {
  id: 355113,
  name: 'Bitfinity Network',
  nativeCurrency: {
    name: 'Bitfinity',
    symbol: 'BFT',
    decimals: 18
  },
  rpcUrls: {
    public: { http: [BITFINITY_LOCAL_CHAIN_RPC_URL] },
    default: { http: [BITFINITY_LOCAL_CHAIN_RPC_URL] }
  }
} as const satisfies Chain;

const agent = new HttpAgent({ host: IC_HOST });
agent.fetchRootKey();

const persister = {
  persister: createSyncStoragePersister({
    storage: window.localStorage
  })
};

export type BridgeWidget = {
  chains?: Chain[];
  theme?: CustomThemeType;
};

export const BridgeWidget = ({ chains = [], theme }: BridgeWidget) => {
  const config = getDefaultConfig({
    appName: 'bridge-widget',
    projectId: 'YOUR_PROJECT_ID',
    chains: [BITFINITY_LOCAL_CHAIN, ...chains]
  });

  const extendedTheme = extendDefaultTheme(theme);

  return (
    <ChakraProvider theme={extendedTheme}>
      <WagmiProvider config={config}>
        <PersistQueryClientProvider
          client={reactQueryClient}
          persistOptions={persister}
        >
          <RainbowKitProvider>
            <BridgeProvider agent={agent}>
              <TokensProvider agent={agent}>
                <Widget />
              </TokensProvider>
            </BridgeProvider>
          </RainbowKitProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
      </WagmiProvider>
    </ChakraProvider>
  );
};
