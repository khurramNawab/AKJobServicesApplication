import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';

const ModernButton = ({ 
    title, 
    onPress, 
    loading = false, 
    variant = 'primary', // primary, secondary, outline, ghost
    size = 'md',        // sm, md, lg
    style,
    textStyle,
    icon
}) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';
    const isSecondary = variant === 'secondary';

    const renderContent = () => (
        <View style={styles.content}>
            {loading ? (
                <ActivityIndicator color={isOutline || isGhost ? COLORS.primary : '#FFFFFF'} />
            ) : (
                <>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[
                        styles.text,
                        isOutline && { color: COLORS.primary },
                        isGhost && { color: COLORS.textSecondary },
                        isSecondary && { color: COLORS.secondary },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </>
            )}
        </View>
    );

    if (isPrimary) {
        return (
            <TouchableOpacity 
                onPress={onPress} 
                disabled={loading}
                activeOpacity={0.8}
                style={[styles.container, SHADOWS.medium, style]}
            >
                <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity 
            onPress={onPress} 
            disabled={loading}
            activeOpacity={0.7}
            style={[
                styles.container,
                isOutline && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
                isGhost && { backgroundColor: 'transparent' },
                isSecondary && { backgroundColor: COLORS.secondary + '15' },
                style
            ]}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
        minHeight: 48,
        justifyContent: 'center',
    },
    gradient: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    iconContainer: {
        marginRight: 8,
    }
});

export default ModernButton;
