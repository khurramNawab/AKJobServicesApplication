/**
 * Premium Elite Tech Design System v2
 * 
 * Based on 8pt Grid, Indigo/Blue Gradients, and Soft Glassmorphism.
 * Focused on high-contrast light mode and depth.
 */

export const LIGHT_COLORS = {
    // Brand Colors
    primary: '#4F46E5', 
    primaryLight: '#818CF8', 
    primaryDark: '#3730A3', 
    
    // Gradients
    gradientPrimary: ['#4F46E5', '#3B82F6'],
    gradientSecondary: ['#6366F1', '#A855F7'], 
    
    // UI Colors - Premium Soft Tones
    background: '#F8FAFC', // Soft pearl gray
    backgroundSecondary: '#F1F5F9', 
    surface: '#FFFFFF', // Elevated cards are pure white
    surfaceSecondary: '#F1F5F9', 
    
    // Text Hierarchy
    textPrimary: '#0F172A', // Deep Navy
    textSecondary: '#475569', // Slate
    textTertiary: '#94A3B8', // Muted Slate
    textInverse: '#FFFFFF',
    
    // Status
    success: '#10B981',
    successLight: '#D1FAE5',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    
    // Borders
    border: 'rgba(226, 232, 240, 0.6)', 
    borderLight: 'rgba(241, 245, 249, 0.5)', 
    
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    
    // Effects
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    soft: 'rgba(0, 0, 0, 0.03)',
};

export const DARK_COLORS = {
    // Brand Colors
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    primaryDark: '#6366F1',
    
    // Gradients
    gradientPrimary: ['#6366F1', '#3B82F6'],
    gradientSecondary: ['#818CF8', '#8B5CF6'],
    
    // UI Colors
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    
    // Text
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textInverse: '#0F172A',
    
    // Status
    success: '#34D399',
    successLight: 'rgba(52, 211, 153, 0.1)',
    danger: '#F87171',
    dangerLight: 'rgba(248, 113, 113, 0.1)',
    warning: '#FBBF24',
    warningLight: 'rgba(251, 191, 36, 0.1)',
    info: '#60A5FA',
    
    // Borders
    border: '#334155',
    borderLight: '#1E293B',
    
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    
    // Effects
    glassBg: 'rgba(30, 41, 59, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const SIZES = {
    // 8pt Grid System
    xs: 4,
    sm: 8,
    md: 12, // New token for more precision
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 48,
    
    // Typography
    fontXs: 12,
    fontSm: 14,
    fontBase: 16,
    fontLg: 18,
    fontXl: 24,
    fontXxl: 34,
    
    // Radius
    radiusSm: 12,
    radiusMd: 16,
    radiusLg: 24,
    radiusXl: 32,
    radiusFull: 9999,
};

export const SHADOWS = {
    low: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    high: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 10,
    },
    premium: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    }
};

export const TYPOGRAPHY = {
    h1: {
        fontSize: SIZES.fontXxl,
        fontWeight: '900',
        letterSpacing: -1,
        lineHeight: 42,
    },
    h2: {
        fontSize: SIZES.fontXl,
        fontWeight: '800',
        letterSpacing: -0.5,
        lineHeight: 32,
    },
    h3: {
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        letterSpacing: -0.3,
        lineHeight: 26,
    },
    bodyLarge: {
        fontSize: SIZES.fontBase,
        fontWeight: '500',
        lineHeight: 24,
    },
    bodyMedium: {
        fontSize: SIZES.fontSm,
        fontWeight: '500',
        lineHeight: 20,
    },
    bodySmall: {
        fontSize: SIZES.fontXs,
        fontWeight: '600',
        lineHeight: 18,
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
};

export default { LIGHT_COLORS, DARK_COLORS, SIZES, SHADOWS, TYPOGRAPHY };
