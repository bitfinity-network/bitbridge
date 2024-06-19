import { extendTheme } from '@chakra-ui/react';
import { ThemeColorsType, themeColors } from './theme-colors';
import { componentStyles } from './component-styles';
import { globalStyles } from './global-styles';
import { fontStyles } from './font-config';

export const ThemeColors = [
  'primary',
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

export type ThemeColorMode = 'main' | '_dark' | '_light';

export type ThemeColors = Record<ThemeColorMode, ThemeColor>;

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

/**
 * Darken a color by a certain amount
 * @param color The color to darken
 * @param amount The amount to darken the color by
 * @returns The darkened color
 */
// const _ = (color: string, amount: number): string => {
//   const usePound = color[0] === '#';
//   const num = parseInt(color.slice(1), 16);
//
//   let r = (num >> 16) - amount;
//   let g = ((num >> 8) & 0x00ff) - amount;
//   let b = (num & 0x0000ff) - amount;
//
//   r = r < 0 ? 0 : r;
//   g = g < 0 ? 0 : g;
//   b = b < 0 ? 0 : b;
//
//   return (
//     (usePound ? '#' : '') +
//     (r < 16 ? '0' : '') +
//     r.toString(16) +
//     (g < 16 ? '0' : '') +
//     g.toString(16) +
//     (b < 16 ? '0' : '') +
//     b.toString(16)
//   );
// };

const assignColors = (
  _: ThemeColors,
  __: typeof defaultThemeObject.semanticTokens.colors
) => {
  // Object.entries(colors).forEach((p) => {
  //   const [mode, colors] = p as [ThemeColorMode, ThemeColor];
  //
  //   Object.entries(colors).forEach((p2) => {
  //     const [color, value] = p2 as [(typeof ThemeColors)[number], string];
  //
  //     // TODO: assign colors
  //   });
  // });
};

const consolidateCustomThemeWithDefault = (customTheme?: CustomThemeType) => {
  if (!customTheme) return defaultThemeObject;

  const { colors, config } = customTheme;

  const themeColors = defaultThemeObject.semanticTokens.colors;

  if (colors) {
    assignColors(colors, themeColors);
  }
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
      colors: themeColors
    },
    config: mergedConfig
  };
};

export const extendDefaultTheme = (customTheme?: CustomThemeType) => {
  const consolidatedTheme = consolidateCustomThemeWithDefault(customTheme);

  return extendTheme(consolidatedTheme);
};
