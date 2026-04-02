import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

/**
 * EliteGradient Component
 * Provides a standardized gradient background for premium UI elements.
 */
const EliteGradient = ({ 
    children, 
    style, 
    variant = 'primary', // 'primary', 'secondary', 'surface', 'clear'
    horizontal = true 
}) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const getGradientColors = () => {
        switch (variant) {
            case 'secondary':
                return COLORS.gradientSecondary;
            case 'surface':
                return isDarkMode 
                    ? [COLORS.surface, COLORS.background] 
                    : [COLORS.surface, COLORS.backgroundSecondary];
            case 'clear':
                return ['transparent', 'transparent'];
            case 'primary':
            default:
                return COLORS.gradientPrimary;
        }
    };

    return (
        <LinearGradient
            colors={getGradientColors()}
            start={horizontal ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 }}
            end={horizontal ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 }}
            style={[styles.gradient, style]}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
});

export default EliteGradient;
