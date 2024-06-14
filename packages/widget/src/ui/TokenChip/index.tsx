import { Box, HStack, Image, Text } from '@chakra-ui/react';
import { Bridge } from '../../provider/BridgeProvider';

type TokenChipProps = {
  bridge: Bridge;
  onClick?: () => void;
  target?: 'from' | 'destination';
};
export const TokenChip = ({ bridge, onClick, target }: TokenChipProps) => {
  const name = target === 'from' ? bridge.fromName : bridge.destinationName;
  const logo = target === 'from' ? bridge.fromLogo : bridge.destinationLogo;

  return (
    <HStack
      width="full"
      minW="70px"
      gap="8px"
      alignItems="center"
      justifyContent="space-between"
      borderRadius="20px"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="primary.alpha72"
      bgColor="secondary.alpha4"
      onClick={onClick}
      cursor="pointer"
    >
      <Image src={logo} width="24px" height="24px" />
      <Box paddingRight="8px">
        <Text textStyle="body2" fontWeight="bold" color="secondary.white">
          {name}
        </Text>
      </Box>
    </HStack>
  );
};
