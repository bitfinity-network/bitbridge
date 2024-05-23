import { Chain } from "@rainbow-me/rainbowkit";
import { JsonRpcSigner } from "ethers";
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

export type CustomThemeType = {
  colors?: {
    primary?: string;
    secondary?: string;
    success?: string;
    mainBg?: string;
    modalBg?: string;
    primaryText?: string;
    secondaryText?: string;
  };
  config?: {
    colorMode?: "light" | "dark";
    useSystemColorMode?: boolean;
  };
};

export type TBridgeWidget = {
  chains?: Chain[];
  theme?: CustomThemeType;
} & TBridgeOptions;
