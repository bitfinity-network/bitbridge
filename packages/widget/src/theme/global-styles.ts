import { fontConfig } from './font-config';
import { themeColors } from './theme-colors';

export const globalStyles = {
  body: {
    bg: themeColors.bg.main,
    fontFamily: fontConfig.body,
    color: themeColors.text.primary,
    top: '0px !important'
  }
};
