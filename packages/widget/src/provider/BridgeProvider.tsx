import { JsonRpcSigner } from "ethers";
import { createContext, useContext, useState } from "react";
import { getEvmWallet } from "../utils";
import { TBridgeOptions, TBridgeProvider } from "../types";
import { IcrcBridge, createAgent } from "@bitfinity-network/bridge";
import { HttpAgent } from "@dfinity/agent";

type TBridgeContext = {
  getEthWallet: () => Promise<JsonRpcSigner | undefined>;
  getIcrcBridge: (baseTokenId: string) => Promise<IcrcBridge | undefined>;
  getIcAgent: () => HttpAgent | undefined;
} & TBridgeOptions;

const defaultValue: TBridgeContext = {
  getEthWallet: async () => undefined,
  getIcrcBridge: async () => undefined,
  getIcAgent: () => undefined,
};
const BridgeContext = createContext<TBridgeContext>(defaultValue);

export const BridgeProvider = ({
  children,
  icHost = "http://127:0.0.1:8000",
  ...rest
}: TBridgeProvider) => {
  const [wallet, setWallet] = useState<JsonRpcSigner | undefined>();
  const [icrcBridge, setIcrcBridge] = useState<IcrcBridge>();

  const getEthWallet = async () => {
    if (!wallet) {
      const evmWallet = await getEvmWallet();
      setWallet(evmWallet);
      return evmWallet;
    }
    return wallet;
  };

  const getIcAgent = () => {
    return createAgent({ host: icHost });
  };

  const getIcrcBridge = async (baseTokenId: string) => {
    try {
      if (!icrcBridge) {
        const evmWallet = await getEthWallet();
        const agent = getIcAgent();

        const bridge = await IcrcBridge.create({
          wallet: evmWallet,
          agent,
          baseTokenId,
        });

        setIcrcBridge(bridge);
        return bridge;
      }
      return icrcBridge;
    } catch (error) {
      console.log("err", error);
    }
  };

  return (
    <BridgeContext.Provider
      value={{ getEthWallet, getIcrcBridge, getIcAgent, ...rest }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export const useBridgeContext = () => useContext(BridgeContext);
