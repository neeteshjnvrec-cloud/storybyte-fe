// Beautiful Light Theme for Main App (after login)
export const APP_COLORS = {
  // Primary Colors - Soft Purple
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primaryLight: '#A78BFA',
  
  // Neutral Colors - Light & Airy
  background: '#F8F9FE',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text Colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // UI Elements
  border: '#E5E7EB',
  divider: '#F3F4F6',
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
  
  // Gradients
  gradientStart: '#A78BFA',
  gradientEnd: '#7C3AED',
  
  // Story Card Accent Colors - Multiple lovely colors
  accent1: '#FF6B9D',    // Pink
  accent2: '#4ECDC4',    // Turquoise
  accent3: '#FFD93D',    // Yellow
  accent4: '#95E1D3',    // Mint
  accent5: '#FF8B94',    // Coral
  accent6: '#A8E6CF',    // Green
  accent7: '#FFB6C1',    // Light Pink
  accent8: '#87CEEB',    // Sky Blue
};

export const APP_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const APP_TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const APP_BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
