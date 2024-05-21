import { QueryClient } from "@tanstack/react-query";
import EthIcon from "../assets/icons/eth.svg";
import BtcIcon from "../assets/icons/bitcoin.svg";
import IcIcon from "../assets/icons/ic.svg";
import BftIcon from "../assets/icons/bitfinity.svg";
import { NetworkProp } from "../types";

export const NETWORK_SYMBOLS = {
  ETHEREUM: "ethereum",
  IC: "IC",
  BTC: "BTC",
  BITFINITY: "BFT",
} as const;

export const NETWORKS: NetworkProp[] = [
  {
    name: "Ethereum",
    logo: EthIcon,
    symbol: NETWORK_SYMBOLS.ETHEREUM,
  },
  {
    name: "BITFINITY EVM",
    logo: BftIcon,
    symbol: NETWORK_SYMBOLS.BITFINITY,
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

export const EVM_TOKENS_URL =
  "https://raw.githubusercontent.com/bitfinity-network/token-lists/main/src/evm.tokenlist.testnet.json";

export const TANSTACK_GARBAGE_COLLECTION_TIME = 1000 * 60 * 8; // 8 minutes

export const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: TANSTACK_GARBAGE_COLLECTION_TIME,
      staleTime: 60 * 1000,
    },
  },
});
