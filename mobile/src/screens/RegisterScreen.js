import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    Alert, 
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import ModernButton from '../components/ModernButton';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CANDIDATE'); 
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const setCredentials = useAuthStore((state) => state.setCredentials);
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Missing Info', 'Please fill in all fields to create your account.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/register', { name, email, password, role });

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
            console.log('Register Error:', error.response?.data?.message || error.message);
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong. Please try again.');
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
                            <Ionicons name="person-add" size={30} color="#FFFFFF" />
                        </LinearGradient>
                        <Text style={[styles.title, { color: COLORS.textPrimary }]}>Join Job Portal</Text>
                        <Text style={[styles.subtitle, { color: COLORS.textSecondary }]}>Create an account to start your professional journey.</Text>
                    </View>

                    <View style={[styles.rolePicker, { backgroundColor: COLORS.surface }]}>
                        <TouchableOpacity
                            style={[
                                styles.roleOption, 
                                role === 'CANDIDATE' && { backgroundColor: COLORS.primary }
                            ]}
                            onPress={() => setRole('CANDIDATE')}
                            activeOpacity={0.8}
                        >
                            <Ionicons 
                                name="person" 
                                size={20} 
                                color={role === 'CANDIDATE' ? '#FFFFFF' : COLORS.textTertiary} 
                            />
                            <Text style={[
                                styles.roleOptionText, 
                                { color: role === 'CANDIDATE' ? '#FFFFFF' : COLORS.textSecondary }
                            ]}>Candidate</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.roleOption, 
                                role === 'RECRUITER' && { backgroundColor: COLORS.primary }
                            ]}
                            onPress={() => setRole('RECRUITER')}
                            activeOpacity={0.8}
                        >
                            <Ionicons 
                                name="business" 
                                size={20} 
                                color={role === 'RECRUITER' ? '#FFFFFF' : COLORS.textTertiary} 
                            />
                            <Text style={[
                                styles.roleOptionText, 
                                { color: role === 'RECRUITER' ? '#FFFFFF' : COLORS.textSecondary }
                            ]}>Recruiter</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formSection}>
                        <View style={[styles.inputWrapper, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                            <Ionicons name="person-outline" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: COLORS.textPrimary }]}
                                placeholder="Full Name"
                                placeholderTextColor={COLORS.textTertiary}
                                value={name}
                                onChangeText={setName}
                                autoComplete="name"
                            />
                        </View>

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

                        <ModernButton
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            style={styles.registerBtn}
                        />

                        <View style={styles.footerLinks}>
                            <Text style={[styles.footerText, { color: COLORS.textSecondary }]}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={[styles.loginLinkText, { color: COLORS.primary }]}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SIZES.xl,
        paddingBottom: 40,
        paddingTop: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoBadge: {
        width: 64,
        height: 64,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        ...SHADOWS.medium,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },
    rolePicker: {
        flexDirection: 'row',
        padding: 6,
        borderRadius: 16,
        marginBottom: 32,
        gap: 6,
    },
    roleOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    roleOptionText: {
        fontSize: 14,
        fontWeight: '700',
    },
    formSection: {
        gap: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
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
    registerBtn: {
        marginTop: 10,
        height: 60,
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 15,
        fontWeight: '500',
    },
    loginLinkText: {
        fontSize: 15,
        fontWeight: '700',
    }
});

export default RegisterScreen;
