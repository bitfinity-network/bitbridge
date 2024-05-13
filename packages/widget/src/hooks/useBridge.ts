import { useState } from "react";
import { useBridgeContext } from "../provider/BridgeProvider";
import { NETWORK_SYMBOLS, fromDecimal, importToken } from "../utils";
import { TokenProp } from "../types";
import { IcrcBridge } from "@bitfinity-network/bridge";

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
  const { successFn, getIcrcBridge, getEthWallet, allowTokenImport } =
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
      if (allowTokenImport) await importToken(wrappedToken.target as string);
      if (successFn) successFn("");
    } catch (error) {
      console.error("bridging Ic error", error);
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
  };
  return { bridgeFn, amount, setAmount, token, setToken };
};
