// import { useDisclosure } from "@chakra-ui/react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Principal } from "@dfinity/principal";
import { BitfinityWallet } from "@bitfinity-network/bitfinitywallet";

import { BITFINITY_INSTALLATION_URL, queryKeys } from "../utils";
// import { useAccount } from "wagmi";

// type IcWalletType = {
//   principal: Principal | null;
//   accountId: string | null;
// };
// type IcType = {
//   getPrincipal: () => Promise<Principal>;
//   getAccountID: () => Promise<string>;
// };
//
const icWalletId = "bitfinityWallet";
// // const emptyIcWallet: IcWalletType = { principal: null, accountId: null };
//
// const getPrincipalAndAccountId = async (): Promise<IcWalletType> => {
//   // const principal = await payload.getPrincipal();
//   // const accountId = await (window as any).ic[icWalletId].getAccountID();
//
//   return { principal, accountId };
// };

export const getIcWallet = (): BitfinityWallet => {
  const currentWallet = window.ic?.[icWalletId];

  if (!currentWallet) {
    throw new Error("No wallet is found");
  }

  return currentWallet;
};

export const disconnectIcWalletAsync = async () => {
  if (typeof window !== "undefined") {
    await getIcWallet().disconnect();
  }
};

export const connectToIcWalletAsync = async (
  whitelist: string[],
): Promise<boolean> => {
  try {
    const currentWallet = getIcWallet();

    const connected = await currentWallet.isConnected();

    if (connected) {
      return true;
    }

    try {
      await currentWallet.requestConnect({ whitelist });

      return true;
    } catch (_) {
      return false;
    }
  } catch (_) {
    if (typeof window !== "undefined") {
      window.open(BITFINITY_INSTALLATION_URL);
    }
  }

  return false;
};