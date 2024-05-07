import { JsonRpcSigner } from "ethers";
import { ReactNode, createContext, useContext, useState } from "react";
import { getEvmWallet } from "../utils";

type TBridgeContext = {
  getEthWallet: () => Promise<JsonRpcSigner | undefined>;
};

const defaultValue: TBridgeContext = {
  getEthWallet: async () => undefined,
};

const BridgeContext = createContext<TBridgeContext>(defaultValue);

export const BridgeProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<JsonRpcSigner | undefined>();

  const getEthWallet = async () => {
    if (!wallet) {
      const evmWallet = await getEvmWallet();
      setWallet(evmWallet);
      return evmWallet;
    }
    return wallet;
  };

  return (
    <BridgeContext.Provider value={{ getEthWallet }}>
      {children}
    </BridgeContext.Provider>
  );
};

export const useBridgeContext = () => useContext(BridgeContext);
