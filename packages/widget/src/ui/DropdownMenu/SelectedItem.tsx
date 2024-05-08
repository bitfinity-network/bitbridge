import { HStack, Image, Text, StackProps } from "@chakra-ui/react";
import { DropDownItemProp } from "../../types";

export const SelectedItem = ({
  name,
  img = "",
  hideImage = false,
  labelProps,
  ...rest
}: DropDownItemProp & StackProps) => {
  const fallbackSrc = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
  return (
    <HStack alignItems="center" h={12} pl={3} {...rest} w="full">
      {!hideImage && <Image src={img || fallbackSrc} alt={name} h={6} w={6} />}
      <Text
        isTruncated
        pl={1}
        fontSize="16px"
        fontWeight={600}
        lineHeight="24px"
        borderRadius="full"
        {...labelProps}
      >
        {name}
      </Text>
    </HStack>
  );
};
