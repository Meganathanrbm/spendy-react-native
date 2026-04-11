export { lightColors, darkColors } from "./colors";
export type { AppColors } from "./colors";
export { typography } from "./typography";
export type { Typography } from "./typography";
export { spacing, layout } from "./spacing";
export type { Spacing } from "./spacing";

import { lightColors, darkColors } from "./colors";
import { typography } from "./typography";
import { spacing, layout } from "./spacing";

export const buildTheme = (mode: "light" | "dark") => ({
  colors: mode === "dark" ? darkColors : lightColors,
  typography,
  spacing,
  layout,
  mode,
  isDark: mode === "dark",
});

export type AppTheme = ReturnType<typeof buildTheme>;
