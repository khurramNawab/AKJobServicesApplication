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
    Dimensions,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';

// Premium Components
import PremiumButton from '../components/PremiumButton';
import PremiumInput from '../components/PremiumInput';
import ScreenWrapper from '../components/ScreenWrapper';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CANDIDATE'); 
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: Registration form, 2: Check Email screen

    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const validateEmail = (input) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(input.trim());
    };

    const handleRegister = async () => {
        if (loading) return;

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        
        if (!trimmedName || !trimmedEmail || !password) {
            Alert.alert('Missing Info', 'Please fill in all fields to create your account.');
            return;
        }

        if (trimmedName.length < 2) {
            Alert.alert('Invalid Name', 'Name must be at least 2 characters.');
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/register', { 
                name: trimmedName, 
                email: trimmedEmail, 
                password, 
                role 
            });

            if (res.data.success) {
                setStep(2);
                setName('');
                setPassword('');
                setRole('CANDIDATE');
            }
        } catch (error) {
            console.error('Register Error:', error.response?.data?.message || error.message);
            Alert.alert('Registration Failed', error.response?.data?.message || 'Check your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (loading) return;
        const trimmedEmail = email.trim().toLowerCase();
        try {
            setLoading(true);
            const res = await api.post('/auth/resend-verification', { email: trimmedEmail });
            if (res.data.success) {
                Alert.alert('Email Sent', 'A fresh verification link has been sent to your email.');
            }
        } catch (error) {
            Alert.alert('Resend Failed', error.response?.data?.message || 'Failed to resend email. Please try again.');
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
                            Create Account
                        </Animated.Text>
                        <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Join Job Portal and discover new opportunities today.
                        </Animated.Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        {step === 1 ? (
                            <>
                                <Animated.View entering={FadeInUp.delay(300).duration(600)} style={[styles.rolePicker, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }]}>
                                    <TouchableOpacity
                                        style={[styles.roleTab, role === 'CANDIDATE' && { backgroundColor: COLORS.primary }]}
                                        onPress={() => setRole('CANDIDATE')}
                                    >
                                        <Text style={[styles.roleTxt, { color: role === 'CANDIDATE' ? '#FFF' : (isDarkMode ? '#FFF' : COLORS.textSecondary) }]}>Candidate</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.roleTab, role === 'RECRUITER' && { backgroundColor: COLORS.primary }]}
                                        onPress={() => setRole('RECRUITER')}
                                    >
                                        <Text style={[styles.roleTxt, { color: role === 'RECRUITER' ? '#FFF' : (isDarkMode ? '#FFF' : COLORS.textSecondary) }]}>Recruiter</Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                <Animated.View entering={FadeInUp.delay(400).duration(600)}>
                                    <PremiumInput
                                        label="Full Name"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChangeText={setName}
                                        iconLeft={<Ionicons name="person-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />}
                                    />
                                </Animated.View>

                                <Animated.View entering={FadeInUp.delay(500).duration(600)}>
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

                                <Animated.View entering={FadeInUp.delay(600).duration(600)}>
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

                                <Animated.View entering={FadeInUp.delay(700).duration(600)}>
                                    <PremiumButton
                                        title="Sign Up"
                                        onPress={handleRegister}
                                        loading={loading}
                                        style={styles.registerBtn}
                                    />
                                </Animated.View>
                            </>
                        ) : (
                            <Animated.View entering={ZoomIn.duration(400)}>
                                <View style={styles.otpHeader}>
                                    <Ionicons name="mail-unread-outline" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
                                    <Text style={[styles.otpTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>Verify Your Email</Text>
                                    <Text style={[styles.otpSub, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        We sent a secure verification link to{"\n"}
                                        <Text style={{ fontWeight: '800', color: isDarkMode ? '#FFF' : '#111827' }}>{email.trim().toLowerCase()}</Text>.{"\n"}
                                        Please click the link in your email to verify your account, and then log in.
                                    </Text>
                                </View>

                                <PremiumButton
                                    title="Go to Login"
                                    onPress={() => {
                                        setEmail('');
                                        setStep(1);
                                        navigation.navigate('Login');
                                    }}
                                    style={styles.registerBtn}
                                />
                                
                                <TouchableOpacity 
                                    style={styles.backToReg} 
                                    onPress={handleResendVerification}
                                    disabled={loading}
                                >
                                    <Text style={[styles.backTxt, { color: COLORS.primary }]}>
                                        {loading ? 'Sending...' : 'Resend Verification Email'}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </View>

                    <Animated.View entering={FadeInUp.delay(800).duration(600)} style={styles.footer}>
                        <Text style={[styles.footerTxt, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Already have an account? </Text>
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
    rolePicker: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    roleTab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    roleTxt: {
        fontSize: 14,
        fontWeight: '600',
    },
    registerBtn: {
        height: 56,
        borderRadius: 12,
        marginTop: 10,
    },
    otpHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    otpTitle: {
        fontSize: 22,
        fontWeight: '800',
    },
    otpSub: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 24,
    },
    backToReg: {
        alignSelf: 'center',
        marginTop: 20,
    },
    backTxt: {
        fontWeight: '600',
        fontSize: 15,
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

export default RegisterScreen;
