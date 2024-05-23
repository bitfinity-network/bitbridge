import { ReactNode } from "react";

import { FormControl, chakra, useColorModeValue } from "@chakra-ui/react";

export const EnhancedFormControl = ({ children }: { children: ReactNode }) => {
  const enhancedFormControlBg = useColorModeValue(
    "light.secondary.alpha4",
    "dark.secondary.alpha4",
  );

  const EnhancedFormControl = chakra(FormControl, {
    baseStyle: {
      width: "100%",
      borderRadius: "12px",
      bg: enhancedFormControlBg,
      padding: 4,
      marginY: 4,
    },
  });

  return <EnhancedFormControl>{children}</EnhancedFormControl>;
};
