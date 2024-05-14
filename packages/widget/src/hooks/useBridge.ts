import { useState } from "react";
import { useBridgeContext } from "../provider/BridgeProvider";
import { NETWORK_SYMBOLS, fromDecimal, importToken } from "../utils";
import { TokenProp } from "../types";
import { IcrcBridge } from "@bitfinity-network/bridge";
import { getIcWallet, useWallets } from "./useWallets";

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
  const { successFn, getIcrcBridge, getEthWallet, allowTokenImport, rpcUrl } =
    useBridgeContext();
  const [amount, setAmount] = useState<number>(0);
  const [, setMessage] = useState("");
  const [token, setToken] = useState<TokenProp>({ name: "", symbol: "" });
  const amtInBigInt = BigInt(fromDecimal(amount, token.decimals || 8));

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
      await icrcBricdge.bridgeIcrc2ToEmvc(amt, userAddress || "");
      // const balance = await wrappedToken.balanceOf(userAddress);
      setMessage(`${BRIDGE_STEPS[3]}`);
      if (successFn) {
        successFn("bridging was successfully");
      }
      if (allowTokenImport) {
        await importToken(wrappedToken.target as string, rpcUrl!);
      }

      console.log("bridging complete");
    } catch (error) {
      console.error("bridging Ic error", error);
    }
  };

  const bridgeErc20ToIc = async (icrcBricdge: IcrcBridge, amt: bigint) => {
    try {
      setMessage(`Bridging ${amount} ${token.name}`);
      const icWallet = await getIcWallet();
      const icWalletPrincipal = icWallet?.principal;
      if (icWalletPrincipal) {
        await icrcBricdge.bridgeEmvcToIcrc2(amt, icWalletPrincipal);
        if (successFn) {
          successFn("bridging was successfully");
        }
      }
    } catch (error) {
      console.error("bridgeErc20ToIc Error", error);
    }
  };

  const bridgeFn = async () => {
    if (network === NETWORK_SYMBOLS.IC) {
      const icrcBridge = await getIcrcBridge(token?.id || "");
      const wallet = await getEthWallet();
      if (icrcBridge) {
        await bridgeIcToErc20(icrcBridge, amtInBigInt, wallet?.address!);
      }
    }
    if (network === NETWORK_SYMBOLS.BITFINITY) {
      const icrcBridge = await getIcrcBridge(token?.id || "");
      if (icrcBridge) {
        console.log("icrcBridge", icrcBridge);
        await bridgeErc20ToIc(icrcBridge, amtInBigInt);
      }
    }
  };
  return { bridgeFn, amount, setAmount, token, setToken };
};
