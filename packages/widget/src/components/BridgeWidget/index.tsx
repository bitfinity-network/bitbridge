import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BridgeProvider } from "../../provider/BridgeProvider";
import { Widget } from "./Widget";
import { reactQueryClient } from "../../utils";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

export const BridgeWidget = () => {
  return (
    <PersistQueryClientProvider
      client={reactQueryClient}
      persistOptions={{ persister }}
    >
      <BridgeProvider>
        <Widget />
      </BridgeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
};
