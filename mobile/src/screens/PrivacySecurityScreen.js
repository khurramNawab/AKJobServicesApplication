import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Switch, 
    ActivityIndicator,
    Alert
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { LIGHT_COLORS, DARK_COLORS, SIZES, SHADOWS } from '../constants/theme';
import api from '../services/api';

const PrivacySecurityScreen = ({ navigation }) => {
    const { isDarkMode } = useThemeStore();
    const { user } = useAuthStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [privacy, setPrivacy] = useState({
        profileVisibility: true,
        emailNotifications: true,
        showPhone: true,
        whatsappUpdates: false
    });

    useEffect(() => {
        fetchPrivacySettings();
    }, []);

    const fetchPrivacySettings = async () => {
        try {
            const endpoint = user?.role === 'RECRUITER' ? '/recruiters/me' : '/candidates/me';
            const res = await api.get(endpoint);
            if (res.data.success && res.data.data.privacy) {
                // Ensure all fields exist with defaults if missing
                setPrivacy({
                    ...privacy,
                    ...res.data.data.privacy,
                    // Handle recruiter specific field naming if needed, though models use similar structure
                    profileVisibility: res.data.data.privacy.profileVisibility ?? res.data.data.privacy.companyVisibility ?? true
                });
            }
        } catch (error) {
            console.error('Error fetching privacy:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSetting = async (key, value) => {
        const newPrivacy = { ...privacy, [key]: value };
        setPrivacy(newPrivacy);
        
        try {
            setUpdating(true);
            const endpoint = user?.role === 'RECRUITER' ? '/recruiters/me' : '/candidates/me';
            
            // Map generic state back to model field if recruiter
            const payload = { ...newPrivacy };
            if (user?.role === 'RECRUITER') {
                payload.companyVisibility = payload.profileVisibility;
                delete payload.profileVisibility;
                delete payload.showPhone; // recruiters don't have showPhone in model
            }

            await api.put(endpoint, { privacy: payload });
        } catch (error) {
            Alert.alert("Update Failed", "We couldn't save your preference. Please try again.");
            // Revert on failure
            setPrivacy(prev => ({ ...prev, [key]: !value }));
        } finally {
            setUpdating(false);
        }
    };

    const Section = ({ title, children }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: COLORS.textTertiary }]}>{title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }, SHADOWS.soft]}>
                {children}
            </View>
        </View>
    );

    const SettingItem = ({ icon, title, value, onToggle, isLast = false, disabled = false }) => (
        <View style={[styles.settingItem, !isLast && { borderBottomWidth: 1, borderBottomColor: COLORS.border }, disabled && { opacity: 0.5 }]}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.primary + '10' }]}>
                <Ionicons name={icon} size={20} color={COLORS.primary} />
            </View>
            <Text style={[styles.settingText, { color: COLORS.textPrimary }]}>{title}</Text>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor="#FFFFFF"
                disabled={disabled || updating}
            />
        </View>
    );

    if (loading) {
        return (
            <ScreenWrapper bottom={false} style={{ justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bottom={false}>
            <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backBtn}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>Privacy & Security</Text>
                <View style={styles.headerRight}>
                    {updating && <ActivityIndicator size="small" color={COLORS.primary} />}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Section title="Visibility">
                    <SettingItem 
                        icon="eye-outline" 
                        title={user?.role === 'RECRUITER' ? "Company Visible to Candidates" : "Profile Visible to Recruiters"} 
                        value={privacy.profileVisibility} 
                        onToggle={(val) => toggleSetting('profileVisibility', val)} 
                    />
                    {user?.role !== 'RECRUITER' && (
                        <SettingItem 
                            icon="call-outline" 
                            title="Show Phone Number" 
                            value={privacy.showPhone} 
                            onToggle={(val) => toggleSetting('showPhone', val)} 
                            isLast 
                        />
                    )}
                </Section>

                <Section title="Notifications">
                    <SettingItem 
                        icon="mail-outline" 
                        title="Email Notifications" 
                        value={privacy.emailNotifications} 
                        onToggle={(val) => toggleSetting('emailNotifications', val)} 
                    />
                    <SettingItem 
                        icon="logo-whatsapp" 
                        title="WhatsApp Updates" 
                        value={privacy.whatsappUpdates} 
                        onToggle={(val) => toggleSetting('whatsappUpdates', val)} 
                        isLast 
                    />
                </Section>
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '800',
    },
    headerRight: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionCard: {
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
    },
    actionText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '700',
    }
});

export default PrivacySecurityScreen;
