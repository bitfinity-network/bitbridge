import { QueryClient } from "@tanstack/react-query";

export const NETWORK_SYMBOLS = {
  ETHEREUM: "ethereum",
  IC: "ic",
  BTC: "btc",
  BITFINITY: "bft",
};

export const NETWORKS = [
  {
    name: "Ethereum",
    logo: "/icons/eth.svg",
    symbol: NETWORK_SYMBOLS.ETHEREUM,
  },
  {
    name: "BITCOIN",
    logo: "/icons/bitcoin.svg",
    symbol: NETWORK_SYMBOLS.BTC,
  },
  {
    name: "INTERNET COMPUTER",
    logo: "/icons/ic.svg",
    symbol: NETWORK_SYMBOLS.IC,
  },
];

export const queryKeys = {
  cachedTokens: "cached_tokens",
  tokens: "tokens",
  searchTokens: "search_tokens",
  tokenBalance: "token_balance",
  leaderboard: "leaderboard",
  highestLeaderboard: "highest_leaderboard",
  icWallet: "ic_wallet",
};

export const BITFINITY_INSTALLATION_URL =
  "https://chrome.google.com/webstore/detail/bitfinity-wallet/jnldfbidonfeldmalbflbmlebbipcnle?hl=kk";

export const TANSTACK_GARBAGE_COLLECTION_TIME = 1000 * 60 * 8; // 8 minutes

export const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: TANSTACK_GARBAGE_COLLECTION_TIME,
      staleTime: 60 * 1000,
    },
  },
});
