import { QueryClient } from '@tanstack/react-query';

export const queryKeys = {
  cachedTokens: 'cached_tokens',
  tokens: 'tokens',
  searchTokens: 'search_tokens',
  tokenBalance: 'token_balance',
  leaderboard: 'leaderboard',
  highestLeaderboard: 'highest_leaderboard',
  icWallet: 'ic_wallet'
};

export const BITFINITY_INSTALLATION_URL =
  'https://chrome.google.com/webstore/detail/bitfinity-wallet/jnldfbidonfeldmalbflbmlebbipcnle?hl=kk';

export const EVM_TOKENS_URL =
  'https://raw.githubusercontent.com/bitfinity-network/token-lists/main/src/evm.tokenlist.testnet.json';

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
