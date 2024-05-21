import { Chain } from "@rainbow-me/rainbowkit";
import { ReactNode } from "react";
import { ThemeType } from "../theme/Theme";

export type TBridgeOptions = {
  successFn?: (status: string) => void;
  allowTokenImport?: boolean;
  icHost?: string;
  rpcUrl?: string;
  defaultAmount?: number;
};

export type TBridgeWidget = {
  chains?: Chain[];
  theme?: Partial<ThemeType>;
} & TBridgeOptions;

export type TBridgeProvider = {
  children: ReactNode;
  theme?: Partial<ThemeType>;
} & TBridgeOptions;
