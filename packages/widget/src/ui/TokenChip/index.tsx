import { Box, HStack, Image, Text } from '@chakra-ui/react';
import { Token } from '../../provider/TokensProvider';
import { WALLETS_INFO } from '../../provider/BridgeProvider';

type TokenShortChipProps = {
  token: Token;
};

export const TokenToChip = ({ token }: TokenShortChipProps) => {
  let logo = WALLETS_INFO[token.wallet].logo;
  let name = token.name;

  switch (token.type) {
    case 'icrc':
      logo = WALLETS_INFO['eth'].logo;
      name = 'ETH';
      break;
    case 'evmc':
      logo = WALLETS_INFO['ic'].logo;
      name = 'IC';
      break;
  }

  return (
    <HStack gap="8px" alignItems="center" justifyContent="space-between">
      <Image src={logo} width="18px" height="18px" flexShrink="0" />
      <Text textStyle="body2" fontWeight="bold" color="secondary.white">
        {name}
      </Text>
    </HStack>
  );
};

type TokenChipProps = {
  token: Token;
  target?: 'from' | 'destination';
};

export const TokenFromChip = ({ token, target }: TokenChipProps) => {
  let name = token.name;
  let logo = WALLETS_INFO[token.wallet].logo;

  switch (token.type) {
    case 'icrc':
      name = 'IC';
      logo =
        target === 'from' ? WALLETS_INFO['ic'].logo : WALLETS_INFO['eth'].logo;
      break;
    case 'evmc':
      name = 'ETH';
      logo =
        target === 'from' ? WALLETS_INFO['eth'].logo : WALLETS_INFO['ic'].logo;
      break;
  }

  return (
    <HStack gap="8px" alignItems="center" justifyContent="space-between">
      <Image src={logo} width="18px" height="18px" flexShrink="0" />
      <Box paddingRight="8px">
        <Text textStyle="body2" fontWeight="bold" color="secondary.white">
          {name}
        </Text>
      </Box>
    </HStack>
  );
};
