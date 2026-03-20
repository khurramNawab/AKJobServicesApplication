import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';

const GlassCard = ({ children, style, onPress, activeOpacity = 0.8 }) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
    
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container 
            onPress={onPress} 
            activeOpacity={activeOpacity}
            style={[
                styles.outerContainer, 
                SHADOWS.soft, 
                { backgroundColor: COLORS.white, borderColor: COLORS.border },
                style
            ]}
        >
            <View style={styles.innerContainer}>
                {children}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        borderRadius: SIZES.radiusLg,
        borderWidth: 1,
        overflow: 'hidden',
    },
    innerContainer: {
        padding: SIZES.md,
    },
    glass: {
        ...StyleSheet.absoluteFillObject,
        // Using a default if needed, but typically glassBg is theme-dependent
    }
});

export default GlassCard;
