import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    ScrollView,
    StatusBar
} from 'react-native';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
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
    eyeIcon: {
        padding: 4,
    },
    forgotPass: {
        alignSelf: 'flex-end',
    },
    forgotPassText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    loginBtn: {
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
    registerLinkText: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.primary,
    },
});

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const setCredentials = useAuthStore((state) => state.setCredentials);
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
    const styles = getStyles(COLORS, SIZES);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Incomplete Info', 'Please enter both your email and password to log in.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/login', { email, password });

            if (res.data.success) {
                const user = {
                    _id: res.data._id,
                    name: res.data.name,
                    email: res.data.email,
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
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
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
                            colors={[COLORS.primary, COLORS.primaryLight]}
                            style={styles.logoBadge}
                        >
                            <Ionicons name="briefcase" size={34} color="#FFFFFF" />
                        </LinearGradient>
                        <Text style={[styles.title, { color: COLORS.textPrimary }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: COLORS.textSecondary }]}>Log in to continue your professional journey.</Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={[styles.inputWrapper, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: COLORS.textPrimary }]}
                                placeholder="Email Address"
                                placeholderTextColor={COLORS.textTertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                autoComplete="email"
                            />
                        </View>

                        <View style={[styles.inputWrapper, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: COLORS.textPrimary }]}
                                placeholder="Password"
                                placeholderTextColor={COLORS.textTertiary}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                autoComplete="password"
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                    size={20} 
                                    color={COLORS.textTertiary} 
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.forgotPass}>
                            <Text style={styles.forgotPassText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <ModernButton
                            title="Log In"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginBtn}
                        />

                        <View style={styles.footerLinks}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLinkText}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};


export default LoginScreen;
