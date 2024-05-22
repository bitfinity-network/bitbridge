import { Chain } from "@rainbow-me/rainbowkit";

const BITFINITY_LOCAL_CHAIN_RPC_URL = "http://127.0.0.1:8545";
export const BITFINITY_LOCAL_CHAIN = {
  id: 355113,
  name: "Bitfinity Network",
  nativeCurrency: {
    name: "Bitfinity",
    symbol: "BFT",
    decimals: 18,
  },
  rpcUrls: {
    public: { http: [BITFINITY_LOCAL_CHAIN_RPC_URL] },
    default: { http: [BITFINITY_LOCAL_CHAIN_RPC_URL] },
  },
  //blockExplorerUrls: []
} as const satisfies Chain;
