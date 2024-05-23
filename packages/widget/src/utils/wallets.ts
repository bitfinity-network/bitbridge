import { BitfinityWallet } from "@bitfinity-network/bitfinitywallet";

import { BITFINITY_INSTALLATION_URL } from "./constants.ts";

const icWalletId = "bitfinityWallet";

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
