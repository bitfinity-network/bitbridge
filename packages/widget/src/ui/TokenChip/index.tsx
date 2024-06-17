import { Box, HStack, Image, Text } from '@chakra-ui/react';
import { Token } from '../../provider/TokensProvider';
import { WALLETS_INFO } from '../../provider/BridgeProvider';

type TokenShortChipProps = {
  token: Token;
  onClick?: () => void;
};

export const TokenToChip = ({ token, onClick }: TokenShortChipProps) => {
  let logo = WALLETS_INFO[token.wallet].logo;

  switch (token.type) {
    case 'icrc':
      logo = WALLETS_INFO['eth'].logo;
      break;
    case 'evmc':
      logo = WALLETS_INFO['ic'].logo;
      break;
  }

  return (
    <HStack
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
      <Image src={logo} width="24px" height="24px" flexShrink="0" />
    </HStack>
  );
};

type TokenChipProps = {
  token: Token;
  onClick?: () => void;
  target?: 'from' | 'destination';
};

export const TokenFromChip = ({ token, onClick, target }: TokenChipProps) => {
  let name = token.name;
  let logo = WALLETS_INFO[token.wallet].logo;

  switch (token.type) {
    case 'icrc':
      name = target === 'from' ? token.name : `EVM`;
      logo =
        target === 'from' ? WALLETS_INFO['ic'].logo : WALLETS_INFO['eth'].logo;
      break;
    case 'evmc':
      name = target === 'from' ? token.name : `IC`;
      logo =
        target === 'from' ? WALLETS_INFO['eth'].logo : WALLETS_INFO['ic'].logo;
      break;
  }

  return (
    <HStack
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
      <Image src={logo} width="24px" height="24px" flexShrink="0" />
      <Box paddingRight="8px">
        <Text textStyle="body2" fontWeight="bold" color="secondary.white">
          {name}
        </Text>
      </Box>
    </HStack>
  );
};
