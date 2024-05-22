import { JsonRpcSigner } from "ethers";
import { createContext, useContext, useState } from "react";
import { getEvmWallet } from "../utils";
import { TBridgeOptions, TBridgeProvider } from "../types";
import {
  BFT_ETH_ADDRESS,
  Connector,
  ICRC2_MINTER_CANISTER_ID,
  ICRC2_TOKEN_CANISTER_ID,
  IC_HOST,
  IcrcBridge,
  RPC_URL,
} from "@bitfinity-network/bridge";

type TBridgeContext = {
  getEthWallet: () => Promise<JsonRpcSigner | undefined>;
  getIcrcBridge: (baseTokenId: string) => Promise<IcrcBridge | undefined>;
} & TBridgeOptions;

const defaultValue: TBridgeContext = {
  getEthWallet: async () => undefined,
  getIcrcBridge: async () => undefined,
};
const BridgeContext = createContext<TBridgeContext>(defaultValue);

export const BridgeProvider = ({
  children,
  icHost = IC_HOST,
  rpcUrl = RPC_URL,
  allowTokenImport = true,
  jsonRpcSigner,
  iCRC2MinterCanisterId,
  bftAddress,
  ...rest
}: TBridgeProvider) => {
  const [wallet, setWallet] = useState<JsonRpcSigner | undefined>();
  const [icrcBridge, setIcrcBridge] = useState<IcrcBridge>();

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

  const getIcrcBridge = async (baseTokenCanisterId: string) => {
    try {
      const evmWallet = await getEthWallet();

      if (!icrcBridge && evmWallet) {
        const connector = Connector.create({
          bridges: ["icrc"],
          wallet: evmWallet,
          bitfinityWallet: window.ic.bitfinityWallet,
          network: {
            icHost,
            bftAddress: bftAddress || BFT_ETH_ADDRESS,
            icrc: {
              baseTokenCanisterId:
                baseTokenCanisterId || ICRC2_TOKEN_CANISTER_ID,
              iCRC2MinterCanisterId:
                iCRC2MinterCanisterId || ICRC2_MINTER_CANISTER_ID,
            },
          },
        });
        await connector.init();

        await connector.requestIcConnect();

        const bridge = connector.getBridge("icrc");
        ///

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
      value={{
        getEthWallet,
        getIcrcBridge,
        allowTokenImport,
        rpcUrl,
        ...rest,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBridgeContext = () => useContext(BridgeContext);
