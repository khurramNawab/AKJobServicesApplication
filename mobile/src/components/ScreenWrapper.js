import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

/**
 * Premium ScreenWrapper
 * Handles Safe Areas, Status Bar, and consistent background coloring.
 */
const ScreenWrapper = ({ 
    children, 
    style, 
    top = true, 
    bottom = true,
    backgroundColor,
    statusBarStyle
}) => {
    const insets = useSafeAreaInsets();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const bg = backgroundColor || COLORS.background;

    return (
        <View style={[
            styles.container, 
            { 
                backgroundColor: bg,
                paddingTop: top ? insets.top : 0,
                paddingBottom: bottom ? insets.bottom : 0,
                paddingLeft: insets.left,
                paddingRight: insets.right,
            },
            style
        ]}>
            <StatusBar 
                style={statusBarStyle || (isDarkMode ? 'light' : 'dark')} 
                backgroundColor="transparent"
                translucent
            />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ScreenWrapper;
