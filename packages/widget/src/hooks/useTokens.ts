import { TokenProp } from "../types";
import { NETWORK_SYMBOLS, getBftEvmTokens, getIcTokens } from "../utils";

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
