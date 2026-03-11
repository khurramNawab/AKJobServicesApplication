import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/useAuthStore';
import { COLORS } from '../constants/theme';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'ApplicationsTab') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'ProfileTab') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textHint,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    elevation: 0,
                }
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
            {user?.role === 'RECRUITER' ? (
                <Tab.Screen name="ApplicationsTab" component={RecruiterJobsScreen} options={{ title: 'My Postings' }} />
            ) : (
                <Tab.Screen name="ApplicationsTab" component={MyApplicationsScreen} options={{ title: 'Applications' }} />
            )}
            <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { token, isLoading, loadCredentials } = useAuthStore();

    useEffect(() => {
        loadCredentials();
    }, [loadCredentials]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundLight }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token == null ? (
                    // No token found, user isn't signed in
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    // User is signed in
                    <>
                        {/* The MainTabs replace the single HomeScreen */}
                        <Stack.Screen name="Main" component={MainTabs} />

                        <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
                        <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
                        <Stack.Screen name="CreateJob" component={CreateJobScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="EditRecruiterProfile" component={EditRecruiterProfileScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
