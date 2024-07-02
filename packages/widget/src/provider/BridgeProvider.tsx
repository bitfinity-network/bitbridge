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
  BridgeNetwork,
  BridgeType,
  BtcBridge,
  Connector,
  IcrcBridge,
  RuneBridge
} from '@bitfinity-network/bridge';
import * as ethers from 'ethers';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import {
  useConnectModal as useBtcConnectModal,
  useAccounts as useBtcAccounts
} from '@particle-network/btc-connectkit';

import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

import {
  BITFINITY_INSTALLATION_URL,
  getStorage,
  setStorageItems
} from '../utils';
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

export const WALLETS_INFO: Record<WalletType, WalletInfo> = {
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
    chain: number;
  };
  ic?: { wallet: BitfinityWallet; address: string };
  btc?: { wallet: boolean; address: string };
};

interface BaseWalletData {
  type: WalletType;
  chainMatch?: number;
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
  networkName: string;
  wallets: Wallet[];
  bridges: Bridge[];
  isWalletConnectionPending: boolean;
  walletsOpen: boolean;
  networksOpen: boolean;
  setWalletsOpen: (open: boolean) => void;
  setNetworksOpen: (open: boolean) => void;
  switchNetwork: (networkName: string) => void;
  bridgeNetworks: BridgeNetwork[];
};

const defaultCtx = {
  bridgesReady: {},
  wallets: [],
  bridges: [],
  bridgeNetworks: []
} as unknown as BridgeContext;

const BridgeContext = createContext<BridgeContext>(defaultCtx);

export type BridgeProviderProps = {
  network: string;
  networks: BridgeNetwork[];
  networkUrls: BrdidgeNetworkUrl[];
  children: ReactNode;
};

const ethWalletWatchAsset: EthWalletWatchAsset = async (options) => {
  const { addedAssets = [] } = getStorage();

  if (addedAssets.some((address) => address === options.address)) {
    return;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options
      }
    });

    addedAssets.push(options.address);
    setStorageItems({ addedAssets });
  } catch (_) {
    /* empty */
  }
};

const useEthWalletConnection = ({
  onConnect,
  onDisconnect,
  onChain
}: {
  onConnect: (
    wallet: ethers.Signer,
    provider: ethers.BrowserProvider,
    address: string,
    chain: number
  ) => void;
  onChain: (chain: number) => void;
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

        onConnect(signer, provider, ethAccount.address, ethAccount.chainId);
      })();
    }
  }, [
    ethAccountStatus,
    ethAccount.address,
    ethAccount.chainId,
    onConnect,
    onDisconnect
  ]);

  useEffect(() => {
    if (ethAccountStatus === 'connected') {
      if (ethAccount.chainId) {
        onChain(ethAccount.chainId);
      }
    }
  }, [ethAccountStatus, ethAccount.chainId, onChain]);

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

const useBtcWalletConnection = ({
  onConnect,
  onDisconnect
}: {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}) => {
  const { openConnectModal, disconnect } = useBtcConnectModal();
  const { accounts } = useBtcAccounts();

  const isConnectChecked = useRef(false);

  useEffect(() => {
    if (accounts.length) {
      if (isConnectChecked.current) {
        return;
      }

      isConnectChecked.current = true;

      onConnect(accounts[0]);
    }
  }, [accounts, onConnect]);

  const handleConnect = () => {
    isConnectChecked.current = false;
    openConnectModal();
  };

  const handleDisconnect = () => {
    disconnect();
    onDisconnect();
  };

  return {
    btcWalletConnect: handleConnect,
    btcWalletDisconnect: handleDisconnect,
    btcPending: false
  };
};

export const BridgeProvider = ({
  network: netDefault,
  networks,
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

  const [networkName, setNetworkName] = useState(netDefault);

  const connector = useMemo(() => {
    const connector = Connector.create();

    connector.addNetworks(networks);

    return connector;
  }, [networks]);

  const [networksOpen, setNetworksOpen] = useState(false);
  const [bridgeNetworks, setBridgeNetworks] = useState<BridgeNetwork[]>([]);

  const { ethWalletConnect, ethWalletDisconnect, ethPending } =
    useEthWalletConnection(
      useMemo(() => {
        return {
          onConnect(wallet, provider, address, chain) {
            setWalletsConnected((prev) => ({
              ...prev,
              eth: {
                wallet,
                provider,
                address,
                watchAsset: ethWalletWatchAsset,
                chain
              }
            }));
            connector.connectEthWallet(wallet);
          },
          onDisconnect() {
            setWalletsConnected((prev) => ({ ...prev, eth: undefined }));
            connector.disconnectEthWallet();
          },
          onChain(chain) {
            setWalletsConnected((prev) => {
              if (!prev.eth) {
                return prev;
              }
              if (prev.eth.chain === chain) {
                return prev;
              }

              return { ...prev, eth: { ...prev.eth, chain } };
            });
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

  const { btcWalletConnect, btcWalletDisconnect, btcPending } =
    useBtcWalletConnection(
      useMemo(() => {
        return {
          onConnect(address) {
            setWalletsConnected((prev) => ({
              ...prev,
              btc: {
                wallet: true,
                address
              }
            }));
          },
          onDisconnect() {
            setWalletsConnected((prev) => ({ ...prev, btc: undefined }));
          }
        };
      }, [])
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
        } else if (type === 'btc') {
          if (!walletsConnected.btc) {
            btcWalletConnect();
          } else {
            btcWalletDisconnect();
          }
        }
      };

      const provider =
        wallet && 'provider' in wallet ? wallet.provider : undefined;
      const watchAsset =
        wallet && 'watchAsset' in wallet ? wallet.watchAsset : undefined;

      const chainNet = bridgeNetworks.find(
        ({ name }) => name === networkName
      )?.ethCain;
      const chainWallet =
        wallet && 'chain' in wallet ? wallet.chain : undefined;

      const chainMatch =
        type === 'eth'
          ? chainNet === chainWallet
            ? undefined
            : chainNet
          : undefined;

      return {
        type,
        connected,
        wallet: wallet?.wallet,
        provider,
        watchAsset,
        chainMatch,
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
    icWalletDisconnect,
    bridgeNetworks,
    networkName
  ]);

  const bridges = useMemo(() => {
    const network = bridgeNetworks.find((n) => n.name === networkName);

    const ready: Bridge[] = [];

    if (!network) {
      return ready;
    }

    if (walletsConnected.ic && walletsConnected.eth) {
      const walletChain = walletsConnected.eth.chain;
      if (network.ethCain === walletChain) {
        const bridge = connector.getBridge(networkName, 'icrc_evm');
        ready.push({ type: 'icrc_evm', bridge, ...BRIDGES_INFO.icrc_evm });
      }
    }

    if (walletsConnected.btc && walletsConnected.eth) {
      // const bridge = connector.getBridge(networkName, 'btc_evm');
      // ready.push({ type: 'btc_evm', bridge, ...BRIDGES_INFO.btc_evm });
    }

    if (walletsConnected.btc && walletsConnected.eth) {
      // const bridge = connector.getBridge(networkName, 'rune_evm');
      // ready.push({ type: 'rune_evm', bridge, ...BRIDGES_INFO.rune_evm });
    }

    return ready;
  }, [connector, bridgeNetworks, walletsConnected, networkName]);

  const switchNetwork = useCallback((networkName: string) => {
    setNetworkName(networkName);
  }, []);

  const isWalletConnectionPending = icPending || ethPending || btcPending;

  // Networks fetching effect
  useEffect(() => {
    if (isFetchedEffect.current) {
      return;
    }

    isFetchedEffect.current = true;

    (async () => {
      await connector.fetch(networkUrls);
      setBridgeNetworks(connector.getNetworks());
      setIsFetched(true);
    })();
  }, [connector, isFetchedEffect, networkUrls]);

  const ctx: BridgeContext = useMemo(() => {
    return {
      ...defaultCtx,
      bridges,
      networkName,
      walletsConnected,
      wallets,
      walletsOpen,
      networksOpen,
      isWalletConnectionPending,
      bridgeNetworks,
      switchNetwork,
      setWalletsOpen,
      setNetworksOpen
    };
  }, [
    bridges,
    networkName,
    walletsConnected,
    wallets,
    walletsOpen,
    networksOpen,
    bridgeNetworks,
    switchNetwork,
    isWalletConnectionPending
  ]);

  return (
    <BridgeContext.Provider value={ctx}>{children}</BridgeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBridgeContext = () => useContext(BridgeContext);
