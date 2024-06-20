import { extendTheme } from '@chakra-ui/react';
import { ThemeColorsType, themeColors } from './theme-colors';
import { componentStyles } from './component-styles';
import { globalStyles } from './global-styles';
import { fontStyles } from './font-config';

export const ThemeColors = [
  'primary',
  'hover',
  'secondary',
  'success',
  'mainBg',
  'modalBg',
  'primaryText',
  'secondaryText'
] as const;

export type ThemeColor = Record<
  (typeof ThemeColors)[number],
  string | undefined
>;

export type ThemeColorMode = 'main' | '_dark';

export type ThemeColors = Partial<Record<ThemeColorMode, Partial<ThemeColor>>>;

export type CustomThemeType = {
  colors?: ThemeColors;
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

const assignColors = (
  targetColors: ThemeColorsType,
  sourceColors: ThemeColors,
  colorMode: ThemeColorMode
) => {
  console.log('colors', sourceColors, targetColors, colorMode);
  Object.entries(sourceColors[colorMode] || {}).forEach(([key, value]) => {
    if (value && key in targetColors) {
      const targetColor = targetColors[key as keyof ThemeColorsType];
      if (targetColor) {
        (targetColor as unknown as Record<ThemeColorMode, string | undefined>)[
          colorMode
        ] = value;
      }
    }
  });
};

const consolidateCustomThemeWithDefault = (customTheme?: CustomThemeType) => {
  if (!customTheme) return defaultThemeObject;

  const { colors, config } = customTheme;
  const defaultThemeColors = defaultThemeObject.semanticTokens.colors;
  const colorMode = config?.colorMode === 'dark' ? '_dark' : 'main';

  if (colors) {
    assignColors(defaultThemeColors, colors, colorMode);
  }

  const mergedConfig = {
    ...defaultThemeObject.config,
    ...config,
    initialColorMode:
      config?.colorMode ?? defaultThemeObject.config.initialColorMode,
    useSystemColorMode:
      config?.useSystemColorMode ?? defaultThemeObject.config.useSystemColorMode
  };

  return {
    ...defaultThemeObject,
    semanticTokens: {
      colors: defaultThemeColors
    },
    config: mergedConfig
  };
};

export const extendDefaultTheme = (customTheme?: CustomThemeType) => {
  const consolidatedTheme = consolidateCustomThemeWithDefault(customTheme);

  return extendTheme(consolidatedTheme);
};
