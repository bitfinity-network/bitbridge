import { HStack, Image, Text, StackProps, TextProps } from '@chakra-ui/react';
import { Token } from '../../provider/TokensProvider.tsx';

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
    <HStack alignItems="center" gap="12px" {...rest}>
      <Image
        src={token.logo || fallbackSrc}
        fallbackSrc={fallbackSrc}
        alt={token.name}
        h={variants[variant].size}
        w={variants[variant].size}
      />

      <Text as="span" isTruncated={isTruncated} {...variants[variant]}>
        {token.name.toLocaleUpperCase()} {token.wrapped ? 'W' : ''}
      </Text>
    </HStack>
  );
};

export { TokenTag };
