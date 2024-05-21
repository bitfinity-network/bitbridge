import { NETWORK_SYMBOLS } from "../utils";

export type NetworkType =
  (typeof NETWORK_SYMBOLS)[keyof typeof NETWORK_SYMBOLS];

export type Network = {
  name: string;
  logo: string;
  symbol: NetworkType;
};
