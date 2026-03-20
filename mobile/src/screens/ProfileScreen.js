import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator, 
    ScrollView, 
    Image, 
    StatusBar,
    Switch
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuthStore();
    const { isDarkMode, toggleTheme } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);

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
                setStats(res.data.stats);
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
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error(error);
        }
    };



    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', onPress: logout, style: 'destructive' }
            ]
        );
    };

    const renderMenuItem = (icon, title, onPress, rightElement = null, isDanger = false) => (
        <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: COLORS.surface, borderColor: COLORS.border }, isDanger && { borderColor: COLORS.danger + '20', backgroundColor: COLORS.danger + '05' }]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIconBox, { backgroundColor: isDanger ? COLORS.danger + '10' : COLORS.primary + '10' }]}>
                <Ionicons name={icon} size={22} color={isDanger ? COLORS.danger : COLORS.primary} />
            </View>
            <Text style={[styles.menuText, { color: isDanger ? COLORS.danger : COLORS.textPrimary }]}>{title}</Text>
            {rightElement ? rightElement : <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryLight]}
                        style={styles.headerBg}
                    />
                    <View style={styles.headerInfo}>
                        <View style={[styles.avatarBox, SHADOWS.medium, { backgroundColor: COLORS.surface, borderColor: COLORS.surface }]}>
                            {user?.role === 'RECRUITER' && profile?.companyLogo ? (
                                <Image source={{ uri: profile.companyLogo }} style={styles.avatar} />
                            ) : user?.role === 'CANDIDATE' && profile?.profilePhoto ? (
                                <Image source={{ uri: profile.profilePhoto }} style={styles.avatar} />
                            ) : (
                                <Text style={[styles.avatarInitial, { color: COLORS.primary }]}>
                                    {user?.name?.charAt(0) || 'U'}
                                </Text>
                            )}
                            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: COLORS.primary, borderColor: COLORS.surface }]}>
                                <Ionicons name="camera" size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.userName, { color: COLORS.textPrimary }]}>{user?.name}</Text>
                        <Text style={[styles.userRoleBadge, { color: COLORS.primary, backgroundColor: COLORS.primary + '10' }]}>{user?.role}</Text>
                    </View>
                </View>

                <View style={[styles.statsRow, { backgroundColor: COLORS.surface, borderColor: COLORS.border }, SHADOWS.soft]}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{user?.role === 'RECRUITER' ? stats?.jobs || 0 : stats?.applied || 0}</Text>
                        <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>{user?.role === 'RECRUITER' ? 'Jobs' : 'Applied'}</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: COLORS.border }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{user?.role === 'RECRUITER' ? stats?.applicants || 0 : stats?.interviews || 0}</Text>
                        <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>{user?.role === 'RECRUITER' ? 'Applicants' : 'Interviews'}</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: COLORS.border }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{user?.role === 'RECRUITER' ? stats?.interviews || 0 : stats?.matchRate || '0%'}</Text>
                        <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>{user?.role === 'RECRUITER' ? 'Shortlisted' : 'Match'}</Text>
                    </View>
                </View>

                <View style={styles.contentSection}>
                    <Text style={[styles.sectionTitle, { color: COLORS.textTertiary }]}>Personal</Text>
                    {user?.role === 'CANDIDATE' ? (
                        <>
                            {renderMenuItem("person-outline", "Edit Profile", () => navigation.navigate('EditProfile'))}
                            {renderMenuItem("cloud-upload-outline", "Resume Management", () => navigation.navigate('ResumeViewer', { 
                                resumeUrl: profile?.resume || profile?.resumeUrl, 
                                title: 'My Resume' 
                            }))}
                        </>
                    ) : (
                        renderMenuItem("business-outline", "Company Profile", () => navigation.navigate('EditRecruiterProfile'))
                    )}
                </View>

                <View style={styles.contentSection}>
                    <Text style={[styles.sectionTitle, { color: COLORS.textTertiary }]}>Preferences</Text>
                    {renderMenuItem(
                        isDarkMode ? "moon" : "sunny-outline", 
                        "Dark Mode", 
                        toggleTheme,
                        <Switch 
                            value={isDarkMode} 
                            onValueChange={toggleTheme} 
                            trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            thumbColor="#FFFFFF"
                        />
                    )}
                    {renderMenuItem("notifications-outline", "Notifications", () => navigation.navigate('Notifications'))}
                    {renderMenuItem("shield-checkmark-outline", "Privacy & Security", () => navigation.navigate('PrivacySecurity'))}
                </View>

                <View style={[styles.contentSection, { marginBottom: 40 }]}>
                    <Text style={[styles.sectionTitle, { color: COLORS.textTertiary }]}>Account</Text>
                    {renderMenuItem("log-out-outline", "Log Out", handleLogout, null, true)}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    profileHeader: {
        marginBottom: 20,
    },
    headerBg: {
        height: 120,
        width: '100%',
        paddingTop: 40,
    },
    headerInfo: {
        alignItems: 'center',
        marginTop: -60,
    },
    avatarBox: {
        width: 120,
        height: 120,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        overflow: 'visible',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 36,
    },
    avatarInitial: {
        fontSize: 48,
        fontWeight: '900',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    userName: {
        fontSize: 26,
        fontWeight: '800',
        marginTop: 12,
        letterSpacing: -0.5,
    },
    userRoleBadge: {
        fontSize: 13,
        fontWeight: '800',
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 100,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: SIZES.lg,
        paddingVertical: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 32,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
    },
    contentSection: {
        paddingHorizontal: SIZES.lg,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 6,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 18,
        marginBottom: 12,
        borderWidth: 1,
    },
    menuIconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    }
});

export default ProfileScreen;

