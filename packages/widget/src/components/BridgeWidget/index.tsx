import { Fragment } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BridgeProvider } from "../../provider/BridgeProvider";
import { Widget } from "./Widget";
import { reactQueryClient } from "../../utils";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { BITFINITY_LOCAL_CHAIN } from "../../utils/network";
import "@rainbow-me/rainbowkit/styles.css";
import { CustomThemeType, TBridgeWidget } from "../../types";
import { extendDefaultTheme } from "../../theme/Theme";
import { ChakraProvider } from "@chakra-ui/react";

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

  const customTheme: CustomThemeType | undefined = theme;
  const extendedTheme = extendDefaultTheme(customTheme);

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
