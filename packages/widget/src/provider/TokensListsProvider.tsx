import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import z from 'zod';

import { IS_DEV } from '../utils';

export type TokensListsContext = {
  tokensListed: TokenListed[];
  tokensListsPending: boolean;
  tokensListsError: boolean;
};

const defaultCtx = {
  tokensListed: [],
  tokensListsPending: false,
  tokensListsError: false
} as TokensListsContext;

const TokensListsContext = createContext<TokensListsContext>(defaultCtx);

export type TokenType = 'icrc' | 'btc' | 'rune' | 'evmc';

export type TokenListed = {
  type: TokenType;
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  fee: number;
  logo?: string;
};

const TokenBaseFetched = z.object({
  logo: z.string(),
  decimals: z.coerce.number(),
  name: z.string(),
  symbol: z.string()
});

const TokenIcFetched = TokenBaseFetched.extend({
  id: z.string(),
  fee: z.coerce.number(),
  standard: z.string()
});
type TokenIcFetched = z.infer<typeof TokenIcFetched>;

const TokenEthFetched = TokenBaseFetched.extend({
  address: z.string()
});
type TokenEthFetched = z.infer<typeof TokenEthFetched>;

const TokenFetched = z.union([TokenIcFetched, TokenEthFetched]);
type TokenFetched = z.infer<typeof TokenFetched>;

const TokensJsonFetched = z.object({
  tokens: z.array(TokenFetched)
});

async function fetchJson<T extends TokenFetched[]>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Http error: ${response.status}`);
  }

  const json = await response.json();

  return TokensJsonFetched.parse(json).tokens as T;
}

const fetchIcTokensLists = async (url: string): Promise<TokenListed[]> => {
  const icFetchedTokens = await fetchJson<TokenIcFetched[]>(url);

  const validStandards = ['icrc1', 'icrc2', 'icp'];

  return icFetchedTokens
    .filter(({ standard }) => validStandards.includes(standard.toLowerCase()))
    .map((token) => {
      return {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        fee: token.fee,
        type: 'icrc',
        logo: token.logo
      } satisfies TokenListed;
    });
};

const fetchEthTokensLists = async (url: string): Promise<TokenListed[]> => {
  const ethFetchedTokens = await fetchJson<TokenEthFetched[]>(url);

  return ethFetchedTokens.map((token) => {
    return {
      id: token.address,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      fee: 0,
      type: 'evmc',
      logo: token.logo
    } satisfies TokenListed;
  });
};

export type ListsUrl = { name: string; icUrl: string; ethUrl: string };

export interface TokenListsProviderProps {
  network?: string;
  listsUrls: ListsUrl[];
  tokensListed: TokenListed[];
  children: ReactNode;
}

export const TokensListsProvider = ({
  children,
  tokensListed,
  network,
  listsUrls
}: TokenListsProviderProps) => {
  const tokensListsQuery = useQueries({
    queries: listsUrls
      .filter(({ name }) => name === network)
      .flatMap((listUrl) => [
        { type: 'ic', url: listUrl.icUrl },
        { type: 'eth', url: listUrl.ethUrl }
      ])
      .map(({ url, type }) => ({
        queryKey: ['token-lists', url],
        queryFn: () =>
          type === 'ic' ? fetchIcTokensLists(url) : fetchEthTokensLists(url),
        staleTime: IS_DEV ? 0 : 60 * 1000,
        gcTime: IS_DEV ? 0 : undefined
      }))
  });

  const tokens = tokensListsQuery
    .map((result) => result.data!)
    .filter(result => !!result)
    .flat();

  const isLoading = tokensListsQuery.some((result) => result.isLoading);
  const isError = tokensListsQuery.some((result) => result.isError);

  const ctx: TokensListsContext = useMemo(() => {
    return {
      tokensListed: tokens.concat(tokensListed),
      tokensListsPending: isLoading,
      tokensListsError: isError
    };
  }, [tokens, isLoading, isError, tokensListed]);

  return (
    <TokensListsContext.Provider value={ctx}>
      {children}
    </TokensListsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTokenListsContext = () => {
  return useContext(TokensListsContext);
};
