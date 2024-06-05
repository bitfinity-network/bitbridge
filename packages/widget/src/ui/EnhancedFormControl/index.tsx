import { FormControl, chakra } from '@chakra-ui/react';

export const EnhancedFormControl = chakra(FormControl, {
  baseStyle: {
    width: '100%',
    borderRadius: '12px',
    bg: 'success',
    padding: 4,
    marginY: 4
  }
});
