import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LIGHT_COLORS, DARK_COLORS, SIZES, TYPOGRAPHY } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import PremiumButton from './PremiumButton';

const { width } = Dimensions.get('window');

/**
 * EmptyState Component
 * Premium placeholder for screens with no content (Jobs, Chats, Search).
 */
const EmptyState = ({ 
    icon = 'file-tray-outline', 
    title = 'No Content Found', 
    description = "We couldn't find what you're looking for. Try a different search or filter.",
    buttonTitle,
    onButtonPress,
    style
}) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    return (
        <View style={[styles.container, style]}>
            <Animated.View 
                entering={ZoomIn.duration(800).springify()}
                style={[styles.iconContainer, { backgroundColor: COLORS.primary + '10' }]}
            >
                <Ionicons name={icon} size={64} color={COLORS.primary} />
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(200).duration(800)}>
                <Text style={[styles.title, { color: COLORS.textPrimary }]}>{title}</Text>
                <Text style={[styles.description, { color: COLORS.textSecondary }]}>{description}</Text>
            </Animated.View>

            {buttonTitle && (
                <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                    <PremiumButton
                        title={buttonTitle}
                        onPress={onButtonPress}
                        style={styles.button}
                    />
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        marginTop: 60,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.xl,
    },
    title: {
        ...TYPOGRAPHY.h2,
        textAlign: 'center',
        marginBottom: SIZES.sm,
    },
    description: {
        ...TYPOGRAPHY.bodyMedium,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SIZES.xl,
    },
    button: {
        width: 200,
    }
});

export default EmptyState;
