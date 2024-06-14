import { Fragment, useState } from 'react';
import {
  Box,
  HStack,
  Icon,
  Slide,
  Text,
  VStack,
  useColorModeValue,
  Button
} from '@chakra-ui/react';
import { IoClose } from 'react-icons/io5';
import { BridgeNetwork } from '@bitfinity-network/bridge';

import { useBridgeContext } from '../../provider/BridgeProvider.tsx';

type NetworkItemProps = {
  network: BridgeNetwork;
  current: boolean;
  onSelect: (name: string) => void;
};

const NetworkItem = ({ network, current, onSelect }: NetworkItemProps) => {
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
        <VStack alignItems="flex-start" gap="0">
          <Text isTruncated textStyle="h6">
            {network.name}
          </Text>
        </VStack>
      </HStack>
      {isHovered && !current && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(network.name)}
        >
          Select
        </Button>
      )}
    </HStack>
  );
};

export const WidgetNetworks = () => {
  const closeIconColor = useColorModeValue('light.text.main', 'dark.text.main');
  const pannelBgColor = useColorModeValue(
    'light.secondary.main',
    'dark.secondary.main'
  );

  const {
    bridgeNetworks,
    networksOpen,
    setNetworksOpen,
    switchNetwork,
    network: networkName
  } = useBridgeContext();

  return (
    <Fragment>
      {networksOpen && (
        <Box
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
          bg="light.secondary.alpha60"
          backdropFilter="blur(32px)"
          onClick={() => setNetworksOpen(false)}
        />
      )}
      <Slide direction="bottom" in={networksOpen} style={{ zIndex: 10 }}>
        <VStack
          width="full"
          gap="16px"
          padding={4}
          maxHeight={500}
          bg={pannelBgColor}
          boxShadow={
            networksOpen ? '0 -16px 20px 0px rgba(0, 0, 0, 0.24)' : 'none'
          }
          overflowY="auto"
        >
          <HStack width="full" justifyContent="space-between">
            <Text color="brand.100" fontWeight={600} fontSize="20px">
              Manage Networks
            </Text>
            <Icon
              color={closeIconColor}
              h="28px"
              w="28px"
              onClick={() => setNetworksOpen(false)}
              cursor="pointer"
              size="48px"
              as={IoClose}
            />
          </HStack>
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
        </VStack>
      </Slide>
    </Fragment>
  );
};
