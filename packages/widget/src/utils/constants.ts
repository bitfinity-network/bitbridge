import { QueryClient } from "@tanstack/react-query";
import EthIcon from "../assets/icons/eth.svg";
import BtcIcon from "../assets/icons/bitcoin.svg";
import IcIcon from "../assets/icons/ic.svg";

export const NETWORK_SYMBOLS = {
  ETHEREUM: "ethereum",
  IC: "ic",
  BTC: "btc",
  BITFINITY: "bft",
};

export const NETWORKS = [
  {
    name: "Ethereum",
    logo: EthIcon,
    symbol: NETWORK_SYMBOLS.ETHEREUM,
  },
  {
    name: "BITCOIN",
    logo: BtcIcon,
    symbol: NETWORK_SYMBOLS.BTC,
  },
  {
    name: "INTERNET COMPUTER",
    logo: IcIcon,
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
