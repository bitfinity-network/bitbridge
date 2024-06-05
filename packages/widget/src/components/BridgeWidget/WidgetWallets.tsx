import { Fragment, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  Image,
  Slide,
  Text,
  VStack
} from '@chakra-ui/react';
import { IoClose } from 'react-icons/io5';

import {
  useWallets,
  useWalletsOpen,
  Wallet
} from '../../provider/BridgeProvider.tsx';

type WalletItemProps = {
  wallet: Wallet;
};

const WalletItem = ({ wallet }: WalletItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

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
        <Image src={wallet.logo} alt={wallet.name} width={10} height={10} />
        <VStack alignItems="flex-start" gap="0">
          <Text isTruncated textStyle="h6">
            {wallet.name}
          </Text>
          <Text color="secondary.alpha72" textStyle="body">
            {wallet.address}
          </Text>
        </VStack>
      </HStack>
      {isHovered && (
        <Button variant="outline" size="sm" onClick={wallet.toggle}>
          {wallet.connected ? 'Disconnect' : 'Connect'}
        </Button>
      )}
    </HStack>
  );
};

type WidgetWalletsProps = {
  isOpen: boolean;
  onClose: () => void;
};
export const WidgetWallets = ({ isOpen, onClose }: WidgetWalletsProps) => {
  const wallets = useWallets();

  return (
    <Fragment>
      {isOpen && (
        <Box
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
          bg="light.secondary.alpha60"
          backdropFilter="blur(32px)"
          onClick={onClose}
        />
      )}
      <Slide direction="bottom" in={isOpen} style={{ zIndex: 10 }}>
        <VStack
          width="full"
          gap="16px"
          padding={4}
          maxHeight={500}
          bg="secondary.main"
          boxShadow={isOpen ? '0 -16px 20px 0px rgba(0, 0, 0, 0.24)' : 'none'}
          overflowY="auto"
        >
          <HStack width="full" justifyContent="space-between">
            <Text color="brand.100" fontWeight={600} fontSize="20px">
              Manage Wallets
            </Text>
            <Icon
              color="text.main"
              h="28px"
              w="28px"
              onClick={onClose}
              cursor="pointer"
              size="48px"
              as={IoClose}
            />
          </HStack>
          <VStack w="full" paddingY={4} gap={4}>
            <VStack width="full" gap="8px">
              {wallets.map((wallet) => {
                return <WalletItem key={wallet.type} wallet={wallet} />;
              })}
            </VStack>
          </VStack>
        </VStack>
      </Slide>
    </Fragment>
  );
};
