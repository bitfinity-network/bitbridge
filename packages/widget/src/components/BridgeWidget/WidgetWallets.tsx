import React from 'react';

import { Button, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { useBridgeContext, Wallet } from '../../provider/BridgeProvider.tsx';
import { CustomModal } from '../../ui/index.ts';
import { shortenAddress } from '../../utils/format.ts';

type WalletItemProps = {
  wallet: Wallet;
};

const WalletItem = React.memo(({ wallet }: WalletItemProps) => {
  const { connected, logo, name, address, toggle } = wallet;

  return (
    <HStack
      width="full"
      paddingX={4}
      paddingY={2}
      justifyContent="space-between"
      borderRadius="8px"
      bg="light.secondary.alpha4"
    >
      <HStack alignItems="center" paddingY={2} w="full">
        <Image src={logo} alt={name} width={10} height={10} />
        <VStack alignItems="flex-start" gap="0">
          <Text isTruncated textStyle="h6">
            {name}
          </Text>
          <Text color="secondary.alpha72" textStyle="body">
            {shortenAddress(address)}
          </Text>
        </VStack>
      </HStack>
      <Button
        variant={!connected ? 'solid' : 'outline'}
        size="sm"
        onClick={toggle}
        disabled={connected}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </Button>
    </HStack>
  );
});

export const WidgetWallets: React.FC = () => {
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
          {wallets.map((wallet) => (
            <WalletItem key={wallet.type} wallet={wallet} />
          ))}
        </VStack>
      </VStack>
    </CustomModal>
  );
};
