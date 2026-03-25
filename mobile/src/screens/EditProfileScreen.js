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

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const EditProfileScreen = ({ navigation }) => {
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        headline: '',
        phone: '',
        age: '',
        gender: 'Prefer not to say',
        address: '',
        bio: '',
        preferredJobTitle: '',
        preferredLocation: '',
        profilePhoto: '',
        resumeUrl: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/candidates/me');
            if (res.data.success && res.data.data) {
                const data = res.data.data;
                setForm({
                    headline: data.headline || '',
                    phone: data.phone || '',
                    age: data.age ? data.age.toString() : '',
                    gender: data.gender || 'Prefer not to say',
                    address: data.address || '',
                    bio: data.bio || '',
                    preferredJobTitle: data.preferredJobTitle || '',
                    preferredLocation: data.preferredLocation || '',
                    profilePhoto: data.profilePhoto || '',
                    resumeUrl: data.resumeUrl || ''
                });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load profile details');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async () => {
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
            formData.append('photo', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'image/jpeg',
            });

            const token = await AsyncStorage.getItem('userToken');
            const apiUrl = `${api.defaults.baseURL}/candidates/me/photo`;

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
                Alert.alert('Success', 'Profile photo uploaded successfully!');
                setForm(prev => ({ ...prev, profilePhoto: data.data.profilePhoto }));
            } else {
                throw new Error(data.message || 'Error uploading photo');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            Alert.alert('Upload Failed', 'Failed to upload photo.');
        } finally {
            setSaving(false);
        }
    };

    const handleResumeUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ],
            });

            if (result.canceled) return;

            const file = result.assets[0];

            if (file.size > 250 * 1024) {
                Alert.alert('File too large', 'Please upload a file smaller than 250KB');
                return;
            }

            setSaving(true);

            const formData = new FormData();
            formData.append('resume', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/pdf',
            });

            const token = await AsyncStorage.getItem('userToken');
            const apiUrl = `${api.defaults.baseURL}/candidates/me/resume`;

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
                Alert.alert('Success', 'Resume uploaded successfully!');
                setForm(prev => ({ ...prev, resumeUrl: data.data.resumeUrl }));
            } else {
                throw new Error(data.message || 'Error uploading resume');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            Alert.alert('Upload Failed', error.message || 'Failed to upload resume.');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Validate age is a number if provided
            let parsedAge = undefined;
            if (form.age.trim() !== '') {
                parsedAge = parseInt(form.age, 10);
                if (isNaN(parsedAge)) {
                    Alert.alert('Validation Error', 'Age must be a valid number');
                    setSaving(false);
                    return;
                }
            }

            const payload = {
                ...form,
                age: parsedAge
            };

            const res = await api.put('/candidates/me', payload);

            if (res.data.success) {
                Alert.alert('Success', 'Profile updated successfully!');
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
                <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>Edit Profile</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.photoSection}>
                        <View style={[styles.photoContainer, { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary + '30' }]}>
                            {form.profilePhoto ? (
                                <Image source={{ uri: form.profilePhoto }} style={styles.photoImage} />
                            ) : (
                                <Ionicons name="person" size={40} color={COLORS.primary} />
                            )}
                        </View>
                        <TouchableOpacity 
                            style={[styles.uploadBtn, { backgroundColor: COLORS.primary + '10' }]} 
                            onPress={handlePhotoUpload} 
                            disabled={saving}
                        >
                            <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
                            <Text style={[styles.uploadBtnText, { color: COLORS.primary }]}>Change Photo</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Basic Information</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Headline</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="e.g. Senior Software Engineer"
                                placeholderTextColor={COLORS.textTertiary}
                                value={form.headline}
                                onChangeText={(text) => setForm({ ...form, headline: text })}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={[styles.label, { color: COLORS.textSecondary }]}>Phone</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                    placeholder="+1 234 567 8900"
                                    placeholderTextColor={COLORS.textTertiary}
                                    keyboardType="phone-pad"
                                    value={form.phone}
                                    onChangeText={(text) => setForm({ ...form, phone: text })}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 0.5, marginLeft: 8 }]}>
                                <Text style={[styles.label, { color: COLORS.textSecondary }]}>Age</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                    placeholder="e.g. 25"
                                    placeholderTextColor={COLORS.textTertiary}
                                    keyboardType="numeric"
                                    value={form.age}
                                    onChangeText={(text) => setForm({ ...form, age: text })}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Gender</Text>
                            <View style={styles.chipContainer}>
                                {GENDER_OPTIONS.map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[
                                            styles.chip,
                                            { backgroundColor: COLORS.surface, borderColor: COLORS.border },
                                            form.gender === g && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                                        ]}
                                        onPress={() => setForm({ ...form, gender: g })}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            { color: COLORS.textSecondary },
                                            form.gender === g && { color: '#FFFFFF', fontWeight: '700' }
                                        ]}>
                                            {g}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Address</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="Your full address"
                                placeholderTextColor={COLORS.textTertiary}
                                multiline
                                numberOfLines={3}
                                value={form.address}
                                onChangeText={(text) => setForm({ ...form, address: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Bio (About you)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="Tell recruiters a little about yourself (up to 500 chars)"
                                placeholderTextColor={COLORS.textTertiary}
                                multiline
                                numberOfLines={4}
                                value={form.bio}
                                onChangeText={(text) => setForm({ ...form, bio: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Job Preferences</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Preferred Job Title</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="e.g. React Native Developer"
                                placeholderTextColor={COLORS.textTertiary}
                                value={form.preferredJobTitle}
                                onChangeText={(text) => setForm({ ...form, preferredJobTitle: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Preferred Location</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="e.g. Remote, or New York"
                                placeholderTextColor={COLORS.textTertiary}
                                value={form.preferredLocation}
                                onChangeText={(text) => setForm({ ...form, preferredLocation: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Professional Documents</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Resume / CV (PDF, DOCX)</Text>
                            <TouchableOpacity 
                                style={[
                                    styles.resumeBox, 
                                    { backgroundColor: COLORS.surface, borderColor: COLORS.border },
                                    form.resumeUrl && { borderColor: COLORS.primary + '50' }
                                ]}
                                onPress={handleResumeUpload}
                                disabled={saving}
                            >
                                <View style={[styles.resumeIconBox, { backgroundColor: form.resumeUrl ? COLORS.primary + '10' : COLORS.textTertiary + '10' }]}>
                                    <Ionicons 
                                        name={form.resumeUrl ? "document-text" : "cloud-upload-outline"} 
                                        size={24} 
                                        color={form.resumeUrl ? COLORS.primary : COLORS.textTertiary} 
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.resumeTitle, { color: COLORS.textPrimary }]}>
                                        {form.resumeUrl ? "Resume Uploaded" : "Upload Resume"}
                                    </Text>
                                    <Text style={[styles.resumeSub, { color: COLORS.textSecondary }]}>
                                        {form.resumeUrl ? "Tap to change file" : "Max size 250KB"}
                                    </Text>
                                </View>
                                {form.resumeUrl && (
                                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success || '#4CAF50'} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ModernButton
                        title="Save Changes"
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
    photoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    photoContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 2,
    },
    photoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
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
        marginBottom: 32,
        gap: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    inputGroup: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        height: 120,
        textAlignVertical: 'top',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    saveBtn: {
        height: 60,
        borderRadius: 18,
    },
    resumeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 18,
        borderWidth: 1.5,
        borderStyle: 'dashed',
    },
    resumeIconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    resumeTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    resumeSub: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    }
});

export default EditProfileScreen;
