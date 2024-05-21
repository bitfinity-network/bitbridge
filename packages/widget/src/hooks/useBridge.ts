import { useState } from "react";
import { useBridgeContext } from "../provider/BridgeProvider";
import { NETWORK_SYMBOLS, fromDecimal, importToken } from "../utils";
import { TokenProp } from "../types";
import { IcrcBridge } from "@bitfinity-network/bridge";
import { getIcWallet } from "./useWallets";

type TBridingHookProps = {
  network: string;
};

const BRIDGE_STEPS = [
  "Initializing Bridge",
  "Getting Wrapped Token Adress",
  "Approving and burning",
  "Bridging  Complete",
];

export const useBridge = ({ network }: TBridingHookProps) => {
  const {
    onSuccess,
    defaultAmount,
    getIcrcBridge,
    getEthWallet,
    allowTokenImport,
    rpcUrl,
    onError,
  } = useBridgeContext();
  const [amount, setAmount] = useState<number>(defaultAmount || 0);
  const [, setMessage] = useState("");
  const [token, setToken] = useState<TokenProp>({ name: "", symbol: "" });
  const amtInBigInt = BigInt(fromDecimal(amount, token.decimals || 8));

  const [isBridging, setBridgingStatus] = useState(false);

  const bridgeIcToErc20 = async (
    icrcBricdge: IcrcBridge,
    amt: bigint,
    userAddress: string
  ) => {
    try {
      setMessage(BRIDGE_STEPS[1]);
      await icrcBricdge.deployBftWrappedToken(token.name, token.name);
      const wrappedToken = await icrcBricdge.getWrappedTokenContract();
      setMessage(`${BRIDGE_STEPS[2]} ${token.name}`);
      await icrcBricdge.bridgeToEvmc(amt, userAddress || "");
      setMessage(`${BRIDGE_STEPS[3]}`);
      if (onSuccess) {
        onSuccess("bridging was successfully");
      }
      if (allowTokenImport) {
        await importToken(wrappedToken.target as string, rpcUrl!);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };

  const bridgeErc20ToIc = async (icrcBricdge: IcrcBridge, amt: bigint) => {
    try {
      setMessage(`Bridging ${amount} ${token.name}`);
      const icWallet = await getIcWallet();
      const icWalletPrincipal = icWallet?.principal;
      if (icWalletPrincipal) {
        await icrcBricdge.bridgeFromEvmc(icWalletPrincipal.toText(), amt);
        if (onSuccess) {
          onSuccess("bridging was successfully");
        }
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };

  const bridgeFn = async () => {
    setBridgingStatus(true);
    if (network === NETWORK_SYMBOLS.IC) {
      const icrcBridge = await getIcrcBridge(token?.id || "");
      const wallet = await getEthWallet();
      if (icrcBridge) {
        await bridgeIcToErc20(icrcBridge, amtInBigInt, wallet?.address || "");
      }
    }
    if (network === NETWORK_SYMBOLS.BITFINITY) {
      const icrcBridge = await getIcrcBridge(token?.id || "");
      if (icrcBridge) {
        await bridgeErc20ToIc(icrcBridge, amtInBigInt);
      }
    }
    setBridgingStatus(false);
  };

  return { bridgeFn, amount, setAmount, token, setToken, isBridging };
};
