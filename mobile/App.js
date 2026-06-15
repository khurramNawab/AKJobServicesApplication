import React from 'react';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import NetInfo from '@react-native-community/netinfo';
import NoConnectionScreen from './src/components/NoConnectionScreen';

/**
 * ROOT COMPONENT
 * 
 * Hierarchy:
 * 1. GestureHandlerRootView: Mandatory for react-native-gesture-handler core logic.
 * 2. SafeAreaProvider: Provides edge-to-edge layout data to the whole app.
 * 3. AppNavigator: Standard React Navigation stack.
 */
export default function App() {
    const [isConnected, setIsConnected] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected !== false); // Default to true if null
        });

        // Initial check
        NetInfo.fetch().then(state => {
            setIsConnected(state.isConnected !== false);
        });

        return () => unsubscribe();
    }, []);

    const handleRetry = () => {
        NetInfo.fetch().then(state => {
            setIsConnected(state.isConnected !== false);
        });
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <StatusBar style="auto" />
                <AppNavigator />
                {!isConnected && <NoConnectionScreen onRetry={handleRetry} />}
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
