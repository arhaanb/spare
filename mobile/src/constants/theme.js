// Theme constants
// - [x] Redesign `CategoryFilter` component
// - [x] Adjust `HomeScreen` layout
// - [ ] Redesign `BottomTabBar` component
// - [ ] Verify UI matches the attached images

// #### [MODIFY] [CategoryFilter.js](file:///Users/arhaanb/projects/spare-admin/mobile/src/components/CategoryFilter.js)
// - Update the category card design:
//   - Active state: Light green background (`#C6F04D`), dark text/icon (`#0A3522`).
//   - Inactive state: Dark green background (`#134631`), light green text/outlines (`#C6F04D`).
// - Adjust dimensions and spacing to match the square-ish layout in the image.

// #### [MODIFY] [BottomTabBar.js](file:///Users/arhaanb/projects/spare-admin/mobile/src/components/BottomTabBar.js)
// - Redesign the tab bar to be a floating pill:
//   - Background: Very dark grey/black (`#1A1A1B`).
//   - Border: Thin light green border (`#C6F04D`).
//   - Shape: Pill-shaped (high border radius).
//   - Colors: Active tab in light green (`#C6F04D`), inactive in grey.

export const COLORS = {
  // Primary colors
  background: '#0A3522',
  cardBackground: '#085420',
  primaryAccent: '#22C55E',
  surface: 'rgba(10, 20, 16, 0.55)',
  surfaceStrong: 'rgba(8, 16, 13, 0.8)',
  glass: 'rgba(255, 255, 255, 0.08)',
  highlightPink: '#E296D7',

  // Header and Category specific
  headerBox: '#134631',
  locationText: '#E6A9FF', // Pink-ish color from image
  activeCategory: '#C6F04D', // Light green from image
  activeCategoryText: '#0A3522',
  inactiveCategory: '#134631',
  inactiveCategoryText: '#C6F04D',

  // Tab Bar
  tabBarBackground: '#161616',
  tabBarBorder: '#2D4A38',
  tabBarActive: '#C6F04D',
  tabBarInactive: '#666666',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textOnDark: '#F8FAFC',
  textOnMuted: 'rgba(248, 250, 252, 0.7)',

  // Font Families
  fontSerif: 'Gargoyle',
  fontSans: 'Saans',
  fontSansBold: 'Saans-Bold',
  fontSansMedium: 'Saans-Medium',
  fontSansSemiBold: 'Saans-SemiBold',
  fontSansLight: 'Saans-Light',

  // Border and outlines
  border: '#1E3A28',
  borderLight: '#2D4A38',

  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  // Badge colors
  badgeDefault: '#22C55E',
  badgeSecondary: '#1E3A28',
  badgeOutline: 'transparent',

  // Rating
  starActive: '#F59E0B',
  starInactive: '#374151',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlaySoft: 'rgba(5, 10, 8, 0.35)',
  overlayStrong: 'rgba(5, 10, 8, 0.6)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 40,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  SHADOWS,
};
