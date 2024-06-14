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
import {
  BrdidgeNetworkUrl,
  BridgeType,
  BtcBridge,
  Connector,
  IcrcBridge,
  RuneBridge
} from '@bitfinity-network/bridge';
import * as ethers from 'ethers';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

import { BITFINITY_INSTALLATION_URL, createStore } from '../utils';
import BftIcon from '../assets/icons/bitfinity.svg';
import BtcIcon from '../assets/icons/bitcoin.svg';
import IcIcon from '../assets/icons/ic.svg';
import { useTokenListsContext } from './TokensListsProvider.tsx';

export const BRIDGE_TYPES: BridgeType[] = Object.values(BridgeType.enum);

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
  btc_evm: {
    name: 'BITCOIN <-> EVM',
    logo: BtcIcon
  },
  rune_evm: {
    name: 'RUNE <-> EVM',
    logo: BtcIcon
  }
};

export type EthWalletWatchAsset = (options: {
  address: string;
  symbol: string;
  decimals: number;
  image: string;
}) => Promise<void>;

export type WalletConnected = {
  eth?: {
    wallet: ethers.Signer;
    address: string;
    provider: ethers.BrowserProvider;
    watchAsset: EthWalletWatchAsset;
  };
  ic?: { wallet: BitfinityWallet; address: string };
  btc?: { wallet: boolean; address: string };
};

interface BaseWalletData {
  type: WalletType;
  connected: boolean;
  address: string;
  toggle: () => void;
}

export interface IcWalletData extends BaseWalletData {
  type: 'ic';
  wallet?: BitfinityWallet;
}

export interface EthWalletData extends BaseWalletData {
  type: 'eth';
  wallet?: ethers.Signer;
  provider?: ethers.BrowserProvider;
  watchAsset?: EthWalletWatchAsset;
}

interface BtcWalletData extends BaseWalletData {
  type: 'btc';
  wallet?: boolean;
}

export type WalletData = IcWalletData | EthWalletData | BtcWalletData;

export type Wallet = WalletInfo & WalletData;

interface BaseBridgeData {
  type: BridgeType;
}

interface IcBridgeData extends BaseBridgeData {
  type: 'icrc_evm';
  bridge: IcrcBridge;
}

interface BtcBridgeData extends BaseBridgeData {
  type: 'btc_evm';
  bridge: BtcBridge;
}

interface RuneBridgeData extends BaseBridgeData {
  type: 'rune_evm';
  bridge: RuneBridge;
}

export type BridgeData = IcBridgeData | BtcBridgeData | RuneBridgeData;

export type Bridge = BridgeData & BridgeInfo;

type BridgeContext = {
  wallets: Wallet[];
  bridges: Bridge[];
  isWalletConnectionPending: boolean;
  walletsOpen: boolean;
  setWalletsOpen: (open: boolean) => void;
  switchNetwork: (networkName: string) => void;
};

const defaultCtx = {
  bridgesReady: {}
} as unknown as BridgeContext;

const BridgeContext = createContext<BridgeContext>(defaultCtx);

type Storage = {
  icConnected?: boolean;
};

export type BridgeProviderProps = {
  network: string;
  networkUrls: BrdidgeNetworkUrl[];
  children: ReactNode;
};

const { setStorageItems, getStorage } = createStore<Storage>('bitbridge');

const ethWalletWatchAsset: EthWalletWatchAsset = async (options) => {
  return await window.ethereum.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options
    }
  });
};

const useEthWalletConnection = ({
  onConnect,
  onDisconnect
}: {
  onConnect: (
    wallet: ethers.Signer,
    provider: ethers.BrowserProvider,
    address: string
  ) => void;
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

        onConnect(signer, provider, ethAccount.address);
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
  isReady: boolean,
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
    if (!isReady || isConnectChecked.current) {
      return;
    }

    isConnectChecked.current = true;

    const { icConnected } = getStorage();

    if (icConnected) {
      onConnect(window.ic.bitfinityWallet).then(() => {});
    }
  }, [isReady, onConnect]);

  return {
    icWalletConnect,
    icWalletDisconnect,
    icPending: connectionPending
  };
};

export const BridgeProvider = ({
  network: netDefault,
  networkUrls,
  children
}: BridgeProviderProps) => {
  const { tokensListed } = useTokenListsContext();

  const [walletsOpen, setWalletsOpen] = useState(false);

  const [walletsConnected, setWalletsConnected] = useState(
    {} as WalletConnected
  );

  const isFetchedEffect = useRef(false);
  const [isFetched, setIsFetched] = useState(false);

  const [network, setNetwork] = useState(netDefault);

  const connector = useMemo(() => Connector.create(), []);

  const { ethWalletConnect, ethWalletDisconnect, ethPending } =
    useEthWalletConnection(
      useMemo(() => {
        return {
          onConnect(wallet, provider, address) {
            setWalletsConnected((prev) => ({
              ...prev,
              eth: {
                wallet,
                provider,
                address,
                watchAsset: ethWalletWatchAsset
              }
            }));
            connector.connectEthWallet(wallet);
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
      !!tokensListed.length && isFetched,
      useMemo(() => {
        return {
          async onConnect(wallet) {
            const whitelist = tokensListed
              .map((token) => {
                if (token.type !== 'icrc') {
                  return undefined!;
                }

                return token.id;
              })
              .filter((token) => !!token)
              .concat(connector.icWhiteList())
              .filter((v, i, a) => a.indexOf(v) === i);

            await wallet.requestConnect({ whitelist });
            const principal = await wallet.getPrincipal();

            setWalletsConnected((prev) => ({
              ...prev,
              ic: { wallet: wallet, address: principal.toText() }
            }));

            connector.connectBitfinityWallet(wallet);
          },
          async onDisconnect() {
            connector.disconnectBitfinityWallet();

            setWalletsConnected((prev) => ({ ...prev, ic: undefined }));
          }
        };
      }, [connector, tokensListed])
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
        provider: wallet && 'provider' in wallet ? wallet.provider : undefined,
        watchAsset:
          wallet && 'watchAsset' in wallet ? wallet.watchAsset : undefined,
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

  const networks = connector.getNetworks();

  const bridges = useMemo(() => {
    const ready: Bridge[] = [];

    if (!networks.some((n) => n.name === network)) {
      return ready;
    }

    if (walletsConnected.ic && walletsConnected.eth) {
      const bridge = connector.getBridge(network, 'icrc_evm');
      ready.push({ type: 'icrc_evm', bridge, ...BRIDGES_INFO.icrc_evm });
    }

    if (walletsConnected.btc && walletsConnected.eth) {
      const bridge = connector.getBridge(network, 'btc_evm');
      ready.push({ type: 'btc_evm', bridge, ...BRIDGES_INFO.btc_evm });
    }

    if (walletsConnected.btc && walletsConnected.eth) {
      const bridge = connector.getBridge(network, 'rune_evm');
      ready.push({ type: 'rune_evm', bridge, ...BRIDGES_INFO.rune_evm });
    }

    return ready;
  }, [connector, networks, walletsConnected, network]);

  const switchNetwork = useCallback((networkName: string) => {
    setNetwork(networkName);
  }, []);

  const isWalletConnectionPending = icPending || ethPending;

  // Networks fetching effect
  useEffect(() => {
    if (isFetchedEffect.current) {
      return;
    }

    isFetchedEffect.current = true;

    (async () => {
      await connector.fetch(networkUrls);
      setIsFetched(true);
    })();
  }, [connector, isFetchedEffect, networkUrls]);

  const ctx: BridgeContext = useMemo(() => {
    return {
      ...defaultCtx,
      bridges,
      network,
      walletsConnected,
      wallets,
      walletsOpen,
      isWalletConnectionPending,
      switchNetwork,
      setWalletsOpen
    };
  }, [
    bridges,
    network,
    walletsConnected,
    wallets,
    walletsOpen,
    switchNetwork,
    isWalletConnectionPending
  ]);

  return (
    <BridgeContext.Provider value={ctx}>{children}</BridgeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBridgeContext = () => useContext(BridgeContext);

export const useWallets = () => {
  const { wallets } = useBridgeContext();

  return wallets;
};

export const useWalletsOpen = () => {
  const wallets = useBridgeContext();

  return [wallets.walletsOpen, wallets.setWalletsOpen] as const;
};
