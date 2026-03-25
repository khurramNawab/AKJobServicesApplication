import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

/**
 * ScreenWrapper provides a consistent layout with proper safe area handling.
 * It prevents UI from overlapping with the status bar and navigation bar.
 */
const ScreenWrapper = ({ children, style, top = true, bottom = true }) => {
    const insets = useSafeAreaInsets();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    return (
        <View style={[
            styles.container, 
            { 
                backgroundColor: COLORS.background,
                paddingTop: top ? insets.top : 0,
                paddingBottom: bottom ? insets.bottom : 0,
                paddingLeft: insets.left,
                paddingRight: insets.right,
            },
            style
        ]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
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
