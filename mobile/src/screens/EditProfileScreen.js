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

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const EditProfileScreen = ({ navigation }) => {
    const { user } = useAuthStore();
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
        profilePhoto: ''
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
                    profilePhoto: data.profilePhoto || ''
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
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.photoSection}>
                    <View style={styles.photoContainer}>
                        {form.profilePhoto ? (
                            <Image source={{ uri: form.profilePhoto }} style={styles.photoImage} />
                        ) : (
                            <Ionicons name="person" size={40} color={COLORS.primary} />
                        )}
                    </View>
                    <TouchableOpacity style={styles.uploadBtn} onPress={handlePhotoUpload} disabled={saving}>
                        <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.uploadBtnText}>Upload Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Headline</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Senior Software Engineer"
                        value={form.headline}
                        onChangeText={(text) => setForm({ ...form, headline: text })}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+1 234 567 8900"
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={(text) => setForm({ ...form, phone: text })}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 0.5, marginLeft: 8 }]}>
                        <Text style={styles.label}>Age</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 25"
                            keyboardType="numeric"
                            value={form.age}
                            onChangeText={(text) => setForm({ ...form, age: text })}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.chipContainer}>
                        {GENDER_OPTIONS.map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[
                                    styles.chip,
                                    form.gender === g && styles.chipSelected
                                ]}
                                onPress={() => setForm({ ...form, gender: g })}
                            >
                                <Text style={[
                                    styles.chipText,
                                    form.gender === g && styles.chipTextSelected
                                ]}>
                                    {g}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Your full address"
                        multiline
                        numberOfLines={3}
                        value={form.address}
                        onChangeText={(text) => setForm({ ...form, address: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Bio (About you)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Tell recruiters a little about yourself (up to 500 chars)"
                        multiline
                        numberOfLines={4}
                        value={form.bio}
                        onChangeText={(text) => setForm({ ...form, bio: text })}
                    />
                </View>

                <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 20 }} />
                <Text style={[styles.headerTitle, { marginBottom: 20 }]}>Job Preferences</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Preferred Job Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. React Native Developer"
                        value={form.preferredJobTitle}
                        onChangeText={(text) => setForm({ ...form, preferredJobTitle: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Preferred Location</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Remote, or New York"
                        value={form.preferredLocation}
                        onChangeText={(text) => setForm({ ...form, preferredLocation: text })}
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
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    photoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.primary + '30'
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        height: 100,
        textAlignVertical: 'top',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    chipTextSelected: {
        color: COLORS.white,
        fontWeight: 'bold',
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

export default EditProfileScreen;
