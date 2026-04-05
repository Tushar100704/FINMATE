/**
 * Theme Colors - Light and Dark Mode
 * Layered approach for proper depth and contrast
 */

export const LightTheme = {
  // Base layers
  background: '#F5F7FA',      // Main background
  surface: '#FFFFFF',          // Cards, containers
  surfaceElevated: '#FFFFFF',  // Elevated cards
  
  // Primary colors
  primary: '#6366F1',          // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Text colors
  text: '#1F2937',             // Almost black
  textSecondary: '#6B7280',    // Gray
  textTertiary: '#9CA3AF',     // Light gray
  textInverse: '#FFFFFF',      // White text on dark backgrounds
  
  // Borders and dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Status colors
  success: '#10B981',          // Green
  successLight: '#D1FAE5',
  error: '#EF4444',            // Red
  errorLight: '#FEE2E2',
  warning: '#F59E0B',          // Amber
  warningLight: '#FEF3C7',
  info: '#3B82F6',             // Blue
  infoLight: '#DBEAFE',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabBarActive: '#6366F1',
  tabBarInactive: '#9CA3AF',
};

export const DarkTheme = {
  // Base layers - Pitch black with subtle elevation
  background: '#000000',       // Pure black background
  surface: '#0A0A0A',          // Slightly elevated (cards)
  surfaceElevated: '#141414',  // More elevated (modals, dropdowns)
  
  // Primary colors - Slightly brighter for dark mode
  primary: '#818CF8',          // Lighter indigo for better contrast
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  
  // Text colors - High contrast
  text: '#F9FAFB',             // Almost white
  textSecondary: '#D1D5DB',    // Light gray
  textTertiary: '#9CA3AF',     // Medium gray
  textInverse: '#1F2937',      // Dark text on light backgrounds
  
  // Borders and dividers - Subtle
  border: '#1F2937',           // Dark gray
  borderLight: '#111827',      // Very dark gray
  
  // Status colors - Adjusted for dark mode
  success: '#34D399',          // Brighter green
  successLight: '#064E3B',     // Dark green background
  error: '#F87171',            // Brighter red
  errorLight: '#7F1D1D',       // Dark red background
  warning: '#FBBF24',          // Brighter amber
  warningLight: '#78350F',     // Dark amber background
  info: '#60A5FA',             // Brighter blue
  infoLight: '#1E3A8A',        // Dark blue background
  
  // Shadows - Lighter for dark mode
  shadow: 'rgba(255, 255, 255, 0.05)',
  shadowDark: 'rgba(255, 255, 255, 0.1)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  // Tab bar
  tabBarBackground: '#0A0A0A',
  tabBarBorder: '#1F2937',
  tabBarActive: '#818CF8',
  tabBarInactive: '#6B7280',
};

export type ThemeColors = typeof LightTheme;

/**
 * Get theme colors based on mode
 */
export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? DarkTheme : LightTheme;
}
