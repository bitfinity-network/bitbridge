import { JsonRpcSigner } from "ethers";
import { createContext, useContext, useState } from "react";
import { getEvmWallet } from "../utils";
import { TBridgeOptions, TBridgeProvider } from "../types";
import {
  Connector,
  IC_HOST,
  IcrcBridge,
  RPC_URL,
} from "@bitfinity-network/bridge";

type TBridgeContext = {
  getEthWallet: () => Promise<JsonRpcSigner | undefined>;
  getIcrcBridge: (baseTokenId: string) => Promise<IcrcBridge | undefined>;
  getConnector: () => Promise<Connector | undefined>;
} & TBridgeOptions;

const defaultValue: TBridgeContext = {
  getEthWallet: async () => undefined,
  getIcrcBridge: async () => undefined,
  getConnector: async () => undefined,
};
const BridgeContext = createContext<TBridgeContext>(defaultValue);

export const BridgeProvider = ({
  children,
  icHost = IC_HOST,
  rpcUrl = RPC_URL,
  allowTokenImport = true,
  jsonRpcSigner,
  ...rest
}: TBridgeProvider) => {
  const [wallet, setWallet] = useState<JsonRpcSigner | undefined>();
  const [icrcBridge, setIcrcBridge] = useState<IcrcBridge>();
  const [connector, setConnector] = useState<Connector>();

  const getEthWallet = async () => {
    if (jsonRpcSigner) {
      return jsonRpcSigner;
    }
    if (!wallet) {
      const evmWallet = await getEvmWallet();
      setWallet(evmWallet);
      return evmWallet;
    }
    return wallet;
  };

  const getConnector = async () => {
    if (!connector) {
      console.log("new connectors", connector);
      const evmWallet = await getEthWallet();

      if (evmWallet) {
        const con = Connector.create({
          wallet: evmWallet,
          bitfinityWallet: window.ic.bitfinityWallet,
        });

        // TODO fetchlocal only for dev or local network
        await con.fetchLocal();
        await con.bridgeAfterDeploy();
        await con.init();

        setConnector(con);
        return con;
      }
    }
    console.log("old connectors");

    return connector;
  };

  const getIcrcBridge = async (baseTokenCanisterId: string) => {
    try {
      const evmWallet = await getEthWallet();

      if (!icrcBridge && evmWallet) {
        const connector = await getConnector();
        if (connector) {
          await connector.requestIcConnect();
          const bridge = connector.getBridge<"icrc">(
            baseTokenCanisterId || "bkyz2-fmaaa-aaaaa-qaaaq-cai"
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

  return (
    <BridgeContext.Provider
      value={{
        connector,
        getConnector,
        getEthWallet,
        getIcrcBridge,
        allowTokenImport,
        rpcUrl,
        icHost,
        ...rest,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBridgeContext = () => useContext(BridgeContext);
