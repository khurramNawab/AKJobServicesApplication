import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView,
    Dimensions,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import ScreenWrapper from '../components/ScreenWrapper';
import PremiumInput from '../components/PremiumInput';
import PremiumButton from '../components/PremiumButton';
import api from '../services/api';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const validateEmail = (input) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(input.trim());
    };

    const handleSendOTP = async () => {
        if (loading) return; 

        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) {
            Alert.alert('Missing Email', 'Please enter your registered email address.');
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/forgot-password/send-otp', { email: trimmedEmail });
            
            setStep(2);
            Alert.alert('OTP Sent', `A secure verification code has been sent to your email: ${trimmedEmail}`);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (loading) return;

        const trimmedEmail = email.trim().toLowerCase();
        if (!otp || !newPassword) {
            Alert.alert('Missing Info', 'Please enter both the OTP and your new password.');
            return;
        }

        if (otp.length < 6) {
            Alert.alert('Invalid Code', 'OTP must be a 6-digit numeric code.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Weak Password', 'New password must be at least 6 characters long.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/forgot-password/verify', { 
                email: trimmedEmail, 
                otp: otp.trim(), 
                newPassword 
            });
            
            Alert.alert('Success', 'Your password has been reset successfully.', [
                { text: 'Login Now', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            Alert.alert('Reset Failed', error.response?.data?.message || 'Invalid OTP or network error.');
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
                            {step === 1 ? 'Reset Password' : 'Secure Account'}
                        </Animated.Text>
                        <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            {step === 1 
                                ? "Enter your email address to receive an OTP." 
                                : "Check your inbox for the code and choose a strong new password."}
                        </Animated.Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        <Animated.View entering={FadeInUp.delay(300).duration(600)}>
                            <PremiumInput
                                label="Email Address"
                                placeholder="name@company.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={step === 1}
                                iconLeft={<Ionicons name="mail-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />}
                            />
                        </Animated.View>

                        {step === 2 && (
                            <Animated.View entering={ZoomIn.duration(400)}>
                                <View style={{ marginTop: 10 }}>
                                    <PremiumInput
                                        label="Verification Code"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChangeText={setOtp}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        iconLeft={<Ionicons name="shield-checkmark-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />}
                                    />

                                    <PremiumInput
                                        label="New Password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showPassword}
                                        iconLeft={<Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />}
                                        iconRight={
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                            </TouchableOpacity>
                                        }
                                    />
                                </View>
                            </Animated.View>
                        )}

                        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
                            <PremiumButton
                                title={step === 1 ? "Send Verification Code" : "Reset Password"}
                                onPress={step === 1 ? handleSendOTP : handleResetPassword}
                                loading={loading}
                                style={styles.resetBtn}
                            />
                        </Animated.View>
                    </View>

                    <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.footer}>
                        <Text style={[styles.footerTxt, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Found your password? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.linkTxt, { color: COLORS.primary }]}>Log In</Text>
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
    resetBtn: {
        height: 56,
        borderRadius: 12,
        marginTop: 16,
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

export default ForgotPasswordScreen;
