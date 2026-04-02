import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

/**
 * SkeletonLoader Component
 * High-performance shimmering skeleton placeholder for data loading states.
 */
const SkeletonLoader = ({ 
    width: w = '100%', 
    height: h = 20, 
    borderRadius = SIZES.radiusSm, 
    style 
}) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const translateX = useSharedValue(-1);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(1, { duration: 1200 }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{
            translateX: interpolate(
                translateX.value,
                [-1, 1],
                [-width, width],
                Extrapolate.CLAMP
            )
        }]
    }));

    const backgroundColor = isDarkMode ? '#1E293B' : '#F1F5F9';
    const highlightColor = isDarkMode ? '#334155' : '#FFFFFF';

    return (
        <View style={[
            styles.container, 
            { width: w, height: h, borderRadius, backgroundColor }, 
            style
        ]}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                <LinearGradient
                    colors={['transparent', highlightColor, 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
});

export default SkeletonLoader;
