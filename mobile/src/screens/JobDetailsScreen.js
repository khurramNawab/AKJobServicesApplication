import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Image, 
    Alert,
    Share,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { 
    FadeInDown, 
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import PremiumButton from '../components/PremiumButton';
import EliteGradient from '../components/EliteGradient';

const { width } = Dimensions.get('window');

const JobDetailsScreen = ({ route, navigation }) => {
    const { jobId } = route.params;
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasApplied, setHasApplied] = useState(false);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        fetchJobDetails();
        if (user?.role === 'CANDIDATE') {
            checkIfApplied();
        }
    }, [jobId, user]);

    const fetchJobDetails = async () => {
        try {
            const res = await api.get(`/jobs/${jobId}`);
            if (res.data.success) {
                setJob(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
            Alert.alert('Error', 'Could not load job details.');
        } finally {
            setLoading(false);
        }
    };

    const checkIfApplied = async () => {
        try {
            const res = await api.get(`/applications/check/${jobId}`);
            if (res.data.success) {
                setHasApplied(res.data.hasApplied);
            }
        } catch (error) {
            console.error('Error checking application status:', error);
        }
    };

    const handleApply = async () => {
        if (!user) {
            Alert.alert('Login Required', 'You must be logged in to apply for jobs.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        if (user.role !== 'CANDIDATE') {
            Alert.alert('Not Authorized', 'Only candidates can apply for jobs.');
            return;
        }

        try {
            setApplying(true);
            const res = await api.post(`/jobs/${jobId}/apply`, {
                coverLetter: "I am very interested in this position and believe my skills align well with the requirements."
            });

            if (res.data.success) {
                setHasApplied(true);
                Alert.alert('Success!', 'Your application has been submitted successfully.');
            }
        } catch (error) {
            console.error('Error applying for job:', error);
            const errorMessage = error.response?.data?.message || 'Something went wrong.';
            if (errorMessage.toLowerCase().includes('already applied')) {
                setHasApplied(true);
            }
            Alert.alert('Application Failed', errorMessage);
        } finally {
            setApplying(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this job: ${job.title} at ${job.recruiterId?.companyName || 'the company'}.`,
            });
        } catch (error) {
            console.error('Error sharing job:', error.message);
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

    if (!job) {
        return (
            <ScreenWrapper>
                <View style={[styles.centerContainer, { backgroundColor: COLORS.background }]}>
                    <Text style={{ color: COLORS.textPrimary }}>Job not found</Text>
                </View>
            </ScreenWrapper>
        );
    }

    const companyName = job.recruiterId?.companyName || job.recruiterId?.name || 'Company Name';

    return (
        <ScreenWrapper bottom={false}>
            {/* Transparent Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={[styles.headerIconBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={handleShare} 
                    style={[styles.headerIconBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                >
                    <Ionicons name="share-outline" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View entering={FadeInUp.duration(600)} style={styles.heroSection}>
                    <View style={[styles.logoWrapper, { backgroundColor: COLORS.surface, ...SHADOWS.medium }]}>
                        {job.recruiterId?.companyLogo ? (
                            <Image source={{ uri: job.recruiterId.companyLogo }} style={styles.logo} />
                        ) : (
                            <EliteGradient style={styles.logoPlaceholder}>
                                <Text style={styles.logoText}>{companyName.charAt(0).toUpperCase()}</Text>
                            </EliteGradient>
                        )}
                    </View>
                    
                    <Text style={[styles.title, { color: COLORS.textPrimary }]}>{job.title}</Text>
                    <Text style={[styles.company, { color: COLORS.textSecondary }]}>{companyName}</Text>
                </Animated.View>

                <View style={styles.quickInfoRow}>
                    <View style={[styles.infoCard, { backgroundColor: COLORS.surface }]}>
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '10' }]}>
                            <Ionicons name="location" size={18} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.infoTitle, { color: COLORS.textTertiary }]}>Location</Text>
                        <Text style={[styles.infoValue, { color: COLORS.textPrimary }]} numberOfLines={1}>{job.location}</Text>
                    </View>
                    <View style={[styles.infoCard, { backgroundColor: COLORS.surface }]}>
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.success + '10' }]}>
                            <Ionicons name="wallet" size={18} color={COLORS.success} />
                        </View>
                        <Text style={[styles.infoTitle, { color: COLORS.textTertiary }]}>Salary</Text>
                        <Text style={[styles.infoValue, { color: COLORS.textPrimary }]} numberOfLines={1}>
                            {job.salaryRange?.min} - {job.salaryRange?.max}
                        </Text>
                    </View>
                    <View style={[styles.infoCard, { backgroundColor: COLORS.surface }]}>
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.warning + '10' }]}>
                            <Ionicons name="time" size={18} color={COLORS.warning} />
                        </View>
                        <Text style={[styles.infoTitle, { color: COLORS.textTertiary }]}>Type</Text>
                        <Text style={[styles.infoValue, { color: COLORS.textPrimary }]} numberOfLines={1}>{job.type}</Text>
                    </View>
                </View>

                <Animated.View entering={FadeInDown.delay(200)} style={styles.contentSection}>
                    <Text style={[styles.sectionHeading, { color: COLORS.textPrimary }]}>About the Role</Text>
                    <Text style={[styles.para, { color: COLORS.textSecondary }]}>{job.description}</Text>

                    <Text style={[styles.sectionHeading, { color: COLORS.textPrimary }]}>Requirements</Text>
                    <Text style={[styles.para, { color: COLORS.textSecondary }]}>{job.requirements}</Text>

                    <Text style={[styles.sectionHeading, { color: COLORS.textPrimary }]}>Skills Required</Text>
                    <View style={styles.skillsWrapper}>
                        {job.skills?.map((skill, index) => (
                            <View key={index} style={[styles.skillTag, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                                <Text style={[styles.skillText, { color: COLORS.textSecondary }]}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Sticky Footer */}
            <BlurView 
                intensity={Platform.OS === 'ios' ? 80 : 100} 
                tint={isDarkMode ? 'dark' : 'light'} 
                style={styles.footer}
            >
                {user?.role === 'RECRUITER' ? (
                    (job.recruiterId?._id === user._id || job.recruiterId === user._id) ? (
                        <PremiumButton 
                            title="Manage Applicants" 
                            onPress={() => navigation.navigate('JobApplicants', { jobId: job._id, jobTitle: job.title })}
                        />
                    ) : (
                        <View style={styles.recruiterNotice}>
                            <Ionicons name="information-circle-outline" size={20} color={COLORS.textTertiary} />
                            <Text style={[styles.noticeText, { color: COLORS.textTertiary }]}>Viewing as Recruiter</Text>
                        </View>
                    )
                ) : (
                    <PremiumButton 
                        title={hasApplied ? 'Application Sent' : (applying ? 'Processing...' : 'Apply Now')} 
                        variant={hasApplied ? 'secondary' : 'primary'}
                        disabled={hasApplied || applying}
                        onPress={handleApply}
                        iconRight={hasApplied ? <Ionicons name="checkmark-circle" size={22} color="#FFF" /> : null}
                    />
                )}
            </BlurView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.md,
        zIndex: 10,
    },
    headerIconBtn: {
        width: 48,
        height: 48,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    scrollContent: {
        paddingTop: SIZES.md,
    },
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: SIZES.xl,
        marginBottom: SIZES.xl,
    },
    logoWrapper: {
        width: 90,
        height: 90,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    logoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFF',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    company: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 6,
    },
    quickInfoRow: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.lg,
        gap: 12,
        marginBottom: SIZES.xxl,
    },
    infoCard: {
        flex: 1,
        padding: 14,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        ...SHADOWS.soft,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoTitle: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    contentSection: {
        paddingHorizontal: SIZES.lg,
    },
    sectionHeading: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 12,
        marginTop: SIZES.lg,
    },
    para: {
        fontSize: 15,
        lineHeight: 26,
        fontWeight: '500',
    },
    skillsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 4,
    },
    skillTag: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    skillText: {
        fontSize: 14,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SIZES.xl,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    recruiterNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    noticeText: {
        fontWeight: '700',
        fontSize: 14,
    }
});

export default JobDetailsScreen;
