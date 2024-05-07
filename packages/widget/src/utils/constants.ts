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
    img: "/icons/eth.svg",
    logo: "/icons/eth.svg",
    symbol: NETWORK_SYMBOLS.ETHEREUM,
  },
  {
    name: "BITCOIN",
    img: "/icons/bitcoin.svg",
    logo: "/icons/bitcoin.svg",
    symbol: NETWORK_SYMBOLS.BTC,
  },
  {
    name: "INTERNET COMPUTER",
    img: "/icons/ic.svg",
    logo: "/icons/ic.svg",
    symbol: NETWORK_SYMBOLS.IC,
  },
];

export const TANSTACK_GARBAGE_COLLECTION_TIME = 1000 * 60 * 8; // 8 minutes

export const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: TANSTACK_GARBAGE_COLLECTION_TIME,
      staleTime: 60 * 1000,
    },
  },
});
