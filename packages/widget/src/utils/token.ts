import { TokenList } from "@infinityswapofficial/token-lists";
import { TGetIcTokenBalance, TokenProp, TokenSearchProps } from "../types";
import { createICRC1Actor } from "@bitfinity-network/bridge";
import { EVM_TOKENS_URL, NETWORK_SYMBOLS } from "./constants";
import TokenContractABI from "./abi/erc20.json";
import { ethers } from "ethers";
import { Principal } from "@dfinity/principal";
import { toDecimal } from "./bridge";

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
    const tokenActor = createICRC1Actor(Principal.fromText(tokenPrincipal), {
      agentOptions: {
        host: "http://127.0.0.1:4943",
      },
    });

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

export const searchErc20Token = async (
  contractAddress: string,
  rpcUrl: string
) => {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const tokenContract = new ethers.Contract(
      contractAddress,
      TokenContractABI,
      provider
    );
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ]);
    console.log(name, symbol, decimals);
    const newToken: TokenProp = {
      name: name.replace(/\u0000/g, ""),
      symbol: symbol.replace(/\u0000/g, ""),
      decimals,
      address: contractAddress,
      standard: "erc20",
    };

    return newToken;
  } catch (error) {
    console.error("Error:", error);
  }
};

export const searchToken = async (payload: TokenSearchProps) => {
  const { tokens, network, searchKey, rpcUrl } = payload;
  if (!searchKey) {
    return { tokens, cache: false };
  }
  const keys = ["name", "address", "symbol", "id"];
  const filteredData = tokens.filter((item) => {
    return keys.some((key) => {
      const value = item[key as keyof TokenProp];
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchKey.toLowerCase());
      }
      return false;
    });
  });
  if (filteredData.length) {
    return { tokens: filteredData, cache: false };
  }
  const token =
    network === NETWORK_SYMBOLS.BITFINITY
      ? await searchErc20Token(searchKey, rpcUrl)
      : await searchIcrcToken(searchKey);
  if (token) {
    return { tokens: [token], cache: true };
  }
  return { tokens: [], cache: false };
};
export const getBftEvmTokens = async (cachedTokens: TokenProp[] = []) => {
  try {
    const response = await fetch(EVM_TOKENS_URL);
    const tokenList = await response.json();
    const filteredCachedTokens = cachedTokens.filter(
      (token) => token.standard?.toLowerCase() === "erc20"
    );
    return [...tokenList.tokens, ...filteredCachedTokens] || [];
  } catch (_) {
    return [];
  }
};

export const importToken = async (address: string, rpcUrl: string) => {
  try {
    if (typeof window !== "undefined") {
      const token = await searchErc20Token(address, rpcUrl);
      await (window as any).ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: address,
            symbol: token?.symbol,
            decimals: Number(token?.decimals),
            image: token?.logo,
          },
        },
      });
    }
  } catch (error) {
    console.error("err", error);
  }
};

export const getIcTokenBalance = async ({
  tokenId,
  userPrincipal,
  decimals,
}: TGetIcTokenBalance) => {
  try {
    if (tokenId && userPrincipal) {
      const tokenActor = createICRC1Actor(Principal.fromText(tokenId), {
        agentOptions: {
          host: "http://127.0.0.1:4943",
        },
      });
      const balance = await tokenActor.icrc1_balance_of({
        owner: userPrincipal,
        subaccount: [],
      });
      return toDecimal(balance, decimals || 8);
    }
    return 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
};
