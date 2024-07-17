import { ReactNode } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { IS_DEV } from '../utils';

const persister = {
  persister: createSyncStoragePersister({
    storage: window.localStorage
  })
};

export const TANSTACK_GARBAGE_COLLECTION_TIME = 1000 * 60 * 8; // 8 minutes

// eslint-disable-next-line react-refresh/only-export-components
export const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: TANSTACK_GARBAGE_COLLECTION_TIME,
      staleTime: Infinity,
      refetchOnWindowFocus: false
    }
  }
});

export type QueryProps = {
  children: ReactNode;
};

export const ReactQuery = ({ children }: QueryProps) => {
  return (
    <PersistQueryClientProvider
      client={reactQueryClient}
      persistOptions={persister}
    >
      {children}
      {IS_DEV ? <ReactQueryDevtools /> : null}
    </PersistQueryClientProvider>
  );
};
