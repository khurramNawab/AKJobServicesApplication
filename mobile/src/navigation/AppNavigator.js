import React, { useEffect } from 'react';
import { View, ActivityIndicator, Platform, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import JobDetailsScreen from '../screens/JobDetailsScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RecruiterJobsScreen from '../screens/RecruiterJobsScreen';
import JobApplicantsScreen from '../screens/JobApplicantsScreen';
import CreateJobScreen from '../screens/CreateJobScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EditRecruiterProfileScreen from '../screens/EditRecruiterProfileScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import ResumeViewerScreen from '../screens/ResumeViewerScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';

// SplashScreen.preventAutoHideAsync().catch(() => {});
console.log('SplashScreen prevention disabled for debugging');

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const user = useAuthStore((state) => state.user);
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'HomeTab') iconName = focused ? 'sparkles' : 'sparkles-outline';
                    else if (route.name === 'ApplicationsTab') iconName = focused ? 'briefcase' : 'briefcase-outline';
                    else if (route.name === 'MessagesTab') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                    else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';

                    return (
                        <View style={focused ? styles.activeIconCircle : null}>
                            <Ionicons name={iconName} size={size + (focused ? 2 : 0)} color={color} />
                        </View>
                    );
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textTertiary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    marginBottom: Platform.OS === 'ios' ? 0 : 8,
                },
                tabBarStyle: {
                    height: Platform.OS === 'ios' ? 88 : 68,
                    paddingTop: 10,
                    backgroundColor: COLORS.surface,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    ...SHADOWS.medium,
                }
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Explore' }} />
            {user?.role === 'RECRUITER' ? (
                <Tab.Screen name="ApplicationsTab" component={RecruiterJobsScreen} options={{ title: 'Postings' }} />
            ) : (
                <Tab.Screen name="ApplicationsTab" component={MyApplicationsScreen} options={{ title: 'My Jobs' }} />
            )}
            <Tab.Screen name="MessagesTab" component={ChatListScreen} options={{ title: 'Chat' }} />
            <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Settings' }} />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { token, isLoading, loadCredentials } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    console.log('AppNavigator rendering, isLoading:', isLoading, 'token:', !!token);

    useEffect(() => {
        console.log('Calling loadCredentials...');
        loadCredentials();
    }, [loadCredentials]);

    useEffect(() => {
        console.log('isLoading changed to:', isLoading);
        if (!isLoading) {
            console.log('Hiding SplashScreen');
            SplashScreen.hideAsync().catch(err => console.log('Error hiding splash:', err));
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <Stack.Navigator 
                screenOptions={{ 
                    headerShown: false,
                    animation: 'fade_from_bottom',
                    contentStyle: { backgroundColor: COLORS.background }
                }}
            >
                {token == null ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
                        <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
                        <Stack.Screen name="CreateJob" component={CreateJobScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="EditRecruiterProfile" component={EditRecruiterProfileScreen} />
                        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                        <Stack.Screen 
                            name="ResumeViewer" 
                            component={ResumeViewerScreen} 
                            options={{ presentation: 'modal' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIconCircle: {
        // Optional circle decoration
    }
});

export default AppNavigator;


