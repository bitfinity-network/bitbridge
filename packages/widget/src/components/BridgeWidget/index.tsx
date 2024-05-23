import { Fragment } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ChakraProvider } from "@chakra-ui/react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";

import { BridgeProvider } from "../../provider/BridgeProvider";
import { Widget } from "./Widget";
import { reactQueryClient } from "../../utils";
import { BITFINITY_LOCAL_CHAIN } from "../../utils/network";
import { TBridgeWidget } from "../../types";
import { extendDefaultTheme } from "../../theme/Theme";

import "@rainbow-me/rainbowkit/styles.css";

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

export const BridgeWidget = ({
  chains = [],
  theme,
  ...rest
}: TBridgeWidget) => {
  const config = getDefaultConfig({
    appName: "bridge-widget",
    projectId: "YOUR_PROJECT_ID",
    chains: [BITFINITY_LOCAL_CHAIN, ...chains],
  });

  const extendedTheme = extendDefaultTheme(theme);

  return (
    <Fragment>
      <ChakraProvider theme={extendedTheme}>
        <WagmiProvider config={config}>
          <PersistQueryClientProvider
            client={reactQueryClient}
            persistOptions={{ persister }}
          >
            <RainbowKitProvider>
              <BridgeProvider {...rest}>
                <Widget />
              </BridgeProvider>
            </RainbowKitProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </PersistQueryClientProvider>
        </WagmiProvider>
      </ChakraProvider>
    </Fragment>
  );
};
