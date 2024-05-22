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

const consolidateCustomThemeWithDefault = (customTheme?: CustomThemeType) => {
  if (!customTheme) return defaultThemeObject;

  const { colors, config } = customTheme;
  const themeMode =
    config?.colorMode ?? defaultThemeObject.config.initialColorMode;

  const mergedColors = colors
    ? {
        ...defaultThemeObject.colors,
        [themeMode]: {
          ...defaultThemeObject.colors[themeMode as ThemeModeType],
          primary: {
            ...defaultThemeObject.colors[themeMode as ThemeModeType].primary,
            main:
              colors.primary ??
              defaultThemeObject.colors[themeMode as ThemeModeType].primary
                .main,
          },
          secondary: {
            ...defaultThemeObject.colors[themeMode as ThemeModeType].secondary,
            main:
              colors.secondary ??
              defaultThemeObject.colors[themeMode as ThemeModeType].secondary
                .main,
          },
          bg: {
            ...defaultThemeObject.colors[themeMode as ThemeModeType].bg,
            main:
              colors.mainBg ??
              defaultThemeObject.colors[themeMode as ThemeModeType].bg.main,
            modal:
              colors.modalBg ??
              defaultThemeObject.colors[themeMode as ThemeModeType].bg.modal,
          },
          text: {
            ...defaultThemeObject.colors[themeMode as ThemeModeType].text,
            primary:
              colors.primaryText ??
              defaultThemeObject.colors[themeMode as ThemeModeType].text
                .primary,
            secondary:
              colors.secondaryText ??
              defaultThemeObject.colors[themeMode as ThemeModeType].text
                .secondary,
          },
          success:
            colors.success ??
            defaultThemeObject.colors[themeMode as ThemeModeType].success,
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
