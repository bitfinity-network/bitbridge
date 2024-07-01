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
import { BrdidgeNetworkUrl } from '@bitfinity-network/bridge';

import { Widget } from './Widget';
import { extendDefaultTheme, CustomThemeType } from '../../theme/theme';
import { BridgeProvider } from '../../provider/BridgeProvider';
import { TokensProvider } from '../../provider/TokensProvider.tsx';
import {
  ListsUrl,
  TokenListed,
  TokensListsProvider
} from '../../provider/TokensListsProvider.tsx';
import { BITFINITY_CHAINS, LIST_URLS, NETWORK_URLS } from '../../utils';

import '@rainbow-me/rainbowkit/styles.css';

import { QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

const persister = {
  persister: createSyncStoragePersister({
    storage: window.localStorage
  })
};

export const TANSTACK_GARBAGE_COLLECTION_TIME = 1000 * 60 * 8; // 8 minutes

export const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: TANSTACK_GARBAGE_COLLECTION_TIME,
      staleTime: Infinity,
      refetchOnWindowFocus: false
    }
  }
});

export interface BridgeWidgetProps {
  chains?: Chain[];
  theme?: CustomThemeType;
  network?: string;
  networkUrls?: BrdidgeNetworkUrl[];
  tokensListed?: TokenListed[];
  listsUrls?: ListsUrl[];
  showWidgetModal?: boolean;
}

export const BridgeWidget = ({
  theme,
  chains = [],
  network = 'devnet',
  tokensListed = [],
  networkUrls = NETWORK_URLS,
  listsUrls = LIST_URLS,
  showWidgetModal = false
}: BridgeWidgetProps) => {
  const config = useMemo(
    () =>
      getDefaultConfig({
        appName: 'bridge-widget',
        projectId: 'YOUR_PROJECT_ID',
        chains: [...BITFINITY_CHAINS, ...chains]
      }),
    [chains]
  );

  const extendedTheme = useMemo(() => extendDefaultTheme(theme), [theme]);

  return (
    <ChakraProvider theme={extendedTheme}>
      <WagmiProvider config={config}>
        <PersistQueryClientProvider
          client={reactQueryClient}
          persistOptions={persister}
        >
          <RainbowKitProvider>
            <TokensListsProvider
              tokensListed={tokensListed}
              network={network}
              listsUrls={listsUrls}
            >
              <BridgeProvider network={network} networkUrls={networkUrls}>
                <TokensProvider>
                  <Widget showWidgetModal={showWidgetModal} />
                </TokensProvider>
              </BridgeProvider>
            </TokensListsProvider>
          </RainbowKitProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
      </WagmiProvider>
    </ChakraProvider>
  );
};
