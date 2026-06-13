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
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import ModernButton from '../components/ModernButton';
import ScreenWrapper from '../components/ScreenWrapper';

const EditRecruiterProfileScreen = ({ navigation }) => {
    const { user, setUser } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState([]);

    const [form, setForm] = useState({
        companyName: '',
        website: '',
        industry: '',
        location: '',
        description: '',
        companyLogo: '',
        companyPhotos: [],
        designation: ''
    });

    useEffect(() => {
        if (user?.role !== 'RECRUITER') {
            Alert.alert("Access Denied", "This profile screen is for recruiters only.");
            navigation.goBack();
            return;
        }
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
                    companyLogo: data.companyLogo || '',
                    companyPhotos: data.companyPhotos || [],
                    designation: data.designation || ''
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
                uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                name: file.name || `logo_${Date.now()}.jpg`,
                type: file.mimeType || 'image/jpeg',
            });

            console.log('[EditRecruiterProfile] Bypassing Axios for upload stability via Native Fetch...');
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch(`${api.defaults.baseURL}/recruiters/me/logo`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'x-client-type': 'mobile',
                },
            });

            const resData = await response.json();

            if (resData.success) {
                Alert.alert('Success', 'Logo uploaded successfully!');
                const logoUrl = resData.data.companyLogo;
                setForm(prev => ({ ...prev, companyLogo: logoUrl }));
                
                // Update AuthStore user logo so it reflects instantly across the app
                setUser({ 
                    ...user, 
                    companyLogo: logoUrl
                });
            } else {
                throw new Error(resData.message || 'Error uploading logo');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to upload logo.';
            Alert.alert('Upload Failed', errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async () => {
        try {
            // Check client-side limit of 3 photos
            if (form.companyPhotos.length >= 3) {
                Alert.alert('Limit reached', 'Maximum of 3 workspace images allowed.');
                return;
            }

            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*'],
            });

            if (result.canceled) return;

            const file = result.assets[0];

            // Enforce size limit on this image
            if (file.size > 5 * 1024 * 1024) {
                Alert.alert('File too large', 'Individual image size must be smaller than 5MB');
                return;
            }

            // Enforce total size limit of 8MB
            const currentSize = form.companyPhotos.reduce((sum, p) => sum + p.size, 0);
            if (currentSize + file.size > 8 * 1024 * 1024) {
                Alert.alert(
                    'Size limit exceeded', 
                    `Total size of all workspace images cannot exceed 8MB. Current total: ${(currentSize / (1024 * 1024)).toFixed(2)}MB. Selecting this file (${(file.size / (1024 * 1024)).toFixed(2)}MB) will exceed the 8MB limit.`
                );
                return;
            }

            setSaving(true);

            const formData = new FormData();
            formData.append('photo', {
                uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                name: file.name || `photo_${Date.now()}.jpg`,
                type: file.mimeType || 'image/jpeg',
            });

            console.log('[EditRecruiterProfile] Bypassing Axios for photo upload stability via Native Fetch...');
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch(`${api.defaults.baseURL}/recruiters/me/photo`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'x-client-type': 'mobile',
                },
            });

            const resData = await response.json();

            if (resData.success) {
                Alert.alert('Success', 'Workspace image uploaded successfully!');
                setForm(prev => ({ ...prev, companyPhotos: resData.data.companyPhotos || [] }));
            } else {
                throw new Error(resData.message || 'Error uploading company photo');
            }
        } catch (error) {
            console.error('Upload Photo Error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to upload company photo.';
            Alert.alert('Upload Failed', errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoDelete = async (photoUrl) => {
        Alert.alert(
            'Delete Workspace Image',
            'Are you sure you want to remove this image from your profile?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            const res = await api.delete('/recruiters/me/photo', {
                                data: { url: photoUrl }
                            });
                            if (res.data.success) {
                                Alert.alert('Success', 'Workspace image deleted successfully!');
                                setForm(prev => ({ ...prev, companyPhotos: res.data.data.companyPhotos || [] }));
                            }
                        } catch (error) {
                            console.error('Delete photo error:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete workspace image');
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const togglePhotoSelection = (photoUrl) => {
        setSelectedPhotos(prev => {
            if (prev.includes(photoUrl)) {
                return prev.filter(url => url !== photoUrl);
            } else {
                return [...prev, photoUrl];
            }
        });
    };

    const handlePhotoPress = (photoUrl) => {
        if (isSelectMode) {
            togglePhotoSelection(photoUrl);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedPhotos.length === 0) {
            Alert.alert('No images selected', 'Please select at least one workspace image to delete.');
            return;
        }

        Alert.alert(
            'Delete Selected Images',
            `Are you sure you want to remove the selected ${selectedPhotos.length} image(s) from your profile?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            const res = await api.delete('/recruiters/me/photo', {
                                data: { urls: selectedPhotos }
                            });
                            if (res.data.success) {
                                Alert.alert('Success', res.data.message || 'Workspace images deleted successfully!');
                                setForm(prev => ({ ...prev, companyPhotos: res.data.data.companyPhotos || [] }));
                                setSelectedPhotos([]);
                                setIsSelectMode(false);
                            }
                        } catch (error) {
                            console.error('Delete photos error:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete selected workspace images');
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put('/recruiters/me', form);

            if (res.data.success) {
                Alert.alert('Success', 'Company profile updated successfully!');
                
                // Sync updated logo to AuthStore
                setUser({ 
                    ...user, 
                    companyLogo: form.companyLogo
                });
                
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
                            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Your Designation / Role</Text>
                            <View style={styles.chipsContainer}>
                                {['HR Manager', 'CEO', 'Company Owner', 'Other'].map((role) => {
                                    const isSelected = form.designation === role || 
                                        (role === 'Other' && !['HR Manager', 'CEO', 'Company Owner'].includes(form.designation) && form.designation !== '');
                                    return (
                                        <TouchableOpacity
                                            key={role}
                                            style={[
                                                styles.chip,
                                                { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border },
                                                isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                                            ]}
                                            onPress={() => {
                                                if (role === 'Other') {
                                                    setForm({ ...form, designation: 'Hiring Manager' });
                                                } else {
                                                    setForm({ ...form, designation: role });
                                                }
                                            }}
                                        >
                                            <Text style={[styles.chipText, { color: COLORS.textSecondary }, isSelected && { color: '#FFF' }]}>
                                                {role}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            {!['HR Manager', 'CEO', 'Company Owner'].includes(form.designation) && (
                                <TextInput
                                    style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textPrimary, marginTop: 8 }]}
                                    placeholder="Enter your custom designation (e.g. Hiring Manager)"
                                    placeholderTextColor={COLORS.textTertiary}
                                    value={form.designation}
                                    onChangeText={(text) => setForm({ ...form, designation: text })}
                                />
                            )}
                        </View>

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

                        <View style={styles.inputGroup}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={[styles.label, { color: COLORS.textSecondary }]}>
                                        Workspace Images ({form.companyPhotos.length}/3)
                                    </Text>
                                    {form.companyPhotos.length > 0 && (
                                        <TouchableOpacity 
                                            onPress={() => {
                                                setIsSelectMode(!isSelectMode);
                                                setSelectedPhotos([]);
                                            }}
                                            style={{
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                borderRadius: 6,
                                                backgroundColor: isSelectMode ? COLORS.primary + '20' : COLORS.border + '50'
                                            }}
                                        >
                                            <Text style={{ fontSize: 11, fontWeight: '700', color: isSelectMode ? COLORS.primary : COLORS.textSecondary }}>
                                                {isSelectMode ? 'Cancel' : 'Select Multiple'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textTertiary }}>
                                    {(form.companyPhotos.reduce((sum, p) => sum + p.size, 0) / (1024 * 1024)).toFixed(2)} MB / 8.00 MB
                                </Text>
                            </View>
                            
                            {form.companyPhotos.length > 0 ? (
                                <View>
                                    <View style={styles.photosGrid}>
                                        {form.companyPhotos.map((photo, index) => {
                                            const isSelected = selectedPhotos.includes(photo.url);
                                            return (
                                                <TouchableOpacity 
                                                    key={index} 
                                                    style={[
                                                        styles.photoWrapper, 
                                                        { 
                                                            borderColor: isSelected ? COLORS.primary : COLORS.border,
                                                            borderWidth: isSelected ? 2 : 1.5 
                                                        }
                                                    ]}
                                                    activeOpacity={0.8}
                                                    onPress={() => handlePhotoPress(photo.url)}
                                                    disabled={!isSelectMode}
                                                >
                                                    <Image source={{ uri: photo.url }} style={styles.gridPhoto} />
                                                    
                                                    {isSelectMode ? (
                                                        <View style={[
                                                            styles.checkboxOverlay, 
                                                            { 
                                                                backgroundColor: isSelected ? COLORS.primary : 'rgba(0,0,0,0.4)',
                                                                borderColor: '#FFF'
                                                            }
                                                        ]}>
                                                            {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                                                        </View>
                                                    ) : (
                                                        <TouchableOpacity 
                                                            style={[styles.deletePhotoBtn, { backgroundColor: COLORS.danger }]}
                                                            onPress={() => handlePhotoDelete(photo.url)}
                                                            activeOpacity={0.8}
                                                        >
                                                            <Ionicons name="trash-outline" size={14} color="#FFF" />
                                                        </TouchableOpacity>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                    
                                    {isSelectMode && (
                                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                            <TouchableOpacity 
                                                style={[
                                                    styles.bulkDeleteBtn, 
                                                    { 
                                                        backgroundColor: selectedPhotos.length > 0 ? COLORS.danger : COLORS.border + '80',
                                                        opacity: selectedPhotos.length > 0 ? 1 : 0.6
                                                    }
                                                ]}
                                                onPress={handleDeleteSelected}
                                                disabled={selectedPhotos.length === 0 || saving}
                                            >
                                                <Ionicons name="trash-outline" size={16} color="#FFF" />
                                                <Text style={styles.bulkDeleteBtnText}>
                                                    Delete Selected ({selectedPhotos.length})
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={[styles.photoContainer, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border }]}>
                                    <View style={styles.photoPlaceholder}>
                                        <Ionicons name="images-outline" size={36} color={COLORS.textTertiary} />
                                        <Text style={[styles.placeholderText, { color: COLORS.textTertiary }]}>No Workspace Images Uploaded</Text>
                                    </View>
                                </View>
                            )}

                            {!isSelectMode && form.companyPhotos.length < 3 && (
                                <TouchableOpacity 
                                    style={[styles.uploadBtn, { backgroundColor: COLORS.primary + '10', alignSelf: 'flex-start', marginTop: 10 }]} 
                                    onPress={handlePhotoUpload} 
                                    disabled={saving}
                                >
                                    <Ionicons name="image-outline" size={20} color={COLORS.primary} />
                                    <Text style={[styles.uploadBtnText, { color: COLORS.primary }]}>Add Workspace Photo</Text>
                                </TouchableOpacity>
                            )}
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
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '700',
    },
    photoContainer: {
        width: '100%',
        height: 180,
        borderRadius: 18,
        borderWidth: 1,
        borderStyle: 'dashed',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    companyPhotoPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    photoPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    placeholderText: {
        fontSize: 14,
        fontWeight: '600',
    },
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 4,
    },
    photoWrapper: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 14,
        borderWidth: 1.5,
        overflow: 'hidden',
        position: 'relative',
    },
    gridPhoto: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    deletePhotoBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.low,
    },
    checkboxOverlay: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.low,
    },
    bulkDeleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    bulkDeleteBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default EditRecruiterProfileScreen;
