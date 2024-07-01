import { FormControl, chakra } from '@chakra-ui/react';

export const EnhancedFormControl = chakra(FormControl, {
  baseStyle: {
    width: '100%',
    borderRadius: '12px',
    bg: 'secondary.alpha4',
    padding: 2,
    marginY: 4
  }
});
