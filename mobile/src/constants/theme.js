export const COLORS = {
    primary: '#0A66C2',   // Brand Blue (LinkedIn style)
    secondary: '#FFB822', // Accent yellow
    backgroundLight: '#F3F4F6', // Off white bg
    backgroundDark: '#1F2937', // Dark mode bg

    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textHint: '#9CA3AF',
    textInverse: '#FFFFFF',

    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',

    white: '#FFFFFF',
    black: '#000000',
    card: '#FFFFFF',
    border: '#E5E7EB',
};

export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.textPrimary,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 2, // Android
    },
    medium: {
        shadowColor: COLORS.textPrimary,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 6,
    },
};
