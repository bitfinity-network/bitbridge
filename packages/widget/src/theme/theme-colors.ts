export const themeColors = {
  dark: {
    primary: {
      main: "#03FEFF",
      hover: "#02E1E1",
      500: "#03FEFF",
    },
    secondary: {
      main: "#FFFFFF",
      alpha0: "rgba(255, 255, 255, 0)",
      alpha4: "rgba(255, 255, 255, 0.04)",
      alpha8: "rgba(255, 255, 255, 0.08)",
      alpha12: "rgba(255, 255, 255, 0.12)",
      alpha16: "rgba(255, 255, 255, 0.16)",
      alpha20: "rgba(255, 255, 255, 0.20)",
      alpha24: "rgba(255, 255, 255, 0.24)",
      alpha32: "rgba(255, 255, 255, 0.32)",
      alpha40: "rgba(255, 255, 255, 0.40)",
      alpha60: "rgba(255, 255, 255, 0.60)",
      alpha72: "rgba(255, 255, 255, 0.72)",
    },
    success: {
      500: "#05D7B7",
    },
    gradients: {
      primary:
        "linear-gradient(0deg, #03FEFF 0%, rgba(3, 254, 255, 0.04) 100%)",
      secondary:
        "linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0.08) 100%)",
    },
    bg: {
      main: "#181818",
      modal: "rgba(255, 255, 255, 0.04)",
    },
    text: {
      primary: "#03FEFF",
      secondary: "rgba(255, 255, 255, 0.60)",
      white: "#FFFFFF",
      white60: "rgba(255, 255, 255, 0.60)",
      black: "#010302",
      disabled: "rgba(255, 255, 255, 0.72)",
    },
    misc: {
      red: "#fd4084",
      yellow: "#ffdb42",
      green: "#05d7b7",
      greenGradient: "linear-gradient(to bottom, #05d7b7 0%, #a7ffc5)",
    },
  },
  light: {
    primary: {
      main: "#03FEFF",
      hover: "#02E1E1",
      500: "#03FEFF",
      alpha4: "rgba(3, 254, 255, 0.04)",
      alpha8: "rgba(3, 254, 255, 0.08)",
      alpha12: "rgba(3, 254, 255, 0.12)",
      alpha20: "rgba(3, 254, 255, 0.20)",
      alpha26: "rgba(3, 254, 255, 0.26)",
      alpha32: "rgba(3, 254, 255, 0.32)",
      alpha40: "rgba(3, 254, 255, 0.40)",
      alpha48: "rgba(3, 254, 255, 0.48)",
    },
    secondary: {
      main: "#FFFFFF",
      alpha0: "rgba(0, 0, 0, 0)",
      alpha4: "rgba(0, 0, 0, 0.04)",
      alpha8: "rgba(0, 0, 0, 0.08)",
      alpha12: "rgba(0, 0, 0, 0.12)",
      alpha16: "rgba(0, 0, 0, 0.16)",
      alpha20: "rgba(0, 0, 0, 0.20)",
      alpha24: "rgba(0, 0, 0, 0.24)",
      alpha32: "rgba(0, 0, 0, 0.32)",
      alpha40: "rgba(0, 0, 0, 0.40)",
      alpha60: "rgba(0, 0, 0, 0.60)",
      alpha72: "rgba(0, 0, 0, 0.72)",
    },
    success: {
      500: "#05D7B7",
    },
    gradients: {
      primary:
        "linear-gradient(0deg, #03FEFF 0%, rgba(3, 254, 255, 0.04) 100%)",
      secondary:
        "linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0.08) 100%)",
    },
    bg: {
      main: "#FFFFFF",
      modal: "rgba(255, 255, 255, 0.40)",
    },
    text: {
      primary: "#03FEFF",
      secondary: "rgba(255, 255, 255, 0.60)",
      white: "#FFFFFF",
      white60: "rgba(255, 255, 255, 0.60)",
      black: "#010302",
      disabled: "rgba(255, 255, 255, 0.72)",
    },
    misc: {
      red: "#fd4084",
      yellow: "#ffdb42",
      green: "#05d7b7",
      greenGradient: "linear-gradient(to bottom, #05d7b7 0%, #a7ffc5)",
    },
  },
};

export type ThemeColorsType = typeof themeColors;
