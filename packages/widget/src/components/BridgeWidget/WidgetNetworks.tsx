import { HStack, Text, VStack, Button } from '@chakra-ui/react';
import { BridgeNetwork } from '@bitfinity-network/bridge';

import { useBridgeContext } from '../../provider/BridgeProvider.tsx';
import { CustomModal } from '../../ui/index.ts';

type NetworkItemProps = {
  network: BridgeNetwork;
  current: boolean;
  onSelect: (name: string) => void;
};

const NetworkItem = ({ network, current, onSelect }: NetworkItemProps) => {
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
        <VStack alignItems="flex-start" gap="0">
          <Text isTruncated textStyle="h6">
            {network.name}
          </Text>
        </VStack>
      </HStack>
      <Button
        variant={current ? 'solid' : 'outline'}
        size="sm"
        onClick={() => onSelect(network.name)}
        disabled={current}
      >
        {current ? 'Connected' : 'Select'}
      </Button>
    </HStack>
  );
};

export const WidgetNetworks = () => {
  const {
    bridgeNetworks,
    networksOpen,
    setNetworksOpen,
    switchNetwork,
    network: networkName
  } = useBridgeContext();

  return (
    <CustomModal
      modalHeaderProps={{ title: 'Manage Networks' }}
      isOpen={networksOpen}
      onClose={() => setNetworksOpen(false)}
      size="lg"
    >
      <VStack w="full" paddingY={4} gap={4}>
        <VStack width="full" gap="8px">
          {bridgeNetworks.map((network) => {
            return (
              <NetworkItem
                key={network.name}
                network={network}
                current={networkName === network.name}
                onSelect={switchNetwork}
              />
            );
          })}
        </VStack>
      </VStack>
    </CustomModal>
  );
};
