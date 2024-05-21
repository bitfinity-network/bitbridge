import React, { Fragment } from "react";
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
import { TBridgeWidget } from "../../types";
import { extendDefaultTheme, ThemeType } from "../../theme/Theme";
import {
  ChakraProvider,
  ColorModeScript,
  useColorMode,
} from "@chakra-ui/react";

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

  const { setColorMode, colorMode } = useColorMode();

  // TODO: The custome theme I am manually adding is just for testing purposes.
  // I will remove it.
  const customTheme: Partial<ThemeType> | undefined = theme ?? {
    config: {
      initialColorMode: "light",
      cssVarPrefix: "bridge",
      useSystemColorMode: false,
    },
  };
  const customColorMode = customTheme?.config?.initialColorMode;
  const extendedTheme = extendDefaultTheme(customTheme);

  React.useEffect(() => {
    if (!customColorMode) return;
    if (colorMode !== customColorMode && setColorMode) {
      setColorMode(customColorMode);
    }
  }, [customColorMode, colorMode, setColorMode]);

  return (
    <Fragment>
      <ColorModeScript
        initialColorMode={extendedTheme.config.initialColorMode}
      />
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
