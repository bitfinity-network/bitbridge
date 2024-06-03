import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo
} from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  createICRC1Actor,
  wrappedTokenAbi,
  ICRC1
} from '@bitfinity-network/bridge';
import { Agent } from '@dfinity/agent';

import { WalletType, useBridgeContext } from './BridgeProvider.tsx';
import { fetchTokensLists, fetchInfo, fetchBalance } from '../utils';
import * as ethers from 'ethers';

export type TokensContext = {
  tokens: Token[];
  bridge: (token: Token, floatingAmount: number) => void;
};

const defaultCtx = {
  tokens: [],
  bridge() {}
} as TokensContext;

const TokensContext = createContext<TokensContext>(defaultCtx);

export type TokenType = 'icrc' | 'btc' | 'rune' | 'eth' | 'evmc';

interface TokenIdBase {
  type: TokenType;
  id: string;
  wallet: WalletType;
}

export interface TokenIdIcrc extends TokenIdBase {
  type: 'icrc';
  wallet: 'ic';
  actor: typeof ICRC1;
}

export interface TokenIdEvmc extends TokenIdBase {
  type: 'evmc';
  wallet: 'eth';
  contract: ethers.Contract;
}

export interface TokenIdBtc extends TokenIdBase {
  type: 'btc';
  wallet: 'btc';
}

export interface TokenIdRune extends TokenIdBase {
  type: 'rune';
  wallet: 'btc';
}

export type TokenId = TokenIdIcrc | TokenIdEvmc | TokenIdBtc | TokenIdRune;

export type TokenInfo = {
  type: TokenType;
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  fee: number;
  logo?: string;
};

export type TokenBalance = {
  id: string;
  balance: bigint;
};

export type Token = TokenInfo & TokenBalance;

export const TokensProvider = ({
  agent,
  children
}: {
  agent: Agent;
  children: ReactNode;
}) => {
  const {
    tokens: bridgedTokens,
    wallets,
    bridgeToEvmc,
    bridgeFromEvmc
  } = useBridgeContext();

  const { data: tokensInfoLists } = useQuery({
    queryKey: ['token-lists'],
    queryFn: fetchTokensLists,
    staleTime: 120,
    gcTime: 120 * 10
  });

  const tokensIds = useMemo(() => {
    const ids: TokenId[] = [];

    bridgedTokens.map((token) => {
      const ethWallet = wallets.find((wallet) => wallet.type === 'eth');

      if (ethWallet && ethWallet.type === 'eth') {
        const contract = new ethers.Contract(
          token.wrappedTokenAddress,
          wrappedTokenAbi,
          ethWallet.wallet
        );

        ids.push({
          type: 'evmc',
          wallet: 'eth',
          id: token.wrappedTokenAddress,
          contract
        });
      }

      if (token.type === 'icrc') {
        const actor = createICRC1Actor(token.baseTokenCanisterId, { agent });

        ids.push({
          type: 'icrc',
          wallet: 'ic',
          id: token.baseTokenCanisterId,
          actor
        });
      } else if (token.type === 'btc') {
        ids.push({ type: 'btc', wallet: 'btc', id: token.btcBridgeCanisterId });
      } else if (token.type === 'rune') {
        ids.push({ type: 'rune', wallet: 'btc', id: token.runeId });
      }
    });

    return ids;
  }, [bridgedTokens, wallets, agent]);

  const tokensUnlisted = useMemo(() => {
    return tokensIds.filter(({ id }) =>
      tokensInfoLists?.find((token) => token.id !== id)
    );
  }, [tokensIds, tokensInfoLists]);

  const tokensInfoQueryResults = useQueries({
    queries: tokensUnlisted.map((token) => ({
      enabled:
        wallets.find((wallet) => wallet.type === token.type)?.connected &&
        !!tokensInfoLists,
      queryKey: ['tokens', token.type, 'info', token.id],
      queryFn: () =>
        fetchInfo(wallets.find((wallet) => wallet.type === token.type)!, token),
      staleTime: 0,
      gcTime: 0
    }))
  });

  const tokensInfo = tokensInfoQueryResults
    .map((result) => result.data!)
    .filter((result) => !!result);

  const tokensBalancesQuery = useQueries({
    queries: tokensIds.map((token) => ({
      enabled: wallets.find((wallet) => wallet.type === token.wallet)
        ?.connected,
      queryKey: ['tokens', token.type, 'balance', token.id],
      queryFn: () =>
        fetchBalance(
          wallets.find((wallet) => wallet.type === token.wallet)!,
          token
        ),
      placeholder: { id: token.id, balance: 0n } as TokenBalance,
      staleTime: 0,
      gcTime: 0
    }))
  });

  const tokensBalances = tokensBalancesQuery
    .map((result) => result.data!)
    .filter((result) => !!result);

  // console.log('tokensIds', tokensIds);
  //
  // console.log('tokensInfo', tokensInfo);
  //
  // console.log('tokensBalances', tokensBalances);

  const tokens = useMemo(() => {
    return tokensIds
      .map(({ id }) => {
        const tokenInfo =
          tokensInfo.find((token) => token.id === id) ||
          tokensInfoLists?.find((token) => token.id === id);

        if (!tokenInfo) {
          return undefined!;
        }

        const tokenBalance = tokensBalances.find(
          (token) => token.id === id
        ) || {
          id,
          balance: 0n
        };

        return {
          ...tokenInfo,
          ...tokenBalance
        };
      })
      .filter((token) => !!token);
  }, [tokensIds, tokensInfo, tokensInfoLists, tokensBalances]);

  const bridge = useCallback(
    async (token: Token, floatingAmount: number) => {
      let from = false;

      const bridged = bridgedTokens.find((bridged) => {
        if (bridged.type === 'icrc' && token.type === 'icrc') {
          return token.id == bridged.baseTokenCanisterId;
        } else if (token.type === 'evmc') {
          from = true;
          return token.id === bridged.wrappedTokenAddress;
        }
      });

      if (!bridged) {
        return;
      }

      const amount = BigInt(Math.round(floatingAmount * token.decimals));

      if (!from) {
        bridgeToEvmc(bridged, amount);
      } else {
        bridgeFromEvmc(bridged, amount);
      }
    },
    [bridgedTokens, bridgeToEvmc, bridgeFromEvmc]
  );

  const ctx: TokensContext = useMemo(() => {
    return {
      tokens,
      bridge
    };
  }, [tokens, bridge]);

  return (
    <TokensContext.Provider value={ctx}>{children}</TokensContext.Provider>
  );
};

export const useTokenContext = () => {
  return useContext(TokensContext);
};
