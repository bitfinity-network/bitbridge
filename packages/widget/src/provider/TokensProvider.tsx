import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect
} from 'react';
import { useQueries } from '@tanstack/react-query';
import { BridgeType } from '@bitfinity-network/bridge';

import {
  WalletType,
  useBridgeContext,
  BRIDGE_TYPES,
  EthWalletData,
  IcWalletData
} from './BridgeProvider.tsx';
import { TokenListed, useTokenListsContext } from './TokensListsProvider.tsx';
import { fromFloating, IS_DEV } from '../utils';
import { reactQueryClient } from './ReactQuery.tsx';

export type TokensContext = {
  tokens: Token[];
  bridge: (token: Token, floatingAmount: number) => Promise<void>;
  isBridgingInProgress: boolean;
  nativeEthBalance: bigint;
};

const defaultCtx = {
  tokens: [],
  async bridge() {},
  isBridgingInProgress: false,
  nativeEthBalance: 0n
} as TokensContext;

const TokensContext = createContext<TokensContext>(defaultCtx);

export type TokenType = 'icrc' | 'btc' | 'rune' | 'eth' | 'evmc';

interface TokenBase {
  type: TokenType;
  wallet: WalletType;
  bridge: BridgeType;
  id: string;
  wrapped: string | undefined;
  name: string;
  symbol: string;
  decimals: number;
  fee: number;
  logo?: string;
  balance: bigint;
}

export interface TokenIcrc extends TokenBase {
  type: 'icrc';
  wallet: 'ic';
  bridge: 'icrc_evm';
}

export interface TokenEvmc extends TokenBase {
  type: 'evmc';
  wallet: 'eth';
  bridge: BridgeType;
}

export interface TokenBtc extends TokenBase {
  type: 'btc';
  wallet: 'btc';
  bridge: 'btc_evm';
}

export interface TokenRune extends TokenBase {
  type: 'rune';
  wallet: 'btc';
  bridge: 'rune_evm';
}

export type Token = TokenIcrc | TokenEvmc | TokenBtc | TokenRune;

export type TokenBalance = {
  id: string;
  balance: bigint;
};

const queriesCaching = {
  tokensPairs: {
    staleTime: IS_DEV ? 0 : 60 * 1000,
    gcTime: IS_DEV ? 0 : undefined
  },
  tokensUnlistedInfo: {
    staleTime: IS_DEV ? 0 : 60 * 1000,
    gcTime: IS_DEV ? 0 : undefined
  },
  tokensBalances: {
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 1000,
    staleTime: IS_DEV ? 0 : 1000,
    gcTime: IS_DEV ? 0 : undefined
  }
};

export const TokensProvider = ({ children }: { children: ReactNode }) => {
  const { wallets, bridges } = useBridgeContext();
  const { tokensListed } = useTokenListsContext();

  const [isBridgingInProgress, setIsBridgingInProgress] = useState(false);

  const ethWallet = wallets.find(({ type }) => type === 'eth') as
    | EthWalletData
    | undefined;
  const icWallet = wallets.find(({ type }) => type === 'ic') as
    | IcWalletData
    | undefined;

  const [nativeEthBalance, setNativeEthBalance] = useState(0n);

  const tokensPairsQueryResults = useQueries({
    queries: BRIDGE_TYPES.map((type) => ({
      enabled: !!bridges.find((bridge) => bridge.type === type),
      queryKey: ['tokens', 'pairs', type],
      queryFn: () =>
        bridges.find((bridge) => bridge.type === type)?.bridge.getTokensPairs(),
      ...queriesCaching.tokensPairs
    }))
  });

  const tokensPairs = useMemo(() => {
    return BRIDGE_TYPES.map((type) => {
      return {
        type,
        tokens: tokensPairsQueryResults[BRIDGE_TYPES.indexOf(type)].data ?? []
      };
    });
  }, [tokensPairsQueryResults]);

  const evmcUnlistedIds = useMemo(() => {
    const pairs = tokensPairs.reduce(
      (ids, { tokens }) => ids.concat(tokens.map((token) => token.wrapped)),
      [] as string[]
    );
    const listed = tokensListed
      .filter((token) => token.type === 'evmc')
      .map((token) => token.id);

    return pairs.filter(
      (pairId) => !listed.some((listedId) => pairId === listedId)
    );
  }, [tokensListed, tokensPairs]);

  const evmcUnlistedInfoQueryResults = useQueries({
    queries: evmcUnlistedIds.map((id) => ({
      queryKey: ['tokens', 'unlisted', 'info', id],
      enabled: !!bridges.find(
        ({ type }) =>
          type ===
          tokensPairs.find(({ tokens }) =>
            tokens.find(({ wrapped }) => wrapped === id)
          )?.type
      ),
      queryFn: async () => {
        const bridgeInfo = tokensPairs.find(({ tokens }) =>
          tokens.find(({ wrapped }) => wrapped === id)
        );

        if (!bridgeInfo) {
          throw new Error('Unreached');
        }

        const bridge = bridges.find(({ type }) => type === bridgeInfo.type);

        if (!bridge) {
          throw new Error('Unreached');
        }

        const { name, symbol, decimals } =
          await bridge.bridge.getWrappedTokenInfo(id);

        return {
          id,
          name,
          symbol,
          decimals,
          type: 'evmc',
          fee: 0
        } satisfies TokenListed;
      },
      ...queriesCaching.tokensUnlistedInfo
    }))
  });

  const evmcUnlistedInfo = evmcUnlistedInfoQueryResults
    .map((result) => result.data!)
    .filter((result) => !!result);

  const tokensMeta = useMemo(() => {
    const tokens: Token[] = [];

    tokensListed.concat(evmcUnlistedInfo).map((tokenListed) => {
      if (tokenListed.type === 'evmc') {
        const bridge = tokensPairs.find(({ tokens }) => {
          return tokens.some(({ wrapped }) => wrapped === tokenListed.id);
        });

        if (bridge) {
          const wrapped = bridge.tokens.find(
            ({ wrapped }) => wrapped === tokenListed.id
          );

          tokens.push({
            ...tokenListed,
            type: 'evmc',
            wallet: 'eth',
            bridge: bridge.type,
            id: tokenListed.id,
            wrapped: wrapped ? wrapped.base : undefined,
            balance: 0n
          });
        }
      }

      if (tokenListed.type === 'icrc') {
        const wrapped = tokensPairs
          .filter(({ type }) => type === 'icrc_evm')
          .map(({ tokens }) => tokens)
          .flat()
          .find(({ base }) => base === tokenListed.id);

        tokens.push({
          ...tokenListed,
          type: 'icrc',
          wallet: 'ic',
          bridge: 'icrc_evm',
          id: tokenListed.id,
          wrapped: wrapped ? wrapped.wrapped : undefined,
          balance: 0n
        });
      }

      // TODO: add handling for BTC and runes
    });

    return tokens;
  }, [tokensListed, evmcUnlistedInfo, tokensPairs]);

  const tokensBalancesQuery = useQueries({
    queries: tokensMeta.map((token) => ({
      enabled:
        !!bridges.find((bridge) => bridge.type === token.bridge) &&
        !!(ethWallet || icWallet),
      queryKey: ['tokens', 'balance', token.type, token.id],
      queryFn: async () => {
        const bridge = bridges.find(
          (bridge) => bridge.type === token.bridge
        )?.bridge;

        let balance = 0n;

        if (bridge) {
          if (token.type === 'evmc' && ethWallet) {
            balance = await bridge.getWrappedTokenBalance(
              token.id,
              ethWallet.address
            );
          }

          if (token.type === 'icrc' && icWallet) {
            balance = await bridge.getBaseTokenBalance(
              token.id,
              icWallet.address
            );
          }
        }

        return {
          id: token.id,
          balance
        } as TokenBalance;
      },
      placeholder: { id: token.id, balance: 0n } as TokenBalance,
      ...queriesCaching.tokensBalances
    }))
  });

  const tokensBalances = tokensBalancesQuery
    .map((result) => result.data!)
    .filter((result) => !!result);

  const tokens: Token[] = useMemo(() => {
    return tokensMeta
      .map((token) => {
        const tokenBalance = tokensBalances.find(
          (balance) => balance.id === token.id
        ) ?? {
          id: token.id,
          balance: 0n
        };

        return {
          ...token,
          ...tokenBalance
        };
      })
      .filter((token) => !!token);
  }, [tokensMeta, tokensBalances]);

  useEffect(() => {
    const checkBalance = async () => {
      const balance =
        (await ethWallet?.provider?.getBalance(ethWallet?.address)) ?? 0n;

      setNativeEthBalance(balance);
    };

    checkBalance();

    ethWallet?.provider?.on('block', checkBalance);

    return () => {
      ethWallet?.provider?.off('block', checkBalance);
    };
  }, [ethWallet, ethWallet?.provider]);

  const bridge = useCallback(
    async (token: Token, floatingAmount: number) => {
      if (nativeEthBalance <= 0) {
        return;
      }

      const from = token.type === 'evmc';

      const bridgeInfo = bridges.find((bridge) => bridge.type === token.bridge);
      if (!bridgeInfo) {
        return;
      }
      const { bridge } = bridgeInfo;

      const amount = fromFloating(floatingAmount, token.decimals);

      if (token.balance <= amount) {
        return;
      }

      let owner: string | undefined;
      let recipient: string | undefined;

      if (token.type === 'icrc') {
        recipient = ethWallet?.address;
      } else if (token.type === 'evmc') {
        recipient = icWallet?.address;
      }

      if (token.type === 'icrc') {
        owner = icWallet?.address;
      } else if (token.type === 'evmc') {
        owner = ethWallet?.address;
      }

      if (!(recipient && owner)) {
        return;
      }

      // All is ready start bridging itself
      setIsBridgingInProgress(true);

      try {
        if (!from) {
          let justWrapped: string | undefined;

          if (!token.wrapped) {
            justWrapped = await bridge.deployWrappedToken({
              id: token.id,
              name: token.name,
              symbol: token.symbol
            });
          }

          await bridge.bridgeToEvmc({
            token: token.id,
            recipient,
            owner,
            amount
          });

          // Adding wrapped ERC20 token to eth based wallets
          if (ethWallet?.watchAsset) {
            const wrapped = tokens.find(({ id }) => id === token.wrapped);

            let tokenInfo;

            if (wrapped) {
              tokenInfo = {
                address: wrapped.id,
                symbol: wrapped.symbol,
                image: wrapped.logo || token.logo || '',
                decimals: Number(wrapped.decimals)
              };
            } else if (justWrapped) {
              tokenInfo = {
                address: justWrapped,
                symbol: token.symbol,
                image: token.logo || '',
                decimals: Number(token.decimals)
              };
            }

            if (tokenInfo) {
              await ethWallet.watchAsset(tokenInfo);
            }
          }

          if (!token.wrapped) {
            await reactQueryClient.invalidateQueries({
              queryKey: ['tokens', 'pairs']
            });
          }
        } else {
          await bridge.bridgeFromEvmc({
            wrappedToken: token.id,
            recipient,
            amount
          });
        }
      } catch (err) {
        console.error('Error while bridging', err);
      }

      // Immediately invalidate bridged token old balance
      await reactQueryClient.invalidateQueries({
        queryKey: ['tokens', 'balance', token.type, token.id]
      });

      setIsBridgingInProgress(false);
    },
    [ethWallet, icWallet, bridges, nativeEthBalance, tokens]
  );

  const ctx: TokensContext = useMemo(() => {
    return {
      tokens,
      bridge,
      isBridgingInProgress,
      nativeEthBalance
    };
  }, [tokens, bridge, isBridgingInProgress, nativeEthBalance]);

  return (
    <TokensContext.Provider value={ctx}>{children}</TokensContext.Provider>
  );
};

export const useTokenContext = () => {
  return useContext(TokensContext);
};
