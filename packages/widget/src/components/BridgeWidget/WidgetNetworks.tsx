import { HStack, Text, VStack, Button, Box } from '@chakra-ui/react';
import { BridgeNetwork } from '@bitfinity-network/bridge';
import { useBridgeContext } from '../../provider/BridgeProvider.tsx';
import { CustomModal } from '../../ui/index.ts';
import React, { useCallback } from 'react';

type NetworkItemProps = {
  network: BridgeNetwork;
  current: boolean;
  onSelect: (name: string) => void;
};

const NetworkItem = React.memo(
  ({ network, current, onSelect }: NetworkItemProps) => {
    const handleSelect = useCallback(
      () => onSelect(network.name),
      [onSelect, network.name]
    );

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
            <HStack>
              <Box w="12px" h="12px" bg="primary.main" borderRadius="full" />
              <Text isTruncated textStyle="h6" fontWeight="bold">
                {network.name}
              </Text>
            </HStack>
          </VStack>
        </HStack>
        <Button
          variant={current ? 'solid' : 'outline'}
          size="sm"
          onClick={handleSelect}
          disabled={current}
        >
          {current ? 'Connected' : 'Select'}
        </Button>
      </HStack>
    );
  }
);

export const WidgetNetworks: React.FC = () => {
  const {
    bridgeNetworks,
    networksOpen,
    setNetworksOpen,
    switchNetwork,
    networkName
  } = useBridgeContext();

  return (
    <CustomModal
      modalHeaderProps={{ title: 'Manage Networks' }}
      isOpen={networksOpen}
      onClose={() => setNetworksOpen(false)}
      size="lg"
      modalContentProps={{
        width: '500px',
        height: 'auto',
        borderRadius: '20px',
        overflowY: 'hidden'
      }}
    >
      <VStack
        w="full"
        paddingY={4}
        gap={4}
        marginTop={4}
        borderTop="1px solid"
        borderColor="bg.border"
      >
        <VStack width="full" gap="8px">
          {bridgeNetworks.map((network) => (
            <NetworkItem
              key={network.name}
              network={network}
              current={networkName === network.name}
              onSelect={switchNetwork}
            />
          ))}
        </VStack>
      </VStack>
    </CustomModal>
  );
};
