import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import PremiumButton from '../components/PremiumButton';
import PremiumInput from '../components/PremiumInput';
import EliteGradient from '../components/EliteGradient';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CANDIDATE'); 
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: Registration info, 2: OTP verification
    const [otp, setOtp] = useState('');

    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const handleRegister = async () => {
        if (!name || !phoneNumber || !password) {
            Alert.alert('Missing Info', 'Please fill in all fields to create your account.');
            return;
        }

        try {
            setLoading(true);
            const cleanPhone = phoneNumber.replace(/[()\-\s]/g, '');
            const res = await api.post('/auth/register', { name, phoneNumber: cleanPhone, password, role });

            if (res.data.success) {
                setStep(2);
                Alert.alert('Verify Phone', 'A verification code has been sent to your phone number.');
            }
        } catch (error) {
            console.error('Register Error:', error.response?.data?.message || error.message);
            Alert.alert('Registration Failed', error.response?.data?.message || 'Check your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/forgot-password/verify', { phoneNumber, otp });

            if (res.data.success) {
                Alert.alert('Verified!', 'Your account is now verified. Please log in to your professional workspace.');
                navigation.navigate('Login');
            }
        } catch (error) {
            console.error('Verify Error:', error.response?.data?.message || error.message);
            Alert.alert('Verification Failed', 'Invalid or expired OTP.');
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
                        <Animated.View entering={FadeInDown.duration(800)} style={styles.logoBadge}>
                            <Ionicons name="person-add" size={40} color={COLORS.primary} />
                        </Animated.View>
                        <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>Join Job Portal</Animated.Text>
                        <Animated.Text entering={FadeInDown.delay(400)} style={styles.subtitle}>Create your professional identity today.</Animated.Text>
                    </View>

                    <Animated.View 
                        layout={Layout.springify()}
                        entering={FadeInUp.delay(600)} 
                        style={[styles.formCard, { backgroundColor: COLORS.surface }]}
                    >
                        {step === 1 ? (
                            <>
                                <View style={[styles.rolePicker, { backgroundColor: COLORS.backgroundSecondary }]}>
                                    <TouchableOpacity
                                        style={[styles.roleTab, role === 'CANDIDATE' && { backgroundColor: COLORS.primary }]}
                                        onPress={() => setRole('CANDIDATE')}
                                    >
                                        <Text style={[styles.roleTxt, { color: role === 'CANDIDATE' ? '#FFF' : COLORS.textSecondary }]}>Candidate</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.roleTab, role === 'RECRUITER' && { backgroundColor: COLORS.primary }]}
                                        onPress={() => setRole('RECRUITER')}
                                    >
                                        <Text style={[styles.roleTxt, { color: role === 'RECRUITER' ? '#FFF' : COLORS.textSecondary }]}>Recruiter</Text>
                                    </TouchableOpacity>
                                </View>

                                <PremiumInput
                                    label="Full Name"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChangeText={setName}
                                    iconLeft={<Ionicons name="person-outline" size={20} color={COLORS.textTertiary} />}
                                />

                                <PremiumInput
                                    label="Phone Number"
                                    placeholder="e.g. 9876543210"
                                    value={phoneNumber}
                                    onChangeText={(val) => setPhoneNumber(val.replace(/[()\-\s]/g, ''))}
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

                                <PremiumButton
                                    title="Create Account"
                                    onPress={handleRegister}
                                    loading={loading}
                                    style={styles.registerBtn}
                                />
                            </>
                        ) : (
                            <>
                                <View style={styles.otpHeader}>
                                    <Text style={[styles.otpTitle, { color: COLORS.textPrimary }]}>Verify Number</Text>
                                    <Text style={[styles.otpSub, { color: COLORS.textSecondary }]}>Enter the 6-digit code sent to {phoneNumber}</Text>
                                </View>

                                <PremiumInput
                                    label="OTP Code"
                                    placeholder="0 0 0 0 0 0"
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    iconLeft={<Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textTertiary} />}
                                />

                                <PremiumButton
                                    title="Verify & Continue"
                                    onPress={handleVerify}
                                    loading={loading}
                                    style={styles.registerBtn}
                                />
                                
                                <TouchableOpacity 
                                    style={styles.backToReg} 
                                    onPress={() => setStep(1)}
                                >
                                    <Text style={[styles.backTxt, { color: COLORS.primary }]}>Back to Registration</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <View style={styles.footer}>
                            <Text style={[styles.footerTxt, { color: COLORS.textSecondary }]}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={[styles.linkTxt, { color: COLORS.primary }]}>Log In</Text>
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
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoBadge: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        ...SHADOWS.medium,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
    },
    formCard: {
        borderRadius: 32,
        padding: SIZES.xl,
        ...SHADOWS.glass,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    rolePicker: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
    },
    roleTab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    roleTxt: {
        fontSize: 14,
        fontWeight: '700',
    },
    registerBtn: {
        height: 60,
        marginTop: 10,
    },
    otpHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    otpTitle: {
        fontSize: 22,
        fontWeight: '800',
    },
    otpSub: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '500',
    },
    backToReg: {
        alignSelf: 'center',
        marginTop: 16,
    },
    backTxt: {
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
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

export default RegisterScreen;
