import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SIZES } from '../constants/theme';

// Premium Components
import PremiumButton from '../components/PremiumButton';
import PremiumInput from '../components/PremiumInput';
import ScreenWrapper from '../components/ScreenWrapper';

const { height, width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const setCredentials = useAuthStore((state) => state.setCredentials);
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const validateEmail = (input) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(input.trim());
    };

    const handleLogin = async () => {
        if (loading) return; 

        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !password) {
            Alert.alert('Incomplete Info', 'Please enter both your email address and password to log in.');
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/login', { email: trimmedEmail, password });

            if (res.data.success) {
                const userRole = res.data.user?.role || res.data.role;
                
                if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'MODERATOR') {
                    Alert.alert(
                        'Access Restricted',
                        'The Admin and Moderator panel is only accessible on the Web dashboard. Mobile login is restricted to Candidates and Recruiters.'
                    );
                    setLoading(false);
                    return;
                }

                const user = {
                    _id: res.data.user?._id || res.data._id,
                    name: res.data.user?.name || res.data.name,
                    email: res.data.user?.email || res.data.email,
                    role: userRole
                };
                const token = res.data.accessToken || res.data.token;
                const refreshToken = res.data.refreshToken;
                await setCredentials(user, token, refreshToken);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Check your internet connection and try again.';
            
            if (error.response?.status === 403 && error.response?.data?.needsVerification) {
                Alert.alert(
                    'Verification Required',
                    'Your email address has not been verified yet. Would you like us to resend the verification link?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Resend Email', 
                            onPress: async () => {
                                try {
                                    await api.post('/auth/resend-verification', { email: trimmedEmail });
                                    Alert.alert('Email Sent', 'Verification link has been sent to your email.');
                                } catch (resendError) {
                                    Alert.alert('Error', resendError.response?.data?.message || 'Failed to resend. Please try again later.');
                                }
                            } 
                        }
                    ]
                );
            } else {
                Alert.alert('Login Failed', errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper top={true} bottom={true} backgroundColor={isDarkMode ? COLORS.background : '#FFFFFF'}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <Animated.View entering={FadeInDown.duration(600).springify()}>
                            <Image 
                                source={require('../../assets/images/AK_Job_services_logo.png')} 
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.Text entering={FadeInDown.delay(100).duration(600)} style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>
                            Welcome back
                        </Animated.Text>
                        <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Log in to access your professional opportunities.
                        </Animated.Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        <Animated.View entering={FadeInUp.delay(300).duration(600)}>
                            <PremiumInput
                                label="Email"
                                placeholder="name@company.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                iconLeft={<Ionicons name="mail-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />}
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
                            <PremiumInput
                                label="Password"
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                iconLeft={<Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />}
                                iconRight={
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    </TouchableOpacity>
                                }
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(500).duration(600)}>
                            <TouchableOpacity 
                                style={styles.forgotBtn}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={[styles.forgotTxt, { color: COLORS.primary }]}>Forgot password?</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(600).duration(600)}>
                            <PremiumButton
                                title="Log In"
                                onPress={handleLogin}
                                loading={loading}
                                style={styles.loginBtn}
                            />
                        </Animated.View>
                    </View>

                    <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.footer}>
                        <Text style={[styles.footerTxt, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={[styles.linkTxt, { color: COLORS.primary }]}>Sign up</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SIZES.xl,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    logo: {
        width: 140,
        height: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 32,
        marginTop: -4,
    },
    forgotTxt: {
        fontSize: 14,
        fontWeight: '600',
    },
    loginBtn: {
        height: 56,
        borderRadius: 12, // slightly less rounded for enterprise feel
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerTxt: {
        fontSize: 15,
        fontWeight: '400',
    },
    linkTxt: {
        fontSize: 15,
        fontWeight: '700',
    }
});

export default LoginScreen;
