import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors, ThemeColors } from '../constants/themeColors';

/**
 * Hook to get themed colors based on current theme mode
 * Usage: const colors = useThemedColors();
 */
export function useThemedColors(): ThemeColors {
  const { isDark } = useTheme();
  return getThemeColors(isDark);
}
