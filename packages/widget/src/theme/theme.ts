import { extendTheme } from '@chakra-ui/react';
import { ThemeColorsType, themeColors } from './theme-colors';
import { componentStyles } from './component-styles';
import { globalStyles } from './global-styles';
import { fontConfig, fontStyles } from './font-config';

export type CustomThemeType = {
  colors?: {
    primary?: string;
    secondary?: string;
    success?: string;
    mainBg?: string;
    modalBg?: string;
    primaryText?: string;
    secondaryText?: string;
  };
  config?: {
    colorMode?: 'light' | 'dark';
    useSystemColorMode?: boolean;
  };
};

const defaultThemeObject = {
  styles: {
    global: globalStyles
  },
  semanticTokens: {
    colors: themeColors as ThemeColorsType
  },
  fonts: fontConfig,
  textStyles: fontStyles,
  components: componentStyles,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
    cssVarPrefix: 'bitbridge'
  }
};

export type ThemeType = typeof defaultThemeObject;

export const DefaultTheme = extendTheme(defaultThemeObject);

/**
 * Darken a color by a certain amount
 * @param color The color to darken
 * @param amount The amount to darken the color by
 * @returns The darkened color
 */
const darkenColor = (color: string, amount: number): string => {
  const usePound = color[0] === '#';
  const num = parseInt(color.slice(1), 16);

  let r = (num >> 16) - amount;
  let g = ((num >> 8) & 0x00ff) - amount;
  let b = (num & 0x0000ff) - amount;

  r = r < 0 ? 0 : r;
  g = g < 0 ? 0 : g;
  b = b < 0 ? 0 : b;

  return (
    (usePound ? '#' : '') +
    (r < 16 ? '0' : '') +
    r.toString(16) +
    (g < 16 ? '0' : '') +
    g.toString(16) +
    (b < 16 ? '0' : '') +
    b.toString(16)
  );
};

const consolidateCustomThemeWithDefault = (customTheme?: CustomThemeType) => {
  if (!customTheme) return defaultThemeObject;

  const { colors, config } = customTheme;

  const defaultThemColors = defaultThemeObject.semanticTokens.colors;
  const isDarkMode = config?.colorMode === 'dark';
  const colorToUpdate = isDarkMode ? '_dark' : 'default';

  defaultThemColors.primary.main[colorToUpdate] =
    colors?.primary ?? defaultThemColors.primary.main[colorToUpdate];
  defaultThemColors.primary.hover[colorToUpdate] = darkenColor(
    colors?.primary ?? defaultThemColors.primary.main[colorToUpdate],
    10
  );
  defaultThemColors.secondary.main[colorToUpdate] =
    colors?.secondary ?? defaultThemColors.secondary.main[colorToUpdate];
  defaultThemColors.success[500][colorToUpdate] =
    colors?.success ?? defaultThemColors.success[500][colorToUpdate];
  defaultThemColors.bg.main[colorToUpdate] =
    colors?.mainBg ?? defaultThemColors.bg.main[colorToUpdate];
  defaultThemColors.bg.modal[colorToUpdate] =
    colors?.modalBg ?? defaultThemColors.bg.modal[colorToUpdate];
  defaultThemColors.text.primary[colorToUpdate] =
    colors?.primaryText ?? defaultThemColors.text.primary[colorToUpdate];
  defaultThemColors.text.secondary[colorToUpdate] =
    colors?.secondaryText ?? defaultThemColors.text.secondary[colorToUpdate];

  const mergedConfig = config
    ? {
        ...defaultThemeObject.config,
        initialColorMode:
          config.colorMode ?? defaultThemeObject.config.initialColorMode,
        useSystemColorMode:
          config.useSystemColorMode ??
          defaultThemeObject.config.useSystemColorMode
      }
    : defaultThemeObject.config;

  return {
    ...defaultThemeObject,
    semanticTokens: {
      colors: defaultThemColors
    },
    config: mergedConfig
  };
};

export const extendDefaultTheme = (customTheme?: CustomThemeType) => {
  const consolidatedTheme = consolidateCustomThemeWithDefault(customTheme);

  return extendTheme(consolidatedTheme);
};
