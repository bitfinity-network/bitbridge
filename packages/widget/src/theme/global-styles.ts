import { fontConfig } from "./font-config";
import { themeColors } from "./theme-colors";
import { mode } from "@chakra-ui/theme-tools";

export const globalStyles = {
  body: {
    bg: mode(themeColors.light.bg.main, themeColors.dark.bg.main),
    fontFamily: fontConfig.body,
    color: mode(themeColors.light.text.primary, themeColors.dark.text.primary),
    top: "0px !important",
  },
};
