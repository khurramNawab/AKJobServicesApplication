import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator, 
    ScrollView, 
    Image, 
    Switch,
    Dimensions,
    Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
    FadeInDown, 
    FadeInRight, 
} from 'react-native-reanimated';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import EliteGradient from '../components/EliteGradient';
import PremiumButton from '../components/PremiumButton';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    const { user, setUser, logout } = useAuthStore();
    const { isDarkMode, toggleTheme } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photoUploading, setPhotoUploading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const endpoint = user?.role === 'RECRUITER' ? '/recruiters/me' : '/candidates/me';
            const res = await api.get(endpoint);
            if (res.data.success && res.data.data) {
                setProfile(res.data.data);
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error('Profile Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [user])
    );

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out of your professional account?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', onPress: logout, style: 'destructive' }
            ]
        );
    };

    const handlePhotoUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*'],
            });

            if (result.canceled) return;

            const file = result.assets[0];

            // 5MB limit for images
            if (file.size > 5 * 1024 * 1024) {
                Alert.alert('File too large', 'Please upload a image smaller than 5MB');
                return;
            }

            setPhotoUploading(true);

            const formData = new FormData();
            const isRecruiter = user?.role === 'RECRUITER';
            
            const fieldName = isRecruiter ? 'logo' : 'photo';
            const endpoint = isRecruiter ? '/recruiters/me/logo' : '/candidates/me/photo';

            // 1. Rigorous photo file object construction
            const photoFile = {
                uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                name: file.name || `photo_${Date.now()}.jpg`,
                type: file.mimeType || 'image/jpeg',
            };

            formData.append(fieldName, photoFile);

            console.log(`[ProfileScreen] Attempting upload via Native Fetch...`, {
                endpoint,
                fieldName,
                fileName: photoFile.name,
                fileType: photoFile.type,
                fileSize: file.size
            });

            // 2. Get Token manually for Fetch
            const token = await AsyncStorage.getItem('userToken');

            // 3. Perform Native Upload (bypass Axios entirely for stability)
            const response = await fetch(`${api.defaults.baseURL}${endpoint}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    // ⚠️  DO NOT set Content-Type: fetch handles it automatically for FormData
                },
            });

            const resData = await response.json();
            console.log('[ProfileScreen] Upload result:', resData.success ? 'SUCCESS' : 'FAILED');

            if (resData.success) {
                const newData = resData.data;
                const newPhotoUrl = isRecruiter ? newData.companyLogo : newData.profilePhoto;
                
                console.log('[ProfileScreen] Photo upload success! New URL:', newPhotoUrl);

                // Update UI and AuthStore
                setProfile(newData);
                const updatedUser = { 
                    ...user, 
                    profilePhoto: isRecruiter ? undefined : newPhotoUrl,
                    companyLogo: isRecruiter ? newPhotoUrl : undefined
                };
                setUser(updatedUser);

                Alert.alert('Success 🎉', 'Profile picture updated successfully!');
            } else {
                throw new Error(resData.message || 'Error updating photo');
            }
        } catch (error) {
            console.error('[ProfileScreen] Photo upload error:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to update photo';
            Alert.alert('Upload Failed', msg);
        } finally {
            setPhotoUploading(false);
        }
    };

    const renderStat = (label, value, icon) => (
        <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '10' }]}>
                <Ionicons name={icon} size={18} color={COLORS.primary} />
            </View>
            <View>
                <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: COLORS.textTertiary }]}>{label}</Text>
            </View>
        </View>
    );

    const renderMenuButton = (icon, title, subtitle, onPress, isDanger = false) => (
        <TouchableOpacity 
            style={[
                styles.menuBtn, 
                { backgroundColor: COLORS.surface, borderColor: COLORS.border },
                isDanger && { borderColor: COLORS.danger + '20' }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: isDanger ? COLORS.danger + '10' : COLORS.backgroundSecondary }]}>
                <Ionicons name={icon} size={22} color={isDanger ? COLORS.danger : COLORS.primary} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: isDanger ? COLORS.danger : COLORS.textPrimary }]}>{title}</Text>
                {subtitle && <Text style={[styles.menuSubtitle, { color: COLORS.textTertiary }]}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
        </TouchableOpacity>
    );

    if (loading && !profile) {
        return (
            <ScreenWrapper>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    const profileImage = user?.role === 'RECRUITER' ? profile?.companyLogo : profile?.profilePhoto;

    return (
        <ScreenWrapper top={false} bottom={false}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <EliteGradient style={styles.headerGradient} />
                    <View style={styles.profileCardWrapper}>
                        <Animated.View entering={FadeInDown.duration(800)} style={[styles.profileCard, { backgroundColor: COLORS.surface, ...SHADOWS.glass }]}>
                            <View style={[styles.avatarWrapper, { borderColor: COLORS.surface }]}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primary + '20' }]}>
                                        <Text style={[styles.avatarInitial, { color: COLORS.primary }]}>
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}

                                {photoUploading && (
                                    <View style={[styles.avatarOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                                        <ActivityIndicator color="#FFF" size="small" />
                                    </View>
                                )}

                                <TouchableOpacity 
                                    style={[styles.editBtn, { backgroundColor: COLORS.primary }]}
                                    onPress={handlePhotoUpload}
                                    disabled={photoUploading}
                                >
                                    {photoUploading ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Ionicons name="camera" size={16} color="#FFF" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.userName, { color: COLORS.textPrimary }]}>{user?.name}</Text>
                            <Text style={[styles.userRole, { color: COLORS.textSecondary }]}>
                                {profile?.headline || (user?.role === 'RECRUITER' ? 'Hiring Manager' : 'Job Seeker')}
                            </Text>

                            <View style={[styles.roleBadge, { backgroundColor: COLORS.primary + '10' }]}>
                                <Text style={[styles.roleBadgeText, { color: COLORS.primary }]}>{user?.role}</Text>
                            </View>

                            <View style={styles.statsContainer}>
                                {user?.role === 'RECRUITER' ? (
                                    <>
                                        {renderStat('Jobs', stats?.jobs || 0, 'briefcase')}
                                        {renderStat('Candidates', stats?.applicants || 0, 'people')}
                                    </>
                                ) : (
                                    <>
                                        {renderStat('Applied', stats?.applied || 0, 'send')}
                                        {renderStat('Interviews', stats?.interviews || 0, 'videocam')}
                                    </>
                                )}
                            </View>
                        </Animated.View>
                    </View>
                </View>

                {/* Account Settings */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Professional</Text>
                    {user?.role === 'CANDIDATE' ? (
                        <>
                            {renderMenuButton('person-outline', 'Edit Profile', 'Personal info, bio, and social links', () => navigation.navigate('EditProfile'))}
                            {renderMenuButton('heart-outline', 'Saved Jobs', 'View your wishlisted opportunities', () => navigation.navigate('SavedJobs'))}
                            {renderMenuButton('document-text-outline', 'My Resume', 'View and update your professional CV', () => {
                                const url = profile?.resumeUrl || null;
                                console.log('[ProfileScreen] Navigating to ResumeViewer with URL:', url);
                                navigation.navigate('ResumeViewer', { 
                                    resumeUrl: url, 
                                    title: 'My Resume' 
                                });
                            })}
                        </>
                    ) : (
                        renderMenuButton('business-outline', 'Company Profile', 'Manage company logo, description, and site', () => navigation.navigate('EditRecruiterProfile'))
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Settings</Text>
                    {renderMenuButton(
                        isDarkMode ? 'moon' : 'sunny-outline', 
                        'Appearance', 
                        isDarkMode ? 'Dark mode is active' : 'Light mode is active', 
                        toggleTheme
                    )}
                    {renderMenuButton('notifications-outline', 'Notifications', 'Newsletter, alerts, and job matches', () => navigation.navigate('Notifications'))}
                    {renderMenuButton('shield-checkmark-outline', 'Privacy', 'Security settings and data privacy', () => navigation.navigate('PrivacySecurity'))}
                </View>

                <View style={[styles.section, { marginBottom: 120 }]}>
                    <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>System</Text>
                    {renderMenuButton('log-out-outline', 'Sign Out', 'Safely log out of your session', handleLogout, true)}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerContainer: {
        height: 440,
        marginBottom: 20,
    },
    headerGradient: {
        height: 200,
        width: '100%',
    },
    profileCardWrapper: {
        paddingHorizontal: SIZES.lg,
        marginTop: -100,
    },
    profileCard: {
        borderRadius: 32,
        padding: SIZES.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarWrapper: {
        width: 110,
        height: 110,
        borderRadius: 38,
        borderWidth: 5,
        marginBottom: 16,
        position: 'relative',
        ...SHADOWS.medium,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 34,
    },
    avatarOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 40,
        fontWeight: '800',
    },
    editBtn: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 34,
        height: 34,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    userRole: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    roleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 12,
    },
    roleBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: SIZES.lg,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
        marginLeft: 4,
    },
    menuBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
    },
    menuIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    menuSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    }
});

export default ProfileScreen;
