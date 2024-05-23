import { JsonRpcSigner } from "ethers";
import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { TBridgeOptions } from "../types";
import {
  Connector,
  IC_HOST,
  IcrcBridge,
  RPC_URL,
} from "@bitfinity-network/bridge";
import {  } from 'viem';

// import { getEvmWallet } from "../utils";

type TBridgeContext = {
  // getEthWallet: () => Promise<JsonRpcSigner | undefined>;
  // getIcrcBridge: (baseTokenId: string) => Promise<IcrcBridge | undefined>;
  getConnector: () => Connector;
};

const BridgeContext = createContext<TBridgeContext>({} as TBridgeContext);

export const BridgeProvider = ({
  icHost = IC_HOST,
  rpcUrl = RPC_URL,
  allowTokenImport = true,
  jsonRpcSigner,
  children,
  ...rest
}: TBridgeOptions & { children: ReactNode }) => {
  const [ethWallet, setEthWallet] = useState<JsonRpcSigner | undefined>(
    jsonRpcSigner,
  );
  const [icWallet, setIcWallet] = useState();
  const [connector, setConnector] = useState<Connector>();
  // const [icrcBridge, setIcrcBridge] = useState<IcrcBridge>();

  const getEthWallet = async () => {
    if (jsonRpcSigner) {
      return jsonRpcSigner;
    }
    if (!wallet) {
      const evmWallet = await getEvmWallxet();
      setWallet(evmWallet);
      return evmWallet;
    }
    return wallet;
  };

  const getConnector = () => {
    return connector!;
  };

  const getIcrcBridge = async (baseTokenCanisterId: string) => {
    try {
      const evmWallet = await getEthWallet();

      if (!icrcBridge && evmWallet) {
        const connector = await getConnector();
        if (connector) {
          await connector.requestIcConnect();
          const bridge = connector.getBridge<"icrc">(
            baseTokenCanisterId || "bkyz2-fmaaa-aaaaa-qaaaq-cai",
          );
          setIcrcBridge(bridge);
          return bridge;
        }
      }
      return icrcBridge;
    } catch (error) {
      console.log("err", error);
    }
  };

  const ctx: TBridgeContext = useMemo(() => {
    return {
      getConnector: () => {
        return connector!;
      },
    };
  }, [connector]);

  return (
    <BridgeContext.Provider value={ctx}>{children}</BridgeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBridgeContext = () => useContext(BridgeContext);
