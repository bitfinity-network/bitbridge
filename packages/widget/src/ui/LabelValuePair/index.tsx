import { HStack, Text, TextProps } from "@chakra-ui/react";
import { ReactNode } from "react";
interface LabelValuePairProps {
  label?: string;
  children: ReactNode;
  textStyle?: TextProps;
}
export function LabelValuePair({
  label = "",
  textStyle = {},
  children,
}: LabelValuePairProps) {
  return (
    <HStack justifyContent="space-between" pt={1}>
      <Text fontSize="xs" color="secondary.alpha40" {...textStyle}>
        {label}
      </Text>
      <Text fontSize="xs" color="secondary.alpha40">
        {children}
      </Text>
    </HStack>
  );
}
