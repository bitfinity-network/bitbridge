import { useQuery } from "@tanstack/react-query";
import { TokenProp } from "../types";
import {
  NETWORK_SYMBOLS,
  getBftEvmTokens,
  getIcTokens,
  queryKeys,
  reactQueryClient,
} from "../utils";

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
