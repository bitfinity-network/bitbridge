import { BITFINITY_INSTALLATION_URL, queryKeys } from "../utils";
import { useDisclosure } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Principal } from "@dfinity/principal";
// import { useAccount } from "wagmi";

type IcWalletType = {
  principal: Principal | null;
  accountId: string | null;
};
type IcType = {
  getPrincipal: () => Promise<Principal>;
  getAccountID: () => Promise<string>;
};

const icWalletId = "bitfinityWallet";
const emptyIcWallet: IcWalletType = { principal: null, accountId: null };

const getPrincipalAndAccountId = async (
  payload: IcType
): Promise<IcWalletType> => {
  const principal = await payload.getPrincipal();
  const accountId = await (window as any).ic[icWalletId].getAccountID();
  return { principal, accountId };
};

export const getIcWallet = async () => {
  if (typeof window !== "undefined") {
    const currentWallet = (window as any).ic?.[icWalletId];

    if (currentWallet) {
      return await getPrincipalAndAccountId(currentWallet);
    }
  }
  return emptyIcWallet;
};

const disconnectIcWalletAsync = () => {
  if (typeof window !== "undefined") {
    (window as any)?.ic[icWalletId]?.disconnect();
  }
  return emptyIcWallet;
};
const connectToIcWalletAsync = async () => {
  try {
    if (typeof window !== "undefined") {
      const currentWallet = (window as any).ic?.["bitfinityWallet"];

      if (currentWallet) {
        const connected = await currentWallet.isConnected();
        if (connected) {
          return await getPrincipalAndAccountId(currentWallet);
        }
        const result = await currentWallet.requestConnect();
        const connectionState = result ? "allowed" : "denied";
        if (connectionState === "allowed") {
          return await getPrincipalAndAccountId(currentWallet);
        } else {
          // 'User Rejected Request'
          return emptyIcWallet;
        }
      } else {
        if (typeof window !== "undefined") {
          window.open(BITFINITY_INSTALLATION_URL);
        }
      }
    }
  } catch (error) {
    return emptyIcWallet;
  }
};

export const useIcWalletConnet = () => {
  const walletQueryKey = [queryKeys.icWallet];
  const queryClient = useQueryClient();

  const { data: icWallet, refetch } = useQuery({
    queryKey: walletQueryKey,
    queryFn: async () => {
      return await getIcWallet();
    },
  });
  const { mutate: connectToIcWallet } = useMutation({
    mutationFn: async () => {
      return await connectToIcWalletAsync();
    },
    onSuccess: (response) => {
      queryClient.setQueryData<IcWalletType>(walletQueryKey, () => {
        return response;
      });
    },
  });
  const { mutate: disconnectIcWallet } = useMutation({
    mutationFn: async () => {
      return await disconnectIcWalletAsync();
    },
    onSuccess: (response) => {
      queryClient.setQueryData<IcWalletType>(walletQueryKey, () => {
        return response;
      });
    },
  });
  return {
    connectToIcWallet,
    icWallet,
    refetchIcWallet: refetch,
    disconnectIcWallet,
  };
};

export const useWallets = () => {
  const icWalletHook = useIcWalletConnet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  //const { accounts } = useAccounts();
  //const { address } = useAccount();

  return {
    isOpen,
    onOpen,
    onClose,
    // btcAccounts: accounts,
    //ethAccounts: address ? [address] : [],
    ...icWalletHook,
  };
};
