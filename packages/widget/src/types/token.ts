import { Principal } from "@dfinity/principal";
import { NetworkType } from "./network";

export interface TokenProp {
  id?: string;
  name: string;
  img?: string;
  logo?: string;
  type?: string;
  symbol?: string;
  balance?: bigint | number;
  decimals?: bigint | number;
  fee?: number;
  showAddress?: boolean;
  address?: string;
  standard?: string;
  network?: NetworkType;
  variant?: "sm" | "lg";
  canisterInfo?: any;
}

export type NetworkProp = {
  name: string;
  logo: string;
  symbol: string;
};

export type TokenSearchProps = {
  network: string;
  tokens: TokenProp[];
  searchKey: string;
  userPrincipal?: string;
};

export type TokenSearchReturnProps = {
  data: TokenProp[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
};

export type TGetIcTokenBalance = {
  tokenId?: string;
  decimals?: number | bigint;
  userPrincipal?: Principal | null;
};
