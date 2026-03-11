import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import api from '../services/api';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CANDIDATE'); // Default role
    const [loading, setLoading] = useState(false);

    const setCredentials = useAuthStore((state) => state.setCredentials);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
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
                // Auto-login after registration
                await setCredentials(user, res.data.token);
            }
        } catch (error) {
            console.log('Register Error:', error.response?.data?.message || error.message);
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and find your dream job or perfect candidate.</Text>

            <View style={styles.roleContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, role === 'CANDIDATE' && styles.roleButtonActive]}
                    onPress={() => setRole('CANDIDATE')}
                >
                    <Text style={[styles.roleText, role === 'CANDIDATE' && styles.roleTextActive]}>Candidate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.roleButton, role === 'RECRUITER' && styles.roleButtonActive]}
                    onPress={() => setRole('RECRUITER')}
                >
                    <Text style={[styles.roleText, role === 'RECRUITER' && styles.roleTextActive]}>Recruiter</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={COLORS.textHint}
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={COLORS.textHint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={COLORS.textHint}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.bold}>Log In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: COLORS.backgroundLight,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },
    roleContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    roleButton: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    roleButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10', // 10% opacity primary color
    },
    roleText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    roleTextActive: {
        color: COLORS.primary,
    },
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 16,
        alignItems: 'center',
    },
    loginText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    bold: {
        color: COLORS.primary,
        fontWeight: 'bold',
    }
});

export default RegisterScreen;
