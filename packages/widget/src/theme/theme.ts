import { extendTheme } from '@chakra-ui/react';
import { ThemeColorsType, themeColors } from './theme-colors';
import { componentStyles } from './component-styles';
import { globalStyles } from './global-styles';
import { fontStyles } from './font-config';

// Define the available theme colors
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

// Define the type for individual theme color
export type ThemeColor = Partial<Record<(typeof ThemeColors)[number], string>>;

// Define the type for theme color modes
export type ThemeColorMode = 'main' | '_dark';

// Define the type for theme colors with modes
export type ThemeColors = Partial<Record<ThemeColorMode, ThemeColor>>;

// Define the type for custom theme configuration
export type CustomThemeType = {
  colors?: ThemeColors;
  config?: {
    colorMode?: 'light' | 'dark';
    useSystemColorMode?: boolean;
  };
};

// Default theme object
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

// Define the type for the default theme object
export type ThemeType = typeof defaultThemeObject;

// Extend the default theme
export const DefaultTheme = extendTheme(defaultThemeObject);

// Assign custom colors to the target theme colors
const assignCustomColors = (
  targetColors: ThemeColorsType,
  sourceColors: ThemeColors,
  colorMode: ThemeColorMode
) => {
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

// Consolidate custom theme with the default theme
const consolidateTheme = (customTheme?: CustomThemeType) => {
  if (!customTheme) return defaultThemeObject;

  const { colors, config } = customTheme;
  const defaultThemeColors = defaultThemeObject.semanticTokens.colors;
  const colorMode = config?.colorMode === 'dark' ? '_dark' : 'main';

  if (colors) {
    assignCustomColors(defaultThemeColors, colors, colorMode);
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

// Extend the default theme with custom theme
export const extendDefaultTheme = (customTheme?: CustomThemeType) => {
  const consolidatedTheme = consolidateTheme(customTheme);

  return extendTheme(consolidatedTheme);
};
