import { Fragment, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Icon,
  Image,
  Slide,
  Text,
  VStack,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoClose } from "react-icons/io5";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWallets } from "../../hooks/useWallets";
import { useAccount } from "wagmi";
import { NETWORKS, NETWORK_SYMBOLS } from "../../utils";
import { shortenAddress } from "../../utils/network";
import { NetworkProp } from "../../types";

type WalletItemProps = {
  network: NetworkProp;
  address?: string;
  onDisconnect?: () => void;
};
const WalletItem = ({ network, address, onDisconnect }: WalletItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDisconnect = () => {
    onDisconnect?.();
  };

  return (
    <HStack
      width="full"
      paddingX={4}
      paddingY={2}
      justifyContent="space-between"
      borderRadius="8px"
      bg="light.secondary.alpha4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <HStack alignItems="center" paddingY={2} w="full">
        <Image src={network.logo} alt={network.name} width={10} height={10} />
        <VStack alignItems="flex-start" gap="0">
          <Text isTruncated textStyle="h6">
            {network.name}
          </Text>
          <Text color="secondary.alpha72" textStyle="body">
            {address}
          </Text>
        </VStack>
      </HStack>
      {isHovered && (
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      )}
    </HStack>
  );
};

type WalletItemType = {
  network: keyof typeof NETWORK_SYMBOLS;
  address?: string;
  onDisconnect?: () => void;
};
type WidgetWalletsProps = {
  isOpen: boolean;
  onClose: () => void;
};
export const WidgetWallets = ({ isOpen, onClose }: WidgetWalletsProps) => {
  const { openConnectModal } = useConnectModal();
  const {
    connectToIcWallet,
    isFetching: isFethcingICWallet,
    icWallet,
    disconnectIcWallet,
  } = useWallets();
  const {
    address: ethAddress,
    isConnected: isEthConnected,
    connector,
    isConnecting: isEthConnecting,
  } = useAccount();

  const breakpoint = useBreakpointValue({ base: "base", md: "md", lg: "lg" });
  const isBaseBreakpoint = breakpoint === "base";
  const closeIconColor = useColorModeValue("light.text.main", "dark.text.main");
  const pannelBgColor = useColorModeValue(
    "light.secondary.main",
    "dark.secondary.main"
  );

  const isWalletsPending = isFethcingICWallet || isEthConnecting;

  const disconnectICWallet = async () => {
    await disconnectIcWallet();
  };
  const disconnectEthWallet = async () => {
    await connector?.disconnect();
  };

  const connectWallets = async () => {
    if (openConnectModal) {
      await openConnectModal();
    }
    await connectToIcWallet();
  };

  const hasWallets = !!icWallet?.principal || (ethAddress && isEthConnected);

  const allWallets: WalletItemType[] = [
    ...(ethAddress && isEthConnected
      ? [
          {
            network: "BITFINITY" as const,
            address: shortenAddress(ethAddress.toLocaleLowerCase() || ""),
            onDisconnect: disconnectEthWallet,
          },
        ]
      : []),
    ...(icWallet?.principal
      ? [
          {
            network: "IC" as const,
            address: shortenAddress(
              icWallet.accountId?.toLocaleLowerCase() || ""
            ),
            onDisconnect: disconnectICWallet,
          },
        ]
      : []),
  ];

  return (
    <Fragment>
      {isOpen && (
        <Box
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
          bg={`light.secondary.alpha${isBaseBreakpoint ? "16" : "60"}`}
          backdropFilter={`blur(${isBaseBreakpoint ? "16px" : "32px"})`}
          onClick={onClose}
        />
      )}
      <Slide direction="bottom" in={isOpen} style={{ zIndex: 10 }}>
        <VStack
          width="full"
          gap="16px"
          padding={4}
          maxHeight={300}
          bg={pannelBgColor}
          boxShadow={isOpen ? "0 -16px 20px 0px rgba(0, 0, 0, 0.24)" : "none"}
        >
          <HStack width="full" justifyContent="space-between">
            <Text color="brand.100" fontWeight={600} fontSize="20px">
              Manage Wallets
            </Text>
            <Icon
              color={closeIconColor}
              h="28px"
              w="28px"
              onClick={onClose}
              cursor="pointer"
              size="48px"
              as={IoClose}
            />
          </HStack>
          <VStack w="full" paddingY={4} gap={4}>
            {!hasWallets ? (
              <VStack width="full" alignItems="center" justifyContent="center">
                <Text color="secondary.alpha72" textStyle="h5">
                  No wallet connected
                </Text>
              </VStack>
            ) : (
              <VStack width="full" gap="8px">
                {allWallets.map((wallet) => {
                  const network =
                    NETWORKS.find(
                      (item) =>
                        item.symbol.toLowerCase() ===
                        wallet.network?.toLowerCase()
                    ) || NETWORKS[0];

                  return (
                    <WalletItem
                      key={wallet.network}
                      network={network}
                      address={wallet.address}
                      onDisconnect={wallet.onDisconnect}
                    />
                  );
                })}
              </VStack>
            )}
            <Button
              isLoading={isWalletsPending}
              variant="solid"
              width="full"
              onClick={connectWallets}
            >
              Connect Wallets
            </Button>
          </VStack>
        </VStack>
      </Slide>
    </Fragment>
  );
};
