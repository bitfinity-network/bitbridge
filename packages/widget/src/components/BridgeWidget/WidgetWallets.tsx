import { useState } from 'react';
import { Button, HStack, Image, Text, VStack } from '@chakra-ui/react';

import { useBridgeContext, Wallet } from '../../provider/BridgeProvider.tsx';
import { CustomModal } from '../../ui/index.ts';

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

export const WidgetWallets = () => {
  const { wallets, walletsOpen, setWalletsOpen } = useBridgeContext();

  return (
    <CustomModal
      modalHeaderProps={{ title: 'Manage Wallets' }}
      isOpen={walletsOpen}
      onClose={() => setWalletsOpen(false)}
      size="lg"
    >
      <VStack w="full" paddingY={4} gap={4}>
        <VStack width="full" gap="8px">
          {wallets.map((wallet) => {
            return <WalletItem key={wallet.type} wallet={wallet} />;
          })}
        </VStack>
      </VStack>
    </CustomModal>
  );
};
