// Design System - Modern Fintech Grade

export const Colors = {
  // Primary Brand Colors
  primary: '#0B6E6F',
  primaryLight: '#00A79D',
  primaryDark: '#064E4F',
  
  // Status Colors
  success: '#16A34A',
  successLight: '#4ADE80',
  error: '#DC2626',
  errorLight: '#F87171',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  info: '#3B82F6',
  
  // Category Colors
  food: '#FF9F1C',
  groceries: '#16A34A',
  recharge: '#0B6E6F',
  p2p: '#00A79D',
  bills: '#DC2626',
  entertainment: '#8B5CF6',
  travel: '#3B82F6',
  shopping: '#EC4899',
  health: '#10B981',
  education: '#6366F1',
  
  // Neutral Colors - Enhanced
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // Text Colors
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Gradient Colors
  gradientStart: '#0B6E6F',
  gradientEnd: '#00A79D',
};

export const Gradients = {
  primary: ['#0B6E6F', '#00A79D'],
  success: ['#16A34A', '#4ADE80'],
  error: ['#DC2626', '#F87171'],
  subtle: ['#F9FAFB', '#FFFFFF'],
  card: ['#FFFFFF', '#F9FAFB'],
};

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Enhanced Font Sizes - Fintech Scale
  fontSize: {
    micro: 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font Weights
  fontWeight: {
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
    extrabold: '800' as '800',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
};

// Global Layout System - Architecture Stabilization
export const Layout = {
  // Screen padding (used by ScreenWrapper)
  screenPaddingHorizontal: 16, // Spacing.lg
  screenPaddingVertical: 16, // Spacing.lg
  
  // Section spacing (between major sections)
  sectionSpacing: 24, // Spacing['2xl']
  sectionSpacingSmall: 16, // Spacing.lg
  
  // Card spacing
  cardSpacing: 12, // Spacing.md
  cardPadding: 16, // Spacing.lg
  
  // Header heights
  headerHeight: 56,
  headerPadding: 16, // Spacing.lg
  
  // List item spacing
  listItemSpacing: 12, // Spacing.md
  listItemPadding: 16, // Spacing.lg
  
  // Button spacing
  buttonSpacing: 12, // Spacing.md
  buttonPaddingHorizontal: 24, // Spacing['2xl']
  buttonPaddingVertical: 12, // Spacing.md
  
  // Input spacing
  inputSpacing: 12, // Spacing.md
  inputPadding: 12, // Spacing.md
  
  // Icon sizes
  iconSizeSmall: 16,
  iconSizeMedium: 20,
  iconSizeLarge: 24,
  iconSizeXLarge: 32,
  
  // Tab bar
  tabBarHeight: 60,
  tabBarPadding: 8, // Spacing.sm
  
  // Safe area bottom spacing for tab screens
  tabScreenBottomSpacing: 80, // tabBarHeight + extra padding
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const CategoryConfig = {
  // Expense categories
  Food: { color: Colors.food, icon: '🍔', iconName: 'food' },
  Groceries: { color: Colors.groceries, icon: '🛒', iconName: 'groceries' },
  Recharge: { color: Colors.recharge, icon: '📱', iconName: 'smartphone' },
  'Recharge/Bills': { color: Colors.recharge, icon: '📱', iconName: 'smartphone' },
  P2P: { color: Colors.p2p, icon: '👥', iconName: 'users' },
  Bills: { color: Colors.bills, icon: '🧾', iconName: 'receipt' },
  Entertainment: { color: Colors.entertainment, icon: '🎬', iconName: 'entertainment' },
  Travel: { color: Colors.travel, icon: '✈️', iconName: 'travel' },
  Shopping: { color: Colors.shopping, icon: '🛍️', iconName: 'shopping-bag' },
  Health: { color: Colors.health, icon: '❤️', iconName: 'health' },
  Education: { color: Colors.education, icon: '🎓', iconName: 'education' },
  Income: { color: Colors.success, icon: '💰', iconName: 'income' },
  Others: { color: Colors.textSecondary, icon: '📌', iconName: 'others' },
  'Wallet/Recharge': { color: Colors.recharge, icon: '👛', iconName: 'wallet' },
  'P2P / Merchant': { color: Colors.p2p, icon: '👥', iconName: 'users' },
  Merchant: { color: Colors.textSecondary, icon: '🏪', iconName: 'store' },
  'Bank Transfer': { color: Colors.primary, icon: '🏦', iconName: 'building' },
  Mandate: { color: Colors.info, icon: '🔄', iconName: 'repeat' },
  Uncategorized: { color: Colors.textTertiary, icon: '❓', iconName: 'help' },
  
  // Income categories
  Salary: { color: '#10B981', icon: '💼', iconName: 'briefcase' },
  Freelance: { color: '#8B5CF6', icon: '💻', iconName: 'laptop' },
  Investment: { color: '#F59E0B', icon: '📈', iconName: 'trending-up' },
  Gift: { color: '#EC4899', icon: '🎁', iconName: 'gift' },
  Refund: { color: '#06B6D4', icon: '↩️', iconName: 'refund' },
  Other: { color: Colors.textSecondary, icon: '💵', iconName: 'banknote' },
};
