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
