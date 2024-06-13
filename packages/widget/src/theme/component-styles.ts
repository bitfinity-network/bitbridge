import { StyleFunctionProps, ThemeComponents } from '@chakra-ui/react';

export const componentStyles: ThemeComponents = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      borderRadius: '12px'
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
      solid: (props: StyleFunctionProps) => ({
        bg: props.isDisabled
          ? `${props.colorScheme}.alpha16`
          : `${props.colorScheme}.main`,
        color: props.isDisabled ? `text.disabled` : `text.black`,
        _hover: props.isDisabled
          ? {}
          : {
              bg: `${props.colorScheme}.hover`
            },
        _disabled: {
          bg: `${props.colorScheme}.alpha16`
        }
      }),
      secondary: (props: StyleFunctionProps) => ({
        bg: props.isDisabled
          ? `${props.colorScheme}.alpha16`
          : `${props.colorScheme}.alpha16`,
        color: props.isDisabled ? `text.disabled` : `secondary.alpha40`,
        _hover: props.isDisabled
          ? {}
          : {
              bg: `${props.colorScheme}.hover`
            },
        _disabled: {
          bg: `${props.colorScheme}.alpha16`
        }
      }),
      outline: (props: StyleFunctionProps) => ({
        bg: props.isDisabled
          ? `${props.colorScheme}.alpha16`
          : `${props.colorScheme}.alpha72`,
        borderColor: props.isDisabled
          ? `${props.colorScheme}.alpha16`
          : `${props.colorScheme}.main`,
        color: props.isDisabled ? `text.disabled` : `text.black`,
        _hover: props.isDisabled
          ? {}
          : {
              bg: `${props.colorScheme}.alpha12`
            },
        _disabled: {
          bg: `${props.colorScheme}.alpha16`
        }
      }),
      _disabled: (props: StyleFunctionProps) => ({
        pointerEvents: 'none',
        bg: `${props.colorScheme}.alpha16`,
        color: `text.disabled`,
        _hover: {
          bg: `${props.colorScheme}.alpha16`
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
    baseStyle: (props: StyleFunctionProps) => ({
      fontWeight: 'bold',
      color: `${props.colorScheme}.main`
    })
  },
  Link: {
    baseStyle: (props: StyleFunctionProps) => ({
      fontWeight: 'bold',
      color: `${props.colorScheme}.main`
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
      unstyled: (props: StyleFunctionProps) => ({
        field: {
          bg: `${props.colorScheme}.alpha8`,
          borderRadius: '0px',
          height: '48px',
          px: 3,
          _placeholder: {
            fontWeight: 600,
            color: `${props.colorScheme}.alpha60`
          }
        }
      })
    }
  }
};
