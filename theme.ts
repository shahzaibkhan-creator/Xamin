export type ThemeMode = 'dark' | 'light' | 'tech';

export interface ThemeColors {
  // Base colors
  background: string;
  surface: string;
  surfaceLight: string;
  card: string;
  cardBorder: string;
  
  // Accent colors
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Gradients
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  
  // Shadow color
  shadowColor: string;
}

// Dark Mode - Original neon theme
export const darkColors: ThemeColors = {
  background: '#0a0a0f',
  surface: '#12121a',
  surfaceLight: '#1a1a25',
  card: 'rgba(20, 20, 30, 0.8)',
  cardBorder: 'rgba(100, 150, 255, 0.1)',
  
  primary: '#00d4ff',      // Neon Blue
  secondary: '#00ffc8',    // Neon Cyan
  tertiary: '#a855f7',     // Neon Purple
  quaternary: '#ec4899',   // Neon Pink
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  
  gradientStart: '#00d4ff',
  gradientMid: '#a855f7',
  gradientEnd: '#ec4899',
  
  shadowColor: '#00d4ff',
};

// Light Mode - Soft, natural palette
export const lightColors: ThemeColors = {
  background: '#F9F6F1',      // Bone White
  surface: '#FFFFFF',
  surfaceLight: '#F5F5F5',    // Light Grey
  card: 'rgba(255, 255, 255, 0.95)',
  cardBorder: 'rgba(176, 224, 230, 0.4)',  // Powder Blue border
  
  primary: '#B0E0E6',         // Powder Blue
  secondary: '#93C572',       // Pista Green
  tertiary: '#D2B48C',        // Light Tan
  quaternary: '#D3D3D3',      // Light Grey accent
  
  success: '#93C572',         // Pista Green
  warning: '#D2B48C',         // Light Tan
  error: '#E57373',           // Soft red
  info: '#B0E0E6',            // Powder Blue
  
  textPrimary: '#2C2C2C',
  textSecondary: 'rgba(44, 44, 44, 0.7)',
  textMuted: 'rgba(44, 44, 44, 0.45)',
  
  gradientStart: '#B0E0E6',   // Powder Blue
  gradientMid: '#93C572',     // Pista Green
  gradientEnd: '#D2B48C',     // Light Tan
  
  shadowColor: '#B0E0E6',
};

// Tech Mode - Premium dark with metallic accents
export const techColors: ThemeColors = {
  background: '#0A0A12',      // Deep Black
  surface: '#101020',         // Dark Blue-Black
  surfaceLight: '#1A1A2E',    // Dark Blue
  card: 'rgba(16, 16, 32, 0.9)',
  cardBorder: 'rgba(212, 175, 55, 0.2)',  // Gold border
  
  primary: '#D4AF37',         // Gold
  secondary: '#C0C0C0',       // Silver
  tertiary: '#1E3A5F',        // Dark Blue
  quaternary: '#0D0D0D',      // Black accent
  
  success: '#50C878',         // Emerald
  warning: '#D4AF37',         // Gold
  error: '#CD5C5C',           // Indian Red
  info: '#4682B4',            // Steel Blue
  
  textPrimary: '#E8E8E8',     // Silver White
  textSecondary: 'rgba(192, 192, 192, 0.8)',  // Silver
  textMuted: 'rgba(192, 192, 192, 0.5)',
  
  gradientStart: '#D4AF37',   // Gold
  gradientMid: '#C0C0C0',     // Silver
  gradientEnd: '#1E3A5F',     // Dark Blue
  
  shadowColor: '#D4AF37',
};

// Get colors based on theme mode
export const getThemeColors = (mode: ThemeMode): ThemeColors => {
  switch (mode) {
    case 'light':
      return lightColors;
    case 'tech':
      return techColors;
    case 'dark':
    default:
      return darkColors;
  }
};

// Default export for backward compatibility
export const colors = darkColors;

export const getShadows = (themeColors: ThemeColors) => ({
  card: {
    shadowColor: themeColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: themeColors.shadowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
});

export const shadows = getShadows(darkColors);

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
