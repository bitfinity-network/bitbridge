import { Chain } from "@rainbow-me/rainbowkit";
import { JsonRpcSigner } from "ethers";
import { ReactNode } from "react";
import { NETWORK_SYMBOLS } from "../utils";

export type TBridgeOptions = {
  onSuccess?: (status: string) => void;
  onError?: (status: unknown) => void;
  allowTokenImport?: boolean;
  icHost?: string;
  rpcUrl?: string;
  defaultAmount?: number;
  defaultNetwork?: (typeof NETWORK_SYMBOLS)[keyof typeof NETWORK_SYMBOLS];
  jsonRpcSigner?: JsonRpcSigner;
  bftAddress?: string;
  iCRC2MinterCanisterId?: string;
};

export type TBridgeWidget = {
  chains?: Chain[];
} & TBridgeOptions;

export type TBridgeProvider = {
  children: ReactNode;
} & TBridgeOptions;
