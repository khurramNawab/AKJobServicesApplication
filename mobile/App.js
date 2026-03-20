import React from 'react';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * ROOT COMPONENT
 * 
 * Hierarchy:
 * 1. GestureHandlerRootView: Mandatory for react-native-gesture-handler core logic.
 * 2. SafeAreaProvider: Provides edge-to-edge layout data to the whole app.
 * 3. AppNavigator: Standard React Navigation stack.
 */
export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <StatusBar style="auto" />
                <AppNavigator />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
