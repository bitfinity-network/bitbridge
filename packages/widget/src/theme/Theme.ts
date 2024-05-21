import { extendTheme } from "@chakra-ui/react";
import { ThemeColorsType, themeColors } from "./theme-colors";
import { componentStyles } from "./component-styles";
import { globalStyles } from "./global-styles";
import { fontConfig, fontStyles } from "./font-config";

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

export const extendDefaultTheme = (customTheme?: Partial<ThemeType>) => {
  const extensions = Object.assign(defaultThemeObject, customTheme ?? {});

  return extendTheme(extensions);
};
