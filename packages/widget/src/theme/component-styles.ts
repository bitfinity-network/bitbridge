import { StyleFunctionProps, ThemeComponents } from '@chakra-ui/react';

export const componentStyles: ThemeComponents = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      textTransform: 'none',
      borderRadius: '8px',
      minW: 'auto',
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
        lineHeight: '16px',
        minW: 'auto'
      },
      sm: {
        paddingX: '24px',
        paddingY: '12px',
        fontSize: '12px',
        lineHeight: '16px',
        minW: 'auto'
      },
      md: {
        paddingX: '16px',
        paddingY: '10px',
        fontSize: '14px',
        lineHeight: '20px',
        minW: 'auto'
      },
      lg: {
        paddingX: '20px',
        paddingY: '14px',
        fontSize: '18px',
        lineHeight: '24px',
        minW: 'auto'
      },
      xl: {
        paddingX: '24px',
        paddingY: '16px',
        fontSize: '12px',
        lineHeight: '16px',
        minW: 'auto'
      },
      jumbo: {
        paddingX: '48px',
        paddingY: '16px',
        fontSize: '24px',
        lineHeight: '32px',
        minW: 'auto'
      }
    },
    variants: {
      solid: ({ isDisabled, colorScheme }: StyleFunctionProps) => ({
        bg: isDisabled ? `${colorScheme}.alpha16` : `${colorScheme}.main`,
        color: isDisabled ? 'text.disabled' : 'text.white',
        boxShadow:
          'inset 0 -4px 1px 0 rgba(0, 0, 0, 0.16), inset 0 3px 3px 0 rgba(255, 255, 255, 0.12)',
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
