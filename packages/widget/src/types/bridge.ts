import { Chain } from "@rainbow-me/rainbowkit";
import { JsonRpcSigner } from "ethers";
import { ReactNode } from "react";
import { ThemeType } from "../theme/Theme";
import { NetworkType } from "./network";

export type TBridgeOptions = {
  onSuccess?: (status: string) => void;
  onError?: (status: unknown) => void;
  allowTokenImport?: boolean;
  icHost?: string;
  rpcUrl?: string;
  defaultAmount?: number;
  defaultNetwork?: NetworkType;
  jsonRpcSigner?: JsonRpcSigner;
  bftAddress?: string;
  iCRC2MinterCanisterId?: string;
};

export type TBridgeWidget = {
  chains?: Chain[];
  theme?: Partial<ThemeType>;
} & TBridgeOptions;

export type TBridgeProvider = {
  children: ReactNode;
  theme?: Partial<ThemeType>;
} & TBridgeOptions;
