export const LIGHT_COLORS = {
    primary: '#6366F1',
    primaryLight: '#818CF8',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#F8FAFC',
    backgroundLight: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    textPrimary: '#0F172A', 
    textSecondary: '#475569', 
    textTertiary: '#94A3B8',
    textInverse: '#FFFFFF',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    border: '#E2E8F0',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
};

// Default export for backward compatibility MUST BE DEFINED EARLY
export const COLORS = LIGHT_COLORS;

export const DARK_COLORS = {
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    secondary: '#34D399',
    accent: '#FBBF24',
    background: '#0F172A',
    backgroundLight: '#1E293B',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textInverse: '#0F172A',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    border: '#334155',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    glassBg: 'rgba(30, 41, 59, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const SIZES = {
    // Spacing
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,

    // Typography
    base: 14,
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 12,
    
    // Radius
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 20,
    radiusFull: 9999,
};

export const SHADOWS = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    medium: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    glass: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 5,
    }
};

export default COLORS;
