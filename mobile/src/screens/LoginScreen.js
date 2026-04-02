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
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import PremiumButton from '../components/PremiumButton';
import PremiumInput from '../components/PremiumInput';
import EliteGradient from '../components/EliteGradient';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const setCredentials = useAuthStore((state) => state.setCredentials);
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const handleLogin = async () => {
        if (!phoneNumber || !password) {
            Alert.alert('Incomplete Info', 'Please enter both your phone number and password to log in.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/login', { phoneNumber, password });

            if (res.data.success) {
                const user = {
                    _id: res.data._id,
                    name: res.data.name,
                    phoneNumber: res.data.phoneNumber,
                    role: res.data.role
                };
                await setCredentials(user, res.data.token);
            }
        } catch (error) {
            console.error('Login Error:', error.response?.data?.message || error.message);
            Alert.alert('Login Failed', error.response?.data?.message || 'Check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper top={false} bottom={false}>
            <EliteGradient style={StyleSheet.absoluteFill} />
            
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Animated.View entering={FadeInDown.duration(800)} style={styles.logoContainer}>
                            <View style={[styles.logoIcon, { backgroundColor: '#FFF' }]}>
                                <Ionicons name="briefcase" size={40} color={COLORS.primary} />
                            </View>
                        </Animated.View>
                        <Animated.Text entering={FadeInDown.delay(200)} style={styles.welcomeTxt}>Welcome Back</Animated.Text>
                        <Animated.Text entering={FadeInDown.delay(400)} style={styles.subTxt}>Log in to access your professional opportunities.</Animated.Text>
                    </View>

                    <Animated.View entering={FadeInUp.delay(600)} style={[styles.formCard, { backgroundColor: COLORS.surface }]}>
                        <PremiumInput
                            label="Phone Number"
                            placeholder="e.g. 9876543210"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            iconLeft={<Ionicons name="call-outline" size={20} color={COLORS.textTertiary} />}
                        />

                        <PremiumInput
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            iconLeft={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textTertiary} />}
                            iconRight={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textTertiary} />
                                </TouchableOpacity>
                            }
                        />

                        <TouchableOpacity 
                            style={styles.forgotBtn}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={[styles.forgotTxt, { color: COLORS.primary }]}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <PremiumButton
                            title="Log In"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginBtn}
                        />

                        <View style={styles.footer}>
                            <Text style={[styles.footerTxt, { color: COLORS.textSecondary }]}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={[styles.linkTxt, { color: COLORS.primary }]}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SIZES.lg,
        paddingTop: 80,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    welcomeTxt: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -1,
    },
    subTxt: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
        paddingHorizontal: 20,
    },
    formCard: {
        borderRadius: 32,
        padding: SIZES.xl,
        ...SHADOWS.glass,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotTxt: {
        fontSize: 14,
        fontWeight: '700',
    },
    loginBtn: {
        height: 60,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerTxt: {
        fontSize: 15,
        fontWeight: '600',
    },
    linkTxt: {
        fontSize: 15,
        fontWeight: '800',
    }
});

export default LoginScreen;
