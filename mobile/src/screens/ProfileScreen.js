import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS } from '../constants/theme';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuthStore();
    const [uploading, setUploading] = useState(false);
    const [profile, setProfile] = useState(null);

    useFocusEffect(
        useCallback(() => {
            if (user?.role === 'CANDIDATE') {
                fetchProfile();
            } else if (user?.role === 'RECRUITER') {
                fetchRecruiterProfile();
            }
        }, [user])
    );

    const fetchRecruiterProfile = async () => {
        try {
            const res = await api.get('/recruiters/me');
            if (res.data.success && res.data.data) {
                setProfile(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('/candidates/me');
            if (res.data.success && res.data.data) {
                setProfile(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            });

            if (result.canceled) return;

            const file = result.assets[0];

            // Check file size (< 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Alert.alert('File too large', 'Please upload a file smaller than 5MB');
                return;
            }

            setUploading(true);

            // Create form data for Multer
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
                    // Do not set Content-Type! Let fetch compute the boundary automatically
                },
                body: formData
            });

            const textData = await res.text();
            console.log('--- SERVER RAW RESPONSE ---');
            console.log(textData);
            let data;
            try {
                data = JSON.parse(textData);
            } catch (err) {
                console.error('Server returned non-JSON:', textData);
                throw new Error('Server returned an invalid response. Please try again.');
            }

            if (data.success) {
                Alert.alert('Success', 'resume updated successfully!');
                setProfile(data.data);
            } else {
                throw new Error(data.message || 'Error from server');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            Alert.alert('Upload Failed', 'Failed to upload resume. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', onPress: logout, style: 'destructive' }
            ],
            { cancelable: true }
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                {user?.role === 'RECRUITER' && profile?.companyLogo ? (
                    <Image source={{ uri: profile.companyLogo }} style={styles.avatarImage} />
                ) : user?.role === 'CANDIDATE' && profile?.profilePhoto ? (
                    <Image source={{ uri: profile.profilePhoto }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                )}
                <Text style={styles.name}>{user?.name}</Text>

                {user?.role === 'CANDIDATE' && profile?.headline ? (
                    <Text style={styles.headline}>{profile.headline}</Text>
                ) : null}

                {user?.role === 'RECRUITER' && profile?.companyName ? (
                    <Text style={styles.headline}>{profile.companyName}</Text>
                ) : null}

                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user?.role}</Text>
                </View>
            </View>

            {/* Candidate Details */}
            {user?.role === 'CANDIDATE' && profile && (
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    {profile.phone ? <Text style={styles.infoText}><Ionicons name="call-outline" size={16} />  {profile.phone}</Text> : null}
                    {profile.address ? <Text style={styles.infoText}><Ionicons name="location-outline" size={16} />  {profile.address}</Text> : null}
                    {profile.gender && profile.gender !== 'Prefer not to say' ? <Text style={styles.infoText}><Ionicons name="person-outline" size={16} />  {profile.gender}</Text> : null}
                    {profile.age ? <Text style={styles.infoText}><Ionicons name="calendar-outline" size={16} />  {profile.age} years old</Text> : null}

                    {profile.bio && (
                        <View style={{ marginTop: 12 }}>
                            <Text style={styles.sectionTitle}>About Me</Text>
                            <Text style={styles.bioText}>{profile.bio}</Text>
                        </View>
                    )}

                    {(profile.preferredJobTitle || profile.preferredLocation) && (
                        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                            <Text style={styles.sectionTitle}>Job Preferences</Text>
                            {profile.preferredJobTitle ? <Text style={styles.infoText}><Ionicons name="briefcase-outline" size={16} />  {profile.preferredJobTitle}</Text> : null}
                            {profile.preferredLocation ? <Text style={styles.infoText}><Ionicons name="map-outline" size={16} />  {profile.preferredLocation}</Text> : null}
                        </View>
                    )}
                </View>
            )}

            {/* Recruiter Details */}
            {user?.role === 'RECRUITER' && profile && (
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Company Details</Text>
                    {profile.industry ? <Text style={styles.infoText}><Ionicons name="business-outline" size={16} />  {profile.industry}</Text> : null}
                    {profile.location ? <Text style={styles.infoText}><Ionicons name="location-outline" size={16} />  {profile.location}</Text> : null}
                    {profile.website ? <Text style={styles.infoText}><Ionicons name="globe-outline" size={16} />  {profile.website}</Text> : null}

                    {profile.description ? (
                        <View style={{ marginTop: 12 }}>
                            <Text style={styles.sectionTitle}>Company Description</Text>
                            <Text style={styles.bioText}>{profile.description}</Text>
                        </View>
                    ) : null}
                </View>
            )}

            <View style={styles.section}>
                {user?.role === 'CANDIDATE' && (
                    <>
                        <TouchableOpacity
                            style={styles.menuItemNormal}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.menuTextNormal}>Edit Profile Details</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItemNormal}
                            onPress={handleFileUpload}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                                <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
                            )}
                            <Text style={styles.menuTextNormal}>
                                {profile?.resumeUrl ? 'Update Resume (PDF)' : 'Upload Resume (PDF)'}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {user?.role === 'RECRUITER' && (
                    <TouchableOpacity
                        style={styles.menuItemNormal}
                        onPress={() => navigation.navigate('EditRecruiterProfile')}
                    >
                        <Ionicons name="business-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.menuTextNormal}>Edit Company Profile</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
                    <Text style={styles.menuTextDanger}>Log Out</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundLight,
    },
    header: {
        backgroundColor: COLORS.white,
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
        resizeMode: 'cover',
        borderWidth: 2,
        borderColor: COLORS.primary + '30',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    headline: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    email: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 100,
    },
    roleText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoSection: {
        backgroundColor: COLORS.white,
        marginTop: 16,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    bioText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    section: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.danger + '30',
        marginBottom: 12,
    },
    menuTextDanger: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.danger,
        marginLeft: 12,
    },
    menuItemNormal: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
    },
    menuTextNormal: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 12,
    }
});

export default ProfileScreen;
