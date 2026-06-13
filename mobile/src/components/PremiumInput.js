import React, { useState } from 'react';
import { 
    View, 
    TextInput, 
    StyleSheet, 
    Text, 
    Platform 
} from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring, 
    withTiming, 
    interpolateColor 
} from 'react-native-reanimated';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SIZES } from '../constants/theme';

/**
 * PremiumInput Component
 * Offers animated focus states, modern shadow effects, and icon support.
 */
const PremiumInput = ({ 
    label, 
    placeholder, 
    value, 
    onChangeText, 
    iconLeft, 
    iconRight, 
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'none',
    error,
    containerStyle,
}) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [isFocused, setIsFocused] = useState(false);
    
    // Animation shared value
    const focusAnim = useSharedValue(0);

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            borderColor: withTiming(
                error 
                    ? COLORS.danger 
                    : interpolateColor(
                        focusAnim.value,
                        [0, 1],
                        [isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', COLORS.primary]
                    )
            ),
            backgroundColor: withTiming(
                focusAnim.value > 0.5 
                    ? (isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)')
                    : (isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.5)')
            ),
            transform: [{ scale: withSpring(focusAnim.value > 0.5 ? 1.01 : 1) }],
            borderWidth: withTiming(focusAnim.value > 0.5 ? 1.5 : 1),
        };
    });

    const handleFocus = () => {
        setIsFocused(true);
        focusAnim.value = withTiming(1, { duration: 250 });
    };

    const handleBlur = () => {
        setIsFocused(false);
        focusAnim.value = withTiming(0, { duration: 250 });
    };

    return (
        <View style={[styles.mainContainer, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: COLORS.textSecondary }]}>
                    {label}
                </Text>
            )}
            
            <Animated.View style={[styles.inputWrapper, animatedContainerStyle]}>
                {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
                
                <TextInput
                    style={[
                        styles.input, 
                        { color: COLORS.textPrimary }
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textTertiary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    selectionColor={COLORS.primary}
                />
                
                {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
            </Animated.View>

            {error && (
                <Text style={[styles.errorText, { color: COLORS.danger }]}>
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        width: '100%',
        marginBottom: SIZES.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 16,
        minHeight: 60,
    },
    iconLeft: {
        marginRight: 12,
    },
    iconRight: {
        marginLeft: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    },
    errorText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 6,
        marginLeft: 4,
    },
});

export default PremiumInput;
