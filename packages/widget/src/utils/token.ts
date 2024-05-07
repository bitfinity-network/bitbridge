import { TokenList } from "@infinityswapofficial/token-lists";
import { TokenProp } from "../types";
import { IcConnector, Icrc1IDL, Icrc1Service } from "@bitfinity/ic";

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

export const searchIcrcToken = async (tokenPrincipal: string) => {
  try {
    const Ic = new IcConnector();
    const tokenActor = Ic.actor<Icrc1Service>(tokenPrincipal, Icrc1IDL);
    const metadata = await Promise.all([
      tokenActor.icrc1_name(),
      tokenActor.icrc1_symbol(),
      tokenActor.icrc1_decimals(),
      tokenActor.icrc1_fee(),
    ]);
    const [symbol, name, decimals, fee] = metadata;
    const newToken: TokenProp = {
      id: tokenPrincipal,
      name,
      symbol,
      decimals,
      // TODO:: get right standard
      standard: "icrc2",
      fee: Number(fee),
    };
    return newToken;
  } catch (error) {
    console.log("token search", error);
  }
};

export const getBftEvmTokens = (cachedTokens: TokenProp[] = []) => {};
