import { useAccount, useBalance } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TokenProp, TokenSearchProps, TokenSearchReturnProps } from "../types";
import {
  NETWORK_SYMBOLS,
  getBftEvmTokens,
  getIcTokenBalance,
  getIcTokens,
  queryKeys,
  reactQueryClient,
  searchToken,
} from "../utils";
import { useIcWalletConnet } from "./useWallets";
import { useBridgeContext } from "../provider/BridgeProvider";

const getTokens = async (
  tokenNetwork: string,
  cachedTokens: TokenProp[] = []
) => {
  try {
    if (tokenNetwork === NETWORK_SYMBOLS.IC) {
      return await getIcTokens(cachedTokens);
    }
    if (tokenNetwork === NETWORK_SYMBOLS.BITFINITY) {
      return await getBftEvmTokens(cachedTokens);
    }
    // return await getBtcTokens();
  } catch (_) {}
};

export const useErc20TokenBalance = (tokenAddress: `0x${string}`) => {
  const { address } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address,
    token: tokenAddress,
  });

  const balance = data?.formatted || "0";
  return { data, balance, isError, isLoading };
};

export const useIcTokenBalance = (token: TokenProp) => {
  const { icWallet } = useIcWalletConnet();
  const { data, isError, isLoading } = useQuery({
    queryKey: [queryKeys.tokenBalance, token.id],
    queryFn: async () =>
      getIcTokenBalance({
        tokenId: token.id,
        userPrincipal: icWallet?.principal,
        decimals: token.decimals,
      }),
    enabled: !!token.id && !!icWallet?.principal,
  });
  return { balance: data, isError, isLoading };
};

export const useTokens = (tokenNetwork: string) => {
  const { data } = useQuery({
    queryKey: [queryKeys.tokens, tokenNetwork],
    queryFn: async () => {
      const cachedData = await reactQueryClient.getQueryData<TokenProp[]>([
        queryKeys.cachedTokens,
      ]);
      return await getTokens(tokenNetwork, cachedData || []);
    },
  });
  return data || [];
};

export const useTokenSearch = ({
  searchKey,
  tokens,
  network,
  userPrincipal,
}: TokenSearchProps): TokenSearchReturnProps => {
  const { rpcUrl, icHost } = useBridgeContext();
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [queryKeys.searchTokens, tokens.length, searchKey],
    queryFn: async () =>
      await searchToken({
        tokens,
        network,
        searchKey,
        userPrincipal,
        rpcUrl,
        icHost,
      }),
    enabled: !!searchKey,
  });
  if (searchKey === "") {
    return { data: tokens, isLoading, isFetching };
  }
  if (data?.cache) {
    queryClient.setQueryData<TokenProp[]>(
      [queryKeys.cachedTokens],
      (cachedTokens) => {
        cachedTokens = cachedTokens ?? [];
        const newToken = data?.tokens[0];
        if (
          !cachedTokens.some(
            (token) =>
              token?.id === newToken?.id || token?.address === newToken?.address
          )
        ) {
          return [...cachedTokens, newToken];
        }
        return [...cachedTokens];
      }
    );
    queryClient.invalidateQueries({ queryKey: [queryKeys.tokens, network] });
  }
  return { data: data?.tokens || [], isLoading, isFetching };
};
