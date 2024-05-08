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
const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

export const BridgeWidget = ({ chains = [] }) => {
  const config = getDefaultConfig({
    appName: "bridge-widget",
    projectId: "YOUR_PROJECT_ID",
    chains: [BITFINITY_LOCAL_CHAIN, ...chains],
  });

  return (
    <WagmiProvider config={config}>
      <PersistQueryClientProvider
        client={reactQueryClient}
        persistOptions={{ persister }}
      >
        <RainbowKitProvider>
          <BridgeProvider>
            <Widget />
          </BridgeProvider>
        </RainbowKitProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>
    </WagmiProvider>
  );
};
