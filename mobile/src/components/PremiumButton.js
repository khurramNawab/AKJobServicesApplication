import React from 'react';
import { 
    TouchableOpacity, 
    Text, 
    StyleSheet, 
    ActivityIndicator, 
    View,
    Platform
} from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SIZES, SHADOWS } from '../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * PremiumButton Component
 * Offers haptic feedback, scale animations, and premium gradient styling.
 */
const PremiumButton = ({ 
    title, 
    onPress, 
    loading = false, 
    disabled = false, 
    variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
    size = 'lg',       // 'sm', 'md', 'lg'
    style,
    iconLeft,
    iconRight,
    fullWidth = true
}) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    // Animation values
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const onPressIn = () => {
        scale.value = withSpring(0.96);
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const onPressOut = () => {
        scale.value = withSpring(1);
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return { colors: COLORS.gradientSecondary, text: '#FFF', border: null };
            case 'outline':
                return { colors: ['transparent', 'transparent'], text: COLORS.primary, border: COLORS.primary };
            case 'ghost':
                return { colors: ['transparent', 'transparent'], text: COLORS.textSecondary, border: null };
            case 'danger':
                return { colors: [COLORS.danger, COLORS.danger], text: '#FFF', border: null };
            case 'primary':
            default:
                return { 
                    colors: (disabled || loading) ? [COLORS.border, COLORS.border] : COLORS.gradientPrimary, 
                    text: '#FFF', 
                    border: null 
                };
        }
    };

    const { colors, text, border } = getVariantStyles();

    return (
        <AnimatedTouchable
            activeOpacity={1}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                { width: fullWidth ? '100%' : 'auto' },
                animatedStyle,
                variant === 'outline' && { borderWidth: 1.5, borderColor: border },
                SHADOWS.medium,
                style
            ]}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                    styles.gradient,
                    { height: size === 'sm' ? 44 : size === 'md' ? 54 : 64 }
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={text} size="small" />
                ) : (
                    <View style={styles.content}>
                        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
                        <Text style={[
                            styles.text, 
                            { color: text, fontSize: size === 'sm' ? 14 : 16 }
                        ]}>
                            {title}
                        </Text>
                        {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
                    </View>
                )}
            </LinearGradient>
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SIZES.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '800',
        letterSpacing: -0.2,
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});

export default PremiumButton;
