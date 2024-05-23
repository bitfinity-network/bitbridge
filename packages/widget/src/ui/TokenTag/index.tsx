import { TokenProp } from "../../types";
import { HStack, Image, Text, StackProps, TextProps } from "@chakra-ui/react";

interface VariantType {
  sm: TextProps;
  lg: TextProps;
}
const variants: VariantType = {
  sm: {
    size: "24px",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    borderRadius: "full",
  },
  lg: {
    size: "32px",
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "24px",
    borderRadius: "full",
  },
};

const TokenTag = ({
  name,
  img = "",
  variant = "lg",
  isTruncated = false,
  ...rest
}: TokenProp & StackProps) => {
  const fallbackSrc = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
  return (
    <HStack alignItems="center" {...rest}>
      <Image
        src={img || fallbackSrc}
        fallbackSrc={fallbackSrc}
        alt={name}
        h={variants[variant].size}
        w={variants[variant].size}
      />

      <Text isTruncated={isTruncated} pl={1} {...variants[variant]}>
        {name}
      </Text>
    </HStack>
  );
};

export { TokenTag };
