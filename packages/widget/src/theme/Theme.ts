import { extendTheme } from "@chakra-ui/react";
import { ThemeColorsType, themeColors } from "./theme-colors";
import { componentStyles } from "./component-styles";
import { globalStyles } from "./global-styles";
import { fontConfig, fontStyles } from "./font-config";
import { CustomThemeType } from "../types";

const defaultThemeObject = {
  styles: {
    global: globalStyles,
  },
  colors: themeColors as ThemeColorsType,
  fonts: fontConfig,
  textStyles: fontStyles,
  components: componentStyles,
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
    cssVarPrefix: "bitbridge",
  },
};

export type ThemeType = typeof defaultThemeObject;

export const DefaultTheme = extendTheme(defaultThemeObject);

type ThemeModeType = "light" | "dark";

/**
 * Darken a color by a certain amount
 * @param color The color to darken
 * @param amount The amount to darken the color by
 * @returns The darkened color
 */
const darkenColor = (color: string, amount: number): string => {
  const usePound = color[0] === "#";
  const num = parseInt(color.slice(1), 16);

  let r = (num >> 16) - amount;
  let g = ((num >> 8) & 0x00ff) - amount;
  let b = (num & 0x0000ff) - amount;

  r = r < 0 ? 0 : r;
  g = g < 0 ? 0 : g;
  b = b < 0 ? 0 : b;

  return (
    (usePound ? "#" : "") +
    (r < 16 ? "0" : "") +
    r.toString(16) +
    (g < 16 ? "0" : "") +
    g.toString(16) +
    (b < 16 ? "0" : "") +
    b.toString(16)
  );
};

const consolidateCustomThemeWithDefault = (customTheme?: CustomThemeType) => {
  if (!customTheme) return defaultThemeObject;

  const { colors, config } = customTheme;
  const themeMode =
    config?.colorMode ?? defaultThemeObject.config.initialColorMode;

  const defaultThemColors =
    defaultThemeObject.colors[themeMode as ThemeModeType];

  const mergedColors = colors
    ? {
        ...defaultThemeObject.colors,
        [themeMode]: {
          ...defaultThemColors,
          primary: {
            ...defaultThemColors.primary,
            main: colors.primary ?? defaultThemColors.primary.main,
            hover: colors.primary
              ? darkenColor(colors.primary, 10)
              : defaultThemColors.primary.hover,
          },
          secondary: {
            ...defaultThemColors.secondary,
            main: colors.secondary ?? defaultThemColors.secondary.main,
          },
          bg: {
            ...defaultThemColors.bg,
            main: colors.mainBg ?? defaultThemColors.bg.main,
            modal: colors.modalBg ?? defaultThemColors.bg.modal,
          },
          text: {
            ...defaultThemColors.text,
            primary: colors.primaryText ?? defaultThemColors.text.primary,
            secondary: colors.secondaryText ?? defaultThemColors.text.secondary,
          },
          success: colors.success ?? defaultThemColors.success,
        },
      }
    : defaultThemeObject.colors;

  const mergedConfig = config
    ? {
        ...defaultThemeObject.config,
        initialColorMode:
          config.colorMode ?? defaultThemeObject.config.initialColorMode,
        useSystemColorMode:
          config.useSystemColorMode ??
          defaultThemeObject.config.useSystemColorMode,
      }
    : defaultThemeObject.config;

  return {
    ...defaultThemeObject,
    colors: mergedColors,
    config: mergedConfig,
  };
};

export const extendDefaultTheme = (customTheme?: CustomThemeType) => {
  const consolidatedTheme = consolidateCustomThemeWithDefault(customTheme);

  return extendTheme(consolidatedTheme);
};
