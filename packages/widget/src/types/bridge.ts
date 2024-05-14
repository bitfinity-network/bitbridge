import { Chain } from "@rainbow-me/rainbowkit";
import { ReactNode } from "react";

export type TBridgeOptions = {
  successFn?: (status: string) => void;
  allowTokenImport?: boolean;
  icHost?: string;
  rpcUrl?: string;
  defaultAmount?: number;
};

export type TBridgeWidget = {
  chains?: Chain[];
} & TBridgeOptions;

export type TBridgeProvider = {
  children: ReactNode;
} & TBridgeOptions;
