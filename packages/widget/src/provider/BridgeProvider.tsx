import { JsonRpcSigner } from "ethers";
import { createContext, useContext, useState } from "react";
import { getEvmWallet } from "../utils";
import { TBridgeOptions, TBridgeProvider } from "../types";
import { Connector, IcrcBridge } from "@bitfinity-network/bridge";
import { useTheme } from "@chakra-ui/react";

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
  icHost = "http://localhost:4943",
  rpcUrl = "http://127.0.0.1:8545",
  allowTokenImport = true,
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

  const getIcrcBridge = async (baseTokenCanisterId: string) => {
    try {
      if (!icrcBridge) {
        const evmWallet = await getEthWallet();
        if (!evmWallet) return;

        const connector = Connector.create({
          bridges: ["icrc"],
          wallet: evmWallet,
          bitfinityWallet: window.ic.bitfinityWallet,
          network: {
            icHost,
            bftAddress: "0x3bd7f6a9305001fe6dce63d942f4e739440f6151",
            icrc: {
              baseTokenCanisterId:
                baseTokenCanisterId || "bkyz2-fmaaa-aaaaa-qaaaq-cai",
              iCRC2MinterCanisterId: "br5f7-7uaaa-aaaaa-qaaca-cai",
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
