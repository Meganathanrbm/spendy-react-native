import { useThemeContext } from "../contexts/ThemeContext";
import type { AppTheme } from "../theme";

/**
 * Primary hook for consuming the theme in any component.
 *
 * Usage:
 *   const { colors, typography, spacing, layout, isDark } = useTheme();
 */
export const useTheme = (): AppTheme => {
  const { theme } = useThemeContext();
  return theme;
};
