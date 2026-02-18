export const COLORS = {
  // Primary Colors
  primary: '#667eea',
  primaryDark: '#764ba2',
  primaryLight: '#8b9aff',
  
  // Secondary Colors
  secondary: '#f093fb',
  secondaryDark: '#f5576c',
  
  // Neutral Colors
  background: '#0a0a0a',
  surface: '#1a1a1a',
  card: '#2a2a2a',
  
  // Text Colors
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  textTertiary: '#666666',
  
  // Status Colors
  success: '#4ade80',
  error: '#f87171',
  warning: '#fbbf24',
  info: '#60a5fa',
  
  // UI Elements
  border: '#333333',
  divider: '#2a2a2a',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Gradients
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
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

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
