import { Button, HStack, Image, Text, VStack } from '@chakra-ui/react';

import { useBridgeContext, Wallet } from '../../provider/BridgeProvider.tsx';
import { CustomModal } from '../../ui';
import { shortenAddress } from '../../utils';

type WalletItemProps = {
  wallet: Wallet;
};

const WalletItem = ({ wallet }: WalletItemProps) => {
  const isConnected = wallet.connected;

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
        <Image src={wallet.logo} alt={wallet.name} width={10} height={10} />
        <VStack alignItems="flex-start" gap="0">
          <Text isTruncated textStyle="h6">
            {wallet.name}
          </Text>

          {wallet.connected && wallet.chainMatch ? (
            <Text color="error.500" textStyle="body">
              Wrong chain, must be: {wallet.chainMatch}
            </Text>
          ) : (
            <Text color="secondary.alpha72" textStyle="body">
              {shortenAddress(wallet.address)}{' '}
            </Text>
          )}
        </VStack>
      </HStack>
      <Button
        variant={!isConnected ? 'solid' : 'outline'}
        size="sm"
        onClick={wallet.toggle}
        disabled={isConnected}
      >
        {isConnected ? 'Disconnect' : 'Connect'}
      </Button>
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
