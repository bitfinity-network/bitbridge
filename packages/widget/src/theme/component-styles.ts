import { StyleFunctionProps, ThemeComponents } from "@chakra-ui/react";

export const componentStyles: ThemeComponents = {
  Button: {
    baseStyle: {
      fontWeight: "bold",
      textTransform: "uppercase",
      borderRadius: "12px",
    },
    sizes: {
      xs: {
        paddingX: "8px",
        paddingY: "6px",
      },
      sm: {
        paddingX: "12px",
        paddingY: "8px",
      },
      md: {
        paddingX: "16px",
        paddingY: "12px",
      },
      lg: {
        paddingX: "20px",
        paddingY: "14px",
      },
      xl: {
        paddingX: "24px",
        paddingY: "16px",
      },
      jumbo: {
        paddingX: "48px",
        paddingY: "16px",
        fontSize: "24px",
        lineHeight: "32px",
      },
    },
    variants: {
      solid: (props: StyleFunctionProps) => ({
        bg: props.isDisabled
          ? `${props.colorMode}.${props.colorScheme}.alpha16`
          : `${props.colorMode}.${props.colorScheme}.main`,
        color: props.isDisabled
          ? `${props.colorMode}.text.disabled`
          : `${props.colorMode}.text.black`,
        _hover: props.isDisabled
          ? {}
          : {
              bg: `${props.colorMode}.${props.colorScheme}.hover`,
            },
        _disabled: {
          bg: `${props.colorMode}.${props.colorScheme}.alpha16`,
        },
      }),
      secondary: (props: StyleFunctionProps) => ({
        bg: props.isDisabled
          ? `${props.colorMode}.${props.colorScheme}.alpha16`
          : `${props.colorMode}.${props.colorScheme}.alpha16`,
        color: props.isDisabled
          ? `${props.colorMode}.text.disabled`
          : `${props.colorMode}.secondary.alpha40`,
        _hover: props.isDisabled
          ? {}
          : {
              bg: `${props.colorMode}.${props.colorScheme}.hover`,
            },
        _disabled: {
          bg: `${props.colorMode}.${props.colorScheme}.alpha16`,
        },
      }),
      outline: (props: StyleFunctionProps) => ({
        bg: props.isDisabled
          ? `${props.colorMode}.${props.colorScheme}.alpha16`
          : `${props.colorMode}.${props.colorScheme}.alpha8`,
        borderColor: props.isDisabled
          ? `${props.colorMode}.${props.colorScheme}.alpha16`
          : `${props.colorMode}.${props.colorScheme}.alpha60`,
        color: props.isDisabled
          ? `${props.colorMode}.text.disabled`
          : `${props.colorMode}.text.black`,
        _hover: props.isDisabled
          ? {}
          : {
              bg: `${props.colorMode}.${props.colorScheme}.alpha12`,
            },
        _disabled: {
          bg: `${props.colorMode}.${props.colorScheme}.alpha16`,
        },
      }),
      _disabled: (props: StyleFunctionProps) => ({
        pointerEvents: "none",
        bg: `${props.colorMode}.${props.colorScheme}.alpha16`,
        color: `${props.colorMode}.text.disabled`,
        _hover: {
          bg: `${props.colorMode}.${props.colorScheme}.alpha16`,
        },
      }),
    },
    defaultProps: {
      colorScheme: "primary",
    },
  },
  PinInputField: {
    baseStyle: {
      fontWeight: "bold",
    },
  },
  FormLabel: {
    baseStyle: (props: StyleFunctionProps) => ({
      fontWeight: "bold",
      color: `${props.colorMode}.${props.colorScheme}.main`,
    }),
  },
  Link: {
    baseStyle: (props: StyleFunctionProps) => ({
      fontWeight: "bold",
      color: `${props.colorMode}.${props.colorScheme}.main`,
    }),
  },
  Input: {
    baseStyle: {
      field: {
        width: "100%",
        height: "48px",
      },
    },
    variants: {
      unstyled: (props: StyleFunctionProps) => ({
        field: {
          bg: `${props.colorMode}.${props.colorScheme}.alpha8`,
          borderRadius: "0px",
          height: "48px",
          px: 3,
          _placeholder: {
            fontWeight: 600,
            color: `${props.colorMode}.${props.colorScheme}.alpha60`,
          },
        },
      }),
    },
  },
};
