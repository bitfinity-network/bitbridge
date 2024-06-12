import {
  HStack,
  VStack,
  Image,
  Text,
  StackProps,
  TextProps
} from '@chakra-ui/react';
import { Token } from '../../provider/TokensProvider.tsx';
import { toFloating } from '../../utils';

interface VariantType {
  sm: TextProps;
  lg: TextProps;
}

const variants: VariantType = {
  sm: {
    size: '24px',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    borderRadius: 'full'
  },
  lg: {
    size: '32px',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '24px',
    borderRadius: 'full'
  }
};

const TokenTag = ({
  token,
  variant = 'lg',
  isTruncated = false,
  ...rest
}: { token: Token; variant: keyof typeof variants } & StackProps) => {
  const fallbackSrc = `https://api.dicebear.com/7.x/initials/svg?seed=${token.name}`;

  return (
    <HStack alignItems="center" {...rest}>
      <Image
        src={token.logo || fallbackSrc}
        fallbackSrc={fallbackSrc}
        alt={token.name}
        h={variants[variant].size}
        w={variants[variant].size}
      />

      <VStack pl={2}>
        <Text isTruncated={isTruncated} {...variants[variant]}>
          {toFloating(token.balance, token.decimals)} {token.name}
        </Text>
        <Text isTruncated={isTruncated} {...variants[variant]}>
          {token.wallet} {token.bridge} {token.wrapped ? 'W' : ''}
        </Text>
      </VStack>
    </HStack>
  );
};

export { TokenTag };
