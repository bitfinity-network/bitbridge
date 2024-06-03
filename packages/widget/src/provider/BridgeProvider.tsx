import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { BridgeToken, FetchUrl } from '@bitfinity-network/bridge-tokens';
import { Connector, IcrcBridge } from '@bitfinity-network/bridge';
import { Agent } from '@dfinity/agent';

import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { BITFINITY_INSTALLATION_URL } from '../utils';
import * as ethers from 'ethers';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

import BftIcon from '../assets/icons/bitfinity.svg';
import BtcIcon from '../assets/icons/bitcoin.svg';
import IcIcon from '../assets/icons/ic.svg';

const BRIDGE_TYPES = ['icrc_evm', 'btc_emv', 'rune_evm'] as const;
export type BridgeType = (typeof BRIDGE_TYPES)[number];

const WALLET_TYPES = ['eth', 'btc', 'ic'] as const;
export type WalletType = (typeof WALLET_TYPES)[number];

export type WalletInfo = {
  name: string;
  logo: string;
  symbol: string;
};

const WALLETS_INFO: Record<WalletType, WalletInfo> = {
  eth: {
    name: 'BITFINITY EVM',
    logo: BftIcon,
    symbol: 'eth'
  },
  btc: {
    name: 'BITCOIN',
    logo: BtcIcon,
    symbol: 'btc'
  },
  ic: {
    name: 'INTERNET COMPUTER',
    logo: IcIcon,
    symbol: 'ic'
  }
};

export type BridgeInfo = {
  name: string;
  logo: string;
};

const BRIDGES_INFO: Record<BridgeType, BridgeInfo> = {
  icrc_evm: {
    name: 'ICRC <-> EVM',
    logo: BftIcon
  },
  btc_emv: {
    name: 'BITCOIN <-> EVM',
    logo: BtcIcon
  },
  rune_evm: {
    name: 'RUNE <-> EVM',
    logo: BtcIcon
  }
};

export type WalletConnected = {
  eth?: { wallet: ethers.Signer; address: string };
  ic?: { wallet: BitfinityWallet; address: string };
  btc?: { wallet: boolean; address: string };
};

interface BaseWalletData {
  type: WalletType;
  connected: boolean;
  address: string;
  toggle: () => void;
}

interface IcWalletData extends BaseWalletData {
  type: 'ic';
  wallet?: BitfinityWallet;
}

interface EthWalletData extends BaseWalletData {
  type: 'eth';
  wallet?: ethers.Signer;
}

interface BtcWalletData extends BaseWalletData {
  type: 'btc';
  wallet?: boolean;
}

export type WalletData = IcWalletData | EthWalletData | BtcWalletData;

export type Wallet = WalletInfo & WalletData;

export type Bridge = {
  type: BridgeType;
} & BridgeInfo;

type BridgeContext = {
  wallets: Wallet[];
  bridges: Bridge[];
  tokens: BridgeToken[];
  isWalletConnectionPending: boolean;
  isBridgingInProgress: boolean;
  walletsOpen: boolean;
  setWalletsOpen: (open: boolean) => void;
  bridgeToEvmc: (token: BridgeToken, amount: bigint) => void;
  bridgeFromEvmc: (token: BridgeToken, amount: bigint) => void;
};

const defaultCtx = {
  bridgesReady: {}
} as unknown as BridgeContext;

const BridgeContext = createContext<BridgeContext>(defaultCtx);

type Storage = {
  icConnected?: boolean;
};

export type BridgeOptions = {
  agent: Agent;
  isFetchLocal?: boolean;
  fetchDefaults?: 'testnet' | 'mainnet';
  fetchUrls?: FetchUrl[];
  children: ReactNode;
};

const setStorageItems = (items: Partial<Storage>) => {
  const prev = getStorage();

  localStorage.setItem('bitbridge', JSON.stringify({ ...prev, ...items }));
};

const getStorage = (): Storage => {
  if (typeof localStorage === 'undefined') {
    return {} as Storage;
  }

  try {
    return JSON.parse(localStorage.getItem('bitbridge') || '{}') as Storage;
  } catch (_) {
    return {} as Storage;
  }
};

const useEthWalletConnection = ({
  onConnect,
  onDisconnect
}: {
  onConnect: (wallet: ethers.Signer, address: string) => void;
  onDisconnect: () => void;
}) => {
  const ethAccount = useAccount();
  const ethAccountStatus = ethAccount.status;
  const { disconnect: ethDisconnect } = useDisconnect();
  const { openConnectModal, connectModalOpen } = useConnectModal();

  const ethWalletConnect = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  const ethWalletDisconnect = useCallback(() => {
    ethDisconnect();
  }, [ethDisconnect]);

  useEffect(() => {
    if (ethAccountStatus === 'connecting') {
      return;
    }

    if (ethAccountStatus === 'disconnected') {
      onDisconnect();
      return;
    }

    if (ethAccountStatus === 'connected') {
      (async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        onConnect(signer, ethAccount.address);
      })();
    }
  }, [ethAccountStatus, ethAccount.address, onConnect, onDisconnect]);

  return {
    ethWalletConnect,
    ethWalletDisconnect,
    ethPending: connectModalOpen
  };
};

const useIcWalletConnection = (
  isBridged: boolean,
  {
    onConnect,
    onDisconnect
  }: {
    onConnect: (wallet: BitfinityWallet) => Promise<void>;
    onDisconnect: () => Promise<void>;
  }
) => {
  const isConnectChecked = useRef(false);
  const [connectionPending, setConnectionPending] = useState(false);

  const icWalletConnect = useCallback(async () => {
    if (!(window.ic && window.ic.bitfinityWallet)) {
      window.open(BITFINITY_INSTALLATION_URL);
      return;
    }

    setConnectionPending(true);

    await onConnect(window.ic.bitfinityWallet);

    setStorageItems({ icConnected: true });

    setConnectionPending(false);
  }, [onConnect]);

  const icWalletDisconnect = useCallback(async () => {
    await window.ic.bitfinityWallet.disconnect();
    await onDisconnect();

    setStorageItems({ icConnected: false });
  }, [onDisconnect]);

  useEffect(() => {
    if (!isBridged || isConnectChecked.current) {
      return;
    }

    isConnectChecked.current = true;

    const { icConnected } = getStorage();

    if (icConnected) {
      onConnect(window.ic.bitfinityWallet).then(() => {});
    }
  }, [isBridged, onConnect]);

  return {
    icWalletConnect,
    icWalletDisconnect,
    icPending: connectionPending
  };
};

export const BridgeProvider = ({
  agent,
  isFetchLocal,
  fetchDefaults,
  fetchUrls,
  children
}: BridgeOptions) => {
  const [walletsOpen, setWalletsOpen] = useState(true);

  const [walletsConnected, setWalletsConnected] = useState(
    {} as WalletConnected
  );
  const [isBridgingInProgress, setIsBridgingInProgress] = useState(false);

  const isFetchedEffect = useRef(false);
  const [isFetched, setIsFetched] = useState(false);
  const [isBridged, setIsBridged] = useState(false);
  const [allBridgedTokens, setAllBridgedTokens] = useState<BridgeToken[]>([]);

  const connector = useMemo(() => Connector.create({ agent }), [agent]);

  const { ethWalletConnect, ethWalletDisconnect, ethPending } =
    useEthWalletConnection(
      useMemo(() => {
        return {
          onConnect(eth, address) {
            setWalletsConnected((prev) => ({
              ...prev,
              eth: { wallet: eth, address }
            }));
            connector.connectEthWallet(eth);
          },
          onDisconnect() {
            setWalletsConnected((prev) => ({ ...prev, eth: undefined }));
            connector.disconnectEthWallet();
          }
        };
      }, [connector])
    );

  const { icWalletConnect, icWalletDisconnect, icPending } =
    useIcWalletConnection(
      isBridged,
      useMemo(() => {
        return {
          async onConnect(ic) {
            const whitelist = connector.icWhiteList();

            await ic.requestConnect({ whitelist });
            const principal = await ic.getPrincipal();

            setWalletsConnected((prev) => ({
              ...prev,
              ic: { wallet: ic, address: principal.toText() }
            }));

            connector.connectBitfinityWallet(ic);
          },
          async onDisconnect() {
            connector.disconnectBitfinityWallet();

            setWalletsConnected((prev) => ({ ...prev, ic: undefined }));
          }
        };
      }, [connector])
    );

  const wallets = useMemo(() => {
    return WALLET_TYPES.map((type) => {
      const connected = !!walletsConnected[type];
      const wallet = walletsConnected[type];
      const address = wallet?.address || '';
      const info = WALLETS_INFO[type];

      const toggle = () => {
        if (type === 'eth') {
          if (!walletsConnected.eth) {
            ethWalletConnect();
          } else {
            ethWalletDisconnect();
          }
        } else if (type === 'ic') {
          if (!walletsConnected.ic) {
            icWalletConnect().then(() => {});
          } else {
            icWalletDisconnect().then(() => {});
          }
        }
      };

      return {
        type,
        connected,
        wallet: wallet?.wallet,
        address,
        toggle,
        ...info
      } as Wallet;
    });
  }, [
    walletsConnected,
    ethWalletConnect,
    ethWalletDisconnect,
    icWalletConnect,
    icWalletDisconnect
  ]);

  const bridges = useMemo(() => {
    const ready: Bridge[] = [];

    if (walletsConnected.ic && walletsConnected.eth) {
      ready.push({ type: 'icrc_evm', ...BRIDGES_INFO.icrc_evm });
    }

    if (walletsConnected.btc && walletsConnected.eth) {
      ready.push({ type: 'btc_emv', ...BRIDGES_INFO.btc_emv });
    }

    if (walletsConnected.btc && walletsConnected.eth) {
      ready.push({ type: 'rune_evm', ...BRIDGES_INFO.rune_evm });
    }

    return ready;
  }, [walletsConnected]);

  const tokens = useMemo(() => {
    return allBridgedTokens.filter((token) => {
      const types = [];

      if (walletsConnected.ic) {
        types.push('icrc');
      }
      if (walletsConnected.eth) {
        types.push('eth');
      }
      if (walletsConnected.btc) {
        types.push('btc');
      }

      return types.includes(token.type);
    });
  }, [walletsConnected, allBridgedTokens]);

  const isWalletConnectionPending = icPending || ethPending;

  // Tokens fetching effect
  useEffect(() => {
    if (isFetchedEffect.current) {
      return;
    }

    isFetchedEffect.current = true;

    (async () => {
      isFetchLocal = true; // TODO: TMP
      if (isFetchLocal) {
        console.warn('For dev usage only');
        await connector.fetchLocal();
      }

      if (fetchDefaults) {
        await connector.fetchDefault(fetchDefaults);
      }

      if (fetchUrls) {
        await connector.fetch(fetchUrls);
      }

      setIsFetched(true);
    })();
  }, [connector, isFetchedEffect, fetchDefaults, fetchUrls, isFetchLocal]);

  // Tokens bridging
  useEffect(() => {
    if (!isFetched) {
      return;
    }

    (async () => {
      const allFetchedBridged = await connector.bridge();
      if (allFetchedBridged) {
        setIsBridged(true);
        setAllBridgedTokens([...connector.getBridgedTokens()]);
      }
    })();
  }, [connector, walletsConnected.eth, isFetched]);

  const bridgeToEvmc = useCallback(
    async (token: BridgeToken, amount: bigint) => {
      const bridge = connector.getBridge(token.wrappedTokenAddress);

      if (!bridge) {
        return;
      }

      const eth = walletsConnected.eth;
      const ic = walletsConnected.ic;

      console.log('bridge', !!bridge, !!eth, !!ic);

      if (bridge instanceof IcrcBridge) {
        if (!(eth && ic)) {
          return;
        }

        setIsBridgingInProgress(true);

        try {
          await bridge.bridgeToEvmc(ic.address, eth.address, amount);
        } catch (_) {
          console.error(_);
          /* empty */
        }

        setIsBridgingInProgress(false);
      }
    },
    [connector, walletsConnected]
  );

  const bridgeFromEvmc = useCallback(
    async (token: BridgeToken, amount: bigint) => {
      const bridge = connector.getBridge(token.wrappedTokenAddress);

      if (!bridge) {
        return;
      }

      const eth = walletsConnected.eth;
      const ic = walletsConnected.ic;

      if (bridge instanceof IcrcBridge) {
        if (!(eth && ic)) {
          return;
        }

        setIsBridgingInProgress(true);

        try {
          await bridge.bridgeFromEvmc(ic.address, amount);
        } catch (_) {
          /* empty */
        }

        setIsBridgingInProgress(false);
      }
    },
    [connector, walletsConnected]
  );

  const ctx: BridgeContext = useMemo(() => {
    return {
      ...defaultCtx,
      bridges,
      tokens,
      walletsConnected,
      wallets,
      walletsOpen,
      bridgeToEvmc,
      bridgeFromEvmc,
      isWalletConnectionPending,
      isBridgingInProgress,
      setWalletsOpen
    };
  }, [
    bridges,
    tokens,
    walletsConnected,
    wallets,
    walletsOpen,
    bridgeToEvmc,
    bridgeFromEvmc,
    isWalletConnectionPending,
    isBridgingInProgress
  ]);

  return (
    <BridgeContext.Provider value={ctx}>{children}</BridgeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBridgeContext = () => useContext(BridgeContext);

export const useBridgedTokens = () => {
  const { tokens } = useBridgeContext();

  return tokens;
};

export const useWallets = () => {
  const { wallets } = useBridgeContext();

  return wallets;
};

export const useWalletsOpen = () => {
  const wallets = useBridgeContext();

  return [wallets.walletsOpen, wallets.setWalletsOpen] as const;
};
