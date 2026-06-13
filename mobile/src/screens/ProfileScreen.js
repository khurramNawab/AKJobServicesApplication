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
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
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
            const token = await SecureStore.getItemAsync('userToken');

            // 3. Perform Native Upload (bypass Axios entirely for stability)
            const response = await fetch(`${api.defaults.baseURL}${endpoint}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
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

    const renderStatCard = (label, value, icon, gradientColors) => (
        <View style={[styles.statCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }, SHADOWS.low]}>
            <LinearGradient
                colors={gradientColors || (isDarkMode ? [COLORS.primaryDark + '15', COLORS.primary + '08'] : [COLORS.primaryLight + '20', COLORS.primary + '05'])}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={[styles.statIcon, { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }]}>
                <Ionicons name={icon} size={18} color={COLORS.primary} />
            </View>
            <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>{label}</Text>
            </View>
        </View>
    );

    const getMenuIconStyles = (iconName, isDanger) => {
        if (isDanger) {
            return {
                bg: COLORS.danger + '12',
                icon: COLORS.danger
            };
        }
        
        let bg = COLORS.primary + '12';
        let iconColor = COLORS.primary;
        
        switch (iconName) {
            case 'business-outline':
                bg = isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)';
                iconColor = '#6366F1';
                break;
            case 'person-outline':
                bg = isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)';
                iconColor = '#3B82F6';
                break;
            case 'heart-outline':
                bg = isDarkMode ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)';
                iconColor = '#EC4899';
                break;
            case 'document-text-outline':
                bg = isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)';
                iconColor = '#10B981';
                break;
            case 'sunny-outline':
            case 'moon':
                bg = isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)';
                iconColor = '#F59E0B';
                break;
            case 'notifications-outline':
                bg = isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)';
                iconColor = '#8B5CF6';
                break;
            case 'shield-checkmark-outline':
                bg = isDarkMode ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.1)';
                iconColor = '#06B6D4';
                break;
        }
        
        return { bg, icon: iconColor };
    };

    const renderMenuButton = (icon, title, subtitle, onPress, isDanger = false) => {
        const iconStyles = getMenuIconStyles(icon, isDanger);
        return (
            <TouchableOpacity 
                style={[
                    styles.menuBtn, 
                    { backgroundColor: COLORS.surface, borderColor: COLORS.border },
                    isDanger && { borderColor: COLORS.danger + '15' }
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={[styles.menuIconContainer, { backgroundColor: iconStyles.bg }]}>
                    <Ionicons name={icon} size={22} color={iconStyles.icon} />
                </View>
                <View style={styles.menuTextContainer}>
                    <Text style={[styles.menuTitle, { color: isDanger ? COLORS.danger : COLORS.textPrimary }]}>{title}</Text>
                    {subtitle && <Text style={[styles.menuSubtitle, { color: COLORS.textTertiary }]}>{subtitle}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = (title) => (
        <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: COLORS.primary }]} />
            <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>{title}</Text>
        </View>
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
                    <EliteGradient style={styles.headerGradient}>
                        {/* Decorative floating shapes in background */}
                        <View style={styles.floatingCircleLeft} />
                        <View style={styles.floatingCircleRight} />
                    </EliteGradient>
                    <View style={styles.profileCardWrapper}>
                        <Animated.View entering={FadeInDown.duration(800)} style={[styles.profileCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }, SHADOWS.medium]}>
                            <View style={styles.avatarContainer}>
                                <LinearGradient
                                    colors={['#6366F1', '#3B82F6', '#EC4899']}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 1}}
                                    style={styles.avatarGradientRing}
                                >
                                    <View style={[styles.avatarInner, { backgroundColor: COLORS.surface }]}>
                                        {profileImage ? (
                                            <Image source={{ uri: profileImage }} style={styles.avatar} />
                                        ) : (
                                            <LinearGradient
                                                colors={isDarkMode ? ['#312E81', '#1E1B4B'] : ['#EEF2FF', '#E0E7FF']}
                                                style={styles.avatarPlaceholder}
                                            >
                                                <Text style={[styles.avatarInitial, { color: isDarkMode ? '#A5B4FC' : '#4F46E5' }]}>
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </Text>
                                            </LinearGradient>
                                        )}
                                    </View>
                                </LinearGradient>

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
                                        <Ionicons name="camera" size={14} color="#FFF" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.userName, { color: COLORS.textPrimary }]}>{user?.name}</Text>
                            <Text style={[styles.userRole, { color: COLORS.textSecondary }]}>
                                {user?.role === 'RECRUITER' 
                                    ? (profile?.companyName ? `${profile.companyName} • Hiring Manager` : 'Hiring Manager') 
                                    : (profile?.headline || 'Job Seeker')}
                            </Text>

                            <View style={[styles.roleBadge, { 
                                backgroundColor: user?.role === 'RECRUITER' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                borderColor: user?.role === 'RECRUITER' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                            }]}>
                                <Ionicons 
                                    name={user?.role === 'RECRUITER' ? 'briefcase' : 'sparkles'} 
                                    size={12} 
                                    color={user?.role === 'RECRUITER' ? '#4F46E5' : '#10B981'} 
                                    style={{ marginRight: 6 }} 
                                />
                                <Text style={[styles.roleBadgeText, { color: user?.role === 'RECRUITER' ? '#4F46E5' : '#10B981' }]}>
                                    {user?.role}
                                </Text>
                            </View>

                            <View style={styles.statsContainer}>
                                {user?.role === 'RECRUITER' ? (
                                    <>
                                        {renderStatCard('Jobs', stats?.jobs || 0, 'briefcase', ['rgba(99, 102, 241, 0.08)', 'rgba(59, 130, 246, 0.03)'])}
                                        {renderStatCard('Candidates', stats?.applicants || 0, 'people', ['rgba(139, 92, 246, 0.08)', 'rgba(168, 85, 247, 0.03)'])}
                                    </>
                                ) : (
                                    <>
                                        {renderStatCard('Applied', stats?.applied || 0, 'send', ['rgba(16, 185, 129, 0.08)', 'rgba(5, 150, 105, 0.03)'])}
                                        {renderStatCard('Interviews', stats?.interviews || 0, 'videocam', ['rgba(59, 130, 246, 0.08)', 'rgba(37, 99, 235, 0.03)'])}
                                    </>
                                )}
                            </View>
                        </Animated.View>
                    </View>
                </View>

                {/* Account Settings */}
                <View style={styles.section}>
                    {renderSectionHeader('Professional')}
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
                    {renderSectionHeader('Settings')}
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
                    {renderSectionHeader('System')}
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
        position: 'relative',
        overflow: 'hidden',
    },
    floatingCircleLeft: {
        position: 'absolute',
        top: -40,
        left: -30,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    floatingCircleRight: {
        position: 'absolute',
        bottom: -20,
        right: -40,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    profileCardWrapper: {
        paddingHorizontal: SIZES.lg,
        marginTop: -90,
    },
    profileCard: {
        borderRadius: 24,
        padding: SIZES.xl,
        alignItems: 'center',
        borderWidth: 1,
    },
    avatarContainer: {
        width: 116,
        height: 116,
        marginBottom: 16,
        position: 'relative',
    },
    avatarGradientRing: {
        width: 116,
        height: 116,
        borderRadius: 58,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
        overflow: 'hidden',
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 58,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 38,
        fontWeight: '800',
    },
    editBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 10,
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    userRole: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
    },
    roleBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
        gap: 12,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    statIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    statContent: {
        flex: 1,
        zIndex: 2,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 1,
    },
    section: {
        paddingHorizontal: SIZES.lg,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginLeft: 4,
    },
    sectionIndicator: {
        width: 4,
        height: 16,
        borderRadius: 2,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    menuBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 18,
        marginBottom: 12,
        borderWidth: 1,
    },
    menuIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    menuSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    }
});

export default ProfileScreen;
