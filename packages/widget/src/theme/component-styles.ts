import { StyleFunctionProps, ThemeComponents } from '@chakra-ui/react';

export const componentStyles: ThemeComponents = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      textTransform: 'none',
      borderRadius: '8px',
      _disabled: {
        pointerEvents: 'none',
        cursor: 'not-allowed',
        bg: 'primary.alpha16',
        color: 'text.disabled',
        _hover: {
          bg: 'primary.alpha16'
        }
      }
    },
    sizes: {
      xs: {
        paddingX: '8px',
        paddingY: '6px',
        fontSize: '12px',
        lineHeight: '16px'
      },
      sm: {
        paddingX: '24px',
        paddingY: '12px',
        fontSize: '12px',
        lineHeight: '16px'
      },
      md: {
        paddingX: '16px',
        paddingY: '12px',
        fontSize: '12px',
        lineHeight: '16px'
      },
      lg: {
        paddingX: '20px',
        paddingY: '14px',
        fontSize: '12px',
        lineHeight: '16px'
      },
      xl: {
        paddingX: '24px',
        paddingY: '16px',
        fontSize: '12px',
        lineHeight: '16px'
      },
      jumbo: {
        paddingX: '48px',
        paddingY: '16px',
        fontSize: '24px',
        lineHeight: '32px'
      }
    },
    variants: {
      solid: ({ isDisabled, colorScheme }: StyleFunctionProps) => ({
        bg: isDisabled ? `${colorScheme}.alpha16` : `${colorScheme}.main`,
        color: isDisabled ? 'text.disabled' : 'text.white',
        _hover: isDisabled
          ? {
              bg: 'secondary.alpha40',
              cursor: 'not-allowed'
            }
          : {
              bg: `${colorScheme}.hover`
            },
        _disabled: {
          bg: `${colorScheme}.alpha16`,
          cursor: 'not-allowed'
        }
      }),
      secondary: ({ isDisabled, colorScheme }: StyleFunctionProps) => ({
        bg: `${colorScheme}.alpha16`,
        color: isDisabled ? 'text.disabled' : 'secondary.alpha40',
        _hover: isDisabled
          ? {}
          : {
              bg: `${colorScheme}.hover`
            },
        _disabled: {
          bg: `${colorScheme}.alpha16`
        }
      }),
      outline: ({ isDisabled, colorScheme }: StyleFunctionProps) => ({
        bg: isDisabled ? `${colorScheme}.alpha16` : `${colorScheme}.alpha72`,
        borderColor: isDisabled ? `${colorScheme}.alpha16` : 'bg.border',
        color: isDisabled ? 'text.disabled' : 'text.black',
        _hover: isDisabled
          ? {}
          : {
              bg: `${colorScheme}.alpha12`
            },
        _disabled: {
          bg: `${colorScheme}.alpha16`
        }
      })
    },
    defaultProps: {
      colorScheme: 'primary'
    }
  },
  PinInputField: {
    baseStyle: {
      fontWeight: 'bold'
    }
  },
  FormLabel: {
    baseStyle: ({ colorScheme }: StyleFunctionProps) => ({
      fontWeight: 'bold',
      color: `${colorScheme}.main`
    })
  },
  Link: {
    baseStyle: ({ colorScheme }: StyleFunctionProps) => ({
      fontWeight: 'bold',
      color: `${colorScheme}.main`
    })
  },
  Input: {
    baseStyle: {
      field: {
        width: '100%',
        height: '48px'
      }
    },
    variants: {
      unstyled: ({ colorScheme }: StyleFunctionProps) => ({
        field: {
          bg: `${colorScheme}.alpha8`,
          borderRadius: '0px',
          height: '48px',
          px: 3,
          _placeholder: {
            fontWeight: 600,
            color: `${colorScheme}.alpha60`
          }
        }
      })
    }
  }
};
