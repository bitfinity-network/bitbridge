import { TokenList } from "@infinityswapofficial/token-lists";
import { TokenProp } from "../types";

export const getIcTokens = async (cachedTokens: TokenProp[] = []) => {
  const tokenList = await TokenList.create();
  const tokens = tokenList?.tokens?.map((token) => token.toJSON()) ?? [];
  const validStandards = ["icp", "icrc1", "icrc2"];
  const icrcTokens = tokens.filter((token) => {
    const { id, name, logo, symbol, decimals, standard, fee } = token;
    if (validStandards.includes(standard.toLowerCase())) {
      return { id, name, symbol, decimals, logo, balance: 0, fee };
    }
  });
  const filteredCachedTokens = cachedTokens.filter(
    ({ standard }) =>
      standard && validStandards.includes(standard.toLowerCase())
  );
  return [...icrcTokens, ...filteredCachedTokens] || [];
};

export const getBftEvmTokens = (cachedTokens: TokenProp[] = []) => {};
