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

  const defaultTheme = { ...defaultThemeObject };
  const { colors, config } = customTheme;
  const themeMode = config?.colorMode ?? defaultTheme.config.initialColorMode;

  if (colors) {
    defaultTheme.colors = {
      ...defaultTheme.colors,
      [themeMode]: {
        ...defaultTheme.colors[themeMode as ThemeModeType],
        primary: {
          ...defaultTheme.colors[themeMode as ThemeModeType].primary,
          main:
            colors.primary ??
            defaultTheme.colors[themeMode as ThemeModeType].primary.main,
        },
        secondary: {
          ...defaultTheme.colors[themeMode as ThemeModeType].secondary,
          main:
            colors.secondary ??
            defaultTheme.colors[themeMode as ThemeModeType].secondary.main,
        },
        bg: {
          ...defaultTheme.colors[themeMode as ThemeModeType].bg,
          main:
            colors.mainBg ??
            defaultTheme.colors[themeMode as ThemeModeType].bg.main,
          modal:
            colors.modalBg ??
            defaultTheme.colors[themeMode as ThemeModeType].bg.modal,
        },
        text: {
          ...defaultTheme.colors[themeMode as ThemeModeType].text,
          primary:
            colors.primaryText ??
            defaultTheme.colors[themeMode as ThemeModeType].text.primary,
          secondary:
            colors.secondaryText ??
            defaultTheme.colors[themeMode as ThemeModeType].text.secondary,
        },
        success:
          colors.success ??
          defaultTheme.colors[themeMode as ThemeModeType].success,
      },
    };
  }

  if (config) {
    defaultTheme.config = {
      ...defaultTheme.config,
      initialColorMode:
        config.colorMode ?? defaultTheme.config.initialColorMode,
      useSystemColorMode:
        config.useSystemColorMode ?? defaultTheme.config.useSystemColorMode,
    };
  }

  return defaultTheme;
};

export const extendDefaultTheme = (customTheme?: CustomThemeType) => {
  const consolidatedTheme = consolidateCustomThemeWithDefault(customTheme);

  return extendTheme(consolidatedTheme);
};
