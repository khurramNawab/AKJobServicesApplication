import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    Image,
    SafeAreaView,
    StatusBar,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LinearGradient } from 'expo-linear-gradient';
import ModernButton from '../components/ModernButton';

const { width } = Dimensions.get('window');

const JobDetailsScreen = ({ route, navigation }) => {
    const { jobId } = route.params;
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const res = await api.get(`/jobs/${jobId}`);
            if (res.data.success) {
                setJob(res.data.data);
            }

            if (user?.role === 'CANDIDATE') {
                const checkRes = await api.get(`/applications/check/${jobId}`);
                if (checkRes.data.success) {
                    setHasApplied(checkRes.data.hasApplied);
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch job details');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (user?.role !== 'CANDIDATE') {
            Alert.alert('Access Denied', 'Only candidates can apply for jobs.');
            return;
        }

        try {
            setApplying(true);
            const res = await api.post(`/jobs/${jobId}/apply`, {});

            if (res.data.success) {
                Alert.alert('Success!', 'Your application has been submitted.');
                setHasApplied(true);
            }
        } catch (error) {
            console.error('Application API Error:', error);
            Alert.alert('Application Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: COLORS.background }]}>
                <Ionicons name="alert-circle-outline" size={60} color={COLORS.textTertiary} />
                <Text style={[styles.errorText, { color: COLORS.textSecondary }]}>Job not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: COLORS.background }]}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryLight]}
                    style={styles.headerBackground}
                >
                    <SafeAreaView>
                        <View style={styles.navBar}>
                            <TouchableOpacity style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={() => navigation.goBack()}>
                                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.headerContent}>
                            <View style={[styles.logoBox, SHADOWS.soft, { backgroundColor: '#FFFFFF' }]}>
                                {job.recruiterId?.companyLogo ? (
                                    <Image source={{ uri: job.recruiterId.companyLogo }} style={styles.headerLogo} />
                                ) : (
                                    <Text style={[styles.logoPlaceholderText, { color: COLORS.primary }]}>
                                        {(job.recruiterId?.companyName || job.recruiterId?.name)?.charAt(0)?.toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.jobTitle}>{job.title}</Text>
                            <Text style={styles.companyNameText}>
                                {job.recruiterId?.companyName || job.recruiterId?.name}
                            </Text>

                            <View style={styles.headerBadges}>
                                <View style={[styles.headerBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Text style={styles.headerBadgeText}>{job.type}</Text>
                                </View>
                                <View style={[styles.headerBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Text style={styles.headerBadgeText}>Active</Text>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                <View style={styles.bodyContent}>
                    <View style={[styles.metaGrid, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                        <View style={styles.metaBox}>
                            <View style={[styles.metaIconBox, { backgroundColor: COLORS.background }]}>
                                <Ionicons name="location-sharp" size={20} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={[styles.metaLabel, { color: COLORS.textTertiary }]}>Location</Text>
                                <Text style={[styles.metaValue, { color: COLORS.textPrimary }]}>{job.location}</Text>
                            </View>
                        </View>
                        <View style={styles.metaBox}>
                            <View style={[styles.metaIconBox, { backgroundColor: COLORS.background }]}>
                                <Ionicons name="wallet-sharp" size={20} color={COLORS.secondary} />
                            </View>
                            <View>
                                <Text style={[styles.metaLabel, { color: COLORS.textTertiary }]}>Salary</Text>
                                <Text style={[styles.metaValue, { color: COLORS.textPrimary }]}>
                                    {job.salaryRange?.min} - {job.salaryRange?.max}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>About the Role</Text>
                        <Text style={[styles.descriptionText, { color: COLORS.textSecondary }]}>{job.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>What you'll do</Text>
                        <Text style={[styles.descriptionText, { color: COLORS.textSecondary }]}>{job.requirements}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Skills & Expertise</Text>
                        <View style={styles.skillsWrapper}>
                            {job.skills?.map((skill, index) => (
                                <View key={index} style={[styles.skillTag, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                                    <Text style={[styles.skillTagText, { color: COLORS.textSecondary }]}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, SHADOWS.medium, { backgroundColor: COLORS.surface, borderTopColor: COLORS.border }]}>
                <View style={styles.footerInner}>
                    <TouchableOpacity 
                        style={[styles.messageButton, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}
                        onPress={() => navigation.navigate('ChatRoom', {
                            otherUser: job.recruiterId,
                            conversationId: null
                        })}
                    >
                        <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <ModernButton
                        title={hasApplied ? 'Current Progress' : 'Apply Now'}
                        onPress={handleApply}
                        loading={applying}
                        variant={hasApplied ? 'secondary' : 'primary'}
                        style={styles.applyBtn}
                        textStyle={{ fontSize: 18 }}
                    />
                </View>
            </View>
        </View>
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
    errorText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '700',
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerBackground: {
        paddingTop: 30,
        paddingBottom: 40,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingTop: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: SIZES.xl,
        marginTop: 10,
    },
    logoBox: {
        width: 84,
        height: 84,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    headerLogo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    logoPlaceholderText: {
        fontSize: 32,
        fontWeight: '900',
    },
    jobTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    companyNameText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 6,
        fontWeight: '600',
    },
    headerBadges: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    headerBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 100,
    },
    headerBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    bodyContent: {
        paddingHorizontal: SIZES.lg,
        marginTop: -30,
    },
    metaGrid: {
        flexDirection: 'row',
        borderRadius: 24,
        padding: 20,
        gap: 20,
        ...SHADOWS.soft,
        borderWidth: 1,
    },
    metaBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metaIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    metaValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    section: {
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: -0.3,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 26,
        fontWeight: '500',
    },
    skillsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillTag: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    skillTagText: {
        fontSize: 14,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 16,
        paddingBottom: 34,
        paddingHorizontal: SIZES.lg,
        borderTopWidth: 1,
    },
    footerInner: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    messageButton: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    applyBtn: {
        flex: 1,
        height: 56,
    }
});

export default JobDetailsScreen;
