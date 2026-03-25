import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    Alert, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import api from '../services/api';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import ModernButton from '../components/ModernButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const getStyles = (COLORS, SIZES) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SIZES.xl,
        paddingTop: 60,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoBadge: {
        width: 72,
        height: 72,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        ...SHADOWS.medium,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    formSection: {
        gap: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 64,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    resetBtn: {
        marginTop: 10,
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    loginLinkText: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.primary,
    },
    otpInfo: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: -10,
        marginBottom: 5,
    }
});

const ForgotPasswordScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP & New Password
    const [loading, setLoading] = useState(false);

    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
    const styles = getStyles(COLORS, SIZES);

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Invalid Number', 'Please enter a valid mobile number.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/forgot-password/send-otp', { phoneNumber });
            
            setLoading(false);
            setStep(2);
            Alert.alert('OTP Sent', `A verification code has been sent to ${phoneNumber}`);
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP. Please try again.');
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            Alert.alert('Missing Info', 'Please enter the OTP and your new password.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/forgot-password/verify', { phoneNumber, otp, newPassword });
            
            setLoading(false);
            Alert.alert('Success', 'Your password has been reset successfully.', [
                { text: 'Login Now', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            setLoading(false);
            Alert.alert('Reset Failed', error.response?.data?.message || 'Invalid OTP or network error.');
        }
    };

    return (
        <ScreenWrapper bottom={false}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerSection}>
                        <LinearGradient
                            colors={[COLORS.secondary, COLORS.primary]}
                            style={styles.logoBadge}
                        >
                            <Ionicons name="key" size={34} color="#FFFFFF" />
                        </LinearGradient>
                        <Text style={[styles.title, { color: COLORS.textPrimary }]}>
                            {step === 1 ? 'Forgot Password?' : 'Secure Your Account'}
                        </Text>
                        <Text style={[styles.subtitle, { color: COLORS.textSecondary }]}>
                            {step === 1 
                                ? "Don't worry! Enter your mobile number below to receive an OTP." 
                                : "Check your SMS for the code and choose a strong new password."}
                        </Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={[styles.inputWrapper, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                            <Ionicons name="call-outline" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: COLORS.textPrimary }]}
                                placeholder="Mobile Number"
                                placeholderTextColor={COLORS.textTertiary}
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                editable={step === 1}
                            />
                        </View>

                        {step === 2 && (
                            <>
                                <View style={[styles.inputWrapper, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: COLORS.textPrimary }]}
                                        placeholder="Enter 6-digit OTP"
                                        placeholderTextColor={COLORS.textTertiary}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        value={otp}
                                        onChangeText={setOtp}
                                    />
                                </View>

                                <View style={[styles.inputWrapper, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: COLORS.textPrimary }]}
                                        placeholder="New Password"
                                        placeholderTextColor={COLORS.textTertiary}
                                        secureTextEntry
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                </View>
                            </>
                        )}

                        <ModernButton
                            title={step === 1 ? "Send OTP" : "Reset Password"}
                            onPress={step === 1 ? handleSendOTP : handleResetPassword}
                            loading={loading}
                            style={styles.resetBtn}
                        />

                        <View style={styles.footerLinks}>
                            <Text style={styles.footerText}>Found your password? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLinkText}>Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default ForgotPasswordScreen;
