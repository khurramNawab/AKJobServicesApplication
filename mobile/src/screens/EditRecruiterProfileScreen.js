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
    Image
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';

const EditRecruiterProfileScreen = ({ navigation }) => {
    const { user } = useAuthStore();
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
                method: 'POST',
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Company Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        {form.companyLogo ? (
                            <Image source={{ uri: form.companyLogo }} style={styles.logoImage} />
                        ) : (
                            <Ionicons name="business" size={40} color={COLORS.primary} />
                        )}
                    </View>
                    <TouchableOpacity style={styles.uploadBtn} onPress={handleLogoUpload} disabled={saving}>
                        <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.uploadBtnText}>Upload Logo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Company Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Acme Corp"
                        value={form.companyName}
                        onChangeText={(text) => setForm({ ...form, companyName: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Website</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. https://www.acmecorp.com"
                        keyboardType="url"
                        autoCapitalize="none"
                        value={form.website}
                        onChangeText={(text) => setForm({ ...form, website: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Industry</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Software, Finance, Healthcare"
                        value={form.industry}
                        onChangeText={(text) => setForm({ ...form, industry: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Office Location / HQ</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. San Francisco, CA"
                        value={form.location}
                        onChangeText={(text) => setForm({ ...form, location: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Company Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Tell candidates what your company does..."
                        multiline
                        numberOfLines={5}
                        value={form.description}
                        onChangeText={(text) => setForm({ ...form, description: text })}
                    />
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    content: {
        padding: 20,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.primary + '30'
    },
    logoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '10',
        gap: 6,
    },
    uploadBtnText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default EditRecruiterProfileScreen;
