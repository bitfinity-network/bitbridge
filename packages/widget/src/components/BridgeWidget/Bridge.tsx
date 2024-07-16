import { ChakraProvider } from '@chakra-ui/react';
import { BrdidgeNetworkUrl, BridgeNetwork } from '@bitfinity-network/bridge';

import { Widget } from './Widget';
import { extendDefaultTheme, CustomThemeType } from '../../theme/theme';
import { BridgeProvider } from '../../provider/BridgeProvider';
import { TokensProvider } from '../../provider/TokensProvider.tsx';
import {
  ListsUrl,
  TokenListed,
  TokensListsProvider
} from '../../provider/TokensListsProvider.tsx';
import { LIST_URLS, NETWORK_URLS } from '../../utils';

export interface BridgeWidgetProps {
  theme?: CustomThemeType;
  networks?: BridgeNetwork[];
  network?: string;
  networkUrls?: BrdidgeNetworkUrl[];
  tokensListed?: TokenListed[];
  listsUrls?: ListsUrl[];
  showWidgetModal?: boolean;
}

export const Bridge = ({
  theme,
  networks = [],
  network = 'devnet',
  tokensListed = [],
  networkUrls = NETWORK_URLS,
  listsUrls = LIST_URLS,
  showWidgetModal = false
}: BridgeWidgetProps) => {
  const extendedTheme = extendDefaultTheme(theme);

  return (
    <ChakraProvider theme={extendedTheme}>
      <TokensListsProvider
        tokensListed={tokensListed}
        network={network}
        listsUrls={listsUrls}
      >
        <BridgeProvider
          network={network}
          networks={networks}
          networkUrls={networkUrls}
        >
          <TokensProvider>
            <Widget showWidgetModal={showWidgetModal} />
          </TokensProvider>
        </BridgeProvider>
      </TokensListsProvider>
    </ChakraProvider>
  );
};
