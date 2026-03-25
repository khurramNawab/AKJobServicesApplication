import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import ModernButton from '../components/ModernButton';
import ScreenWrapper from '../components/ScreenWrapper';

const EditRecruiterProfileScreen = ({ navigation }) => {
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        companyName: '',
        website: '',
        industry: '',
        location: '',
        description: '',
        companyLogo: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/recruiters/me');
            if (res.data.success && res.data.data) {
                const data = res.data.data;
                setForm({
                    companyName: data.companyName || '',
                    website: data.website || '',
                    industry: data.industry || '',
                    location: data.location || '',
                    description: data.description || '',
                    companyLogo: data.companyLogo || ''
                });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load company profile details');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*'],
            });

            if (result.canceled) return;

            const file = result.assets[0];

            if (file.size > 5 * 1024 * 1024) {
                Alert.alert('File too large', 'Please upload an image smaller than 5MB');
                return;
            }

            setSaving(true);

            const formData = new FormData();
            formData.append('logo', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'image/jpeg',
            });

            const token = await AsyncStorage.getItem('userToken');
            const apiUrl = `${api.defaults.baseURL}/recruiters/me/logo`;

            const res = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });


            const textData = await res.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (err) {
                throw new Error('Server returned an invalid response.');
            }

            if (data.success) {
                Alert.alert('Success', 'Logo uploaded successfully!');
                setForm(prev => ({ ...prev, companyLogo: data.data.companyLogo }));
            } else {
                throw new Error(data.message || 'Error uploading logo');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            Alert.alert('Upload Failed', 'Failed to upload logo.');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put('/recruiters/me', form);

            if (res.data.success) {
                Alert.alert('Success', 'Company profile updated successfully!');
                navigation.goBack();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Update Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={[styles.centerContainer, { backgroundColor: COLORS.background }]}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={[styles.backButton, { backgroundColor: COLORS.background }]}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>Company Profile</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.logoSection}>
                        <View style={[styles.logoContainer, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                            {form.companyLogo ? (
                                <Image source={{ uri: form.companyLogo }} style={styles.logoImage} />
                            ) : (
                                <Ionicons name="business" size={44} color={COLORS.primary} />
                            )}
                        </View>
                        <TouchableOpacity 
                            style={[styles.uploadBtn, { backgroundColor: COLORS.primary + '10' }]} 
                            onPress={handleLogoUpload} 
                            disabled={saving}
                        >
                            <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary} />
                            <Text style={[styles.uploadBtnText, { color: COLORS.primary }]}>Upload Logo</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Company Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="e.g. Acme Corp"
                                placeholderTextColor={COLORS.textTertiary}
                                value={form.companyName}
                                onChangeText={(text) => setForm({ ...form, companyName: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Website</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="e.g. https://www.acmecorp.com"
                                placeholderTextColor={COLORS.textTertiary}
                                keyboardType="url"
                                autoCapitalize="none"
                                value={form.website}
                                onChangeText={(text) => setForm({ ...form, website: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Industry</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="e.g. Software, Finance, Healthcare"
                                placeholderTextColor={COLORS.textTertiary}
                                value={form.industry}
                                onChangeText={(text) => setForm({ ...form, industry: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Office Location / HQ</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="e.g. San Francisco, CA"
                                placeholderTextColor={COLORS.textTertiary}
                                value={form.location}
                                onChangeText={(text) => setForm({ ...form, location: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Company Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="Tell candidates what your company does..."
                                placeholderTextColor={COLORS.textTertiary}
                                multiline
                                numberOfLines={5}
                                value={form.description}
                                onChangeText={(text) => setForm({ ...form, description: text })}
                            />
                        </View>
                    </View>

                    <ModernButton
                        title="Save Profile"
                        onPress={handleSave}
                        loading={saving}
                        style={styles.saveBtn}
                    />
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    content: {
        padding: 24,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        gap: 8,
    },
    uploadBtnText: {
        fontWeight: '700',
        fontSize: 14,
    },
    section: {
        gap: 20,
        marginBottom: 32,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    saveBtn: {
        height: 60,
        borderRadius: 18,
    }
});

export default EditRecruiterProfileScreen;
