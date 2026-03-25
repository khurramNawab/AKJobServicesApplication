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
    Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import ModernButton from '../components/ModernButton';
import ScreenWrapper from '../components/ScreenWrapper';

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
            <View style={[styles.centerContainer, { backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: COLORS.background }]}>
                <Text style={{ color: COLORS.textPrimary }}>Job not found</Text>
            </View>
        );
    }

    const initial = (job.recruiterId?.companyName || job.recruiterId?.name || 'C').charAt(0).toUpperCase();

    return (
        <ScreenWrapper bottom={false}>
            <View style={[styles.header, { backgroundColor: COLORS.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                    <Ionicons name="share-social-outline" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.mainCard, { backgroundColor: COLORS.surface }]}>
                    <View style={[styles.logoBox, SHADOWS.soft, { backgroundColor: COLORS.background }]}>
                        {job.recruiterId?.companyLogo ? (
                            <Image source={{ uri: job.recruiterId.companyLogo }} style={styles.logoImg} />
                        ) : (
                            <View style={[styles.logoPlaceholder, { backgroundColor: COLORS.primary + '15' }]}>
                                <Text style={[styles.logoInitial, { color: COLORS.primary }]}>{initial}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={[styles.title, { color: COLORS.textPrimary }]}>{job.title}</Text>
                    <Text style={[styles.company, { color: COLORS.textSecondary }]}>
                        {job.recruiterId?.companyName || job.recruiterId?.name || 'Company Name'}
                    </Text>

                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: COLORS.primary + '10' }]}>
                            <Text style={[styles.badgeText, { color: COLORS.primary }]}>{job.type}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: COLORS.secondary + '10' }]}>
                            <Text style={[styles.badgeText, { color: COLORS.secondary }]}>
                                {job.salaryRange ? `${job.salaryRange.min} - ${job.salaryRange.max}` : 'Competitive'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.detailsSection}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <View style={[styles.iconWrapper, { backgroundColor: COLORS.background }]}>
                                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={[styles.infoLabel, { color: COLORS.textTertiary }]}>Location</Text>
                                <Text style={[styles.infoValue, { color: COLORS.textPrimary }]}>{job.location}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={[styles.iconWrapper, { backgroundColor: COLORS.background }]}>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={[styles.infoLabel, { color: COLORS.textTertiary }]}>Posted On</Text>
                                <Text style={[styles.infoValue, { color: COLORS.textPrimary }]}>
                                    {new Date(job.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Description</Text>
                    <Text style={[styles.description, { color: COLORS.textSecondary }]}>{job.description}</Text>

                    <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Requirements</Text>
                    <Text style={[styles.description, { color: COLORS.textSecondary }]}>{job.requirements}</Text>

                    <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Required Skills</Text>
                    <View style={styles.skillsContainer}>
                        {job.skills?.map((skill, index) => (
                            <View key={index} style={[styles.skillChip, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                                <Text style={[styles.skillText, { color: COLORS.textSecondary }]}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: COLORS.surface, borderTopColor: COLORS.border }]}>
                {user?.role === 'RECRUITER' ? (
                    // Show View Candidates ONLY if this is their job
                    (job.recruiterId?._id === user._id || job.recruiterId === user._id) ? (
                        <ModernButton 
                            title="View Candidates" 
                            onPress={() => navigation.navigate('JobApplicants', { jobId: job._id, jobTitle: job.title })}
                            style={styles.applyBtn}
                        />
                    ) : (
                        <Text style={{ textAlign: 'center', color: COLORS.textTertiary, fontWeight: '700' }}>
                           You are viewing this as a recruiter.
                        </Text>
                    )
                ) : (
                    <ModernButton 
                        title={hasApplied ? 'Applied Successfully' : (applying ? 'Applying...' : 'Apply Now')} 
                        onPress={handleApply}
                        disabled={hasApplied || applying}
                        variant={hasApplied ? 'secondary' : 'primary'}
                        icon={hasApplied ? <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} /> : null}
                        style={styles.applyBtn}
                    />
                )}
            </View>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
    },
    backBtn: {
        padding: 5,
    },
    shareBtn: {
        padding: 5,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    mainCard: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 25,
        borderRadius: 30,
        ...SHADOWS.soft,
    },
    logoBox: {
        width: 80,
        height: 80,
        borderRadius: 24,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
    },
    logoImg: {
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
    logoInitial: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    company: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 6,
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 10,
    },
    badge: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '800',
    },
    detailsSection: {
        marginTop: 30,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '800',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
        marginTop: 10,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        fontWeight: '500',
        marginBottom: 20,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    skillText: {
        fontSize: 13,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 15,
        borderTopWidth: 1,
    },
    applyBtn: {
        height: 60,
    }
});

export default JobDetailsScreen;
