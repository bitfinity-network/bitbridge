import { FormControl, chakra } from '@chakra-ui/react';

export const EnhancedFormControl = chakra(FormControl, {
  baseStyle: {
    width: '100%',
    borderRadius: '12px',
    bg: 'success',
    padding: 4,
    marginY: 4
  },
});

// export const EnhancedFormControl = ({
//   children,
//   pt
// }: {
//   children: ReactNode;
//   pt?: any;
// }) => {
//   // const enhancedFormControlBg = useColorModeValue(
//   //   'light.secondary.alpha4',
//   //   'dark.secondary.alpha4'
//   // );
//
//
//
//   return <EnhancedFormControl pt={pt}>{children}</EnhancedFormControl>;
// };
