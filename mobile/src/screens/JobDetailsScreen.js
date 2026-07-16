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
    Platform,
    Modal,
    Linking
} from 'react-native';
import * as Haptics from 'expo-haptics';
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

const formatSalaryShort = (val) => {
    if (!val) return '';
    const num = Number(val);
    if (isNaN(num)) return val;
    if (num >= 10000000) return `${(num / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1).replace(/\.0$/, '')}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return num.toString();
};

const JobDetailsScreen = ({ route, navigation }) => {
    const { jobId } = route.params;
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasApplied, setHasApplied] = useState(false);
    const [applying, setApplying] = useState(false);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerImage, setViewerImage] = useState('');
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: '',
        value: '',
        icon: 'location',
        iconColor: '#6366F1',
        type: 'text',      // 'text' | 'salary'
        salaryMin: null,
        salaryMax: null,
    });

    useEffect(() => {
        fetchJobDetails();
        if (user?.role === 'CANDIDATE') {
            checkIfApplied();
        }
    }, [jobId, user]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchJobDetails();
        });
        return unsubscribe;
    }, [navigation, jobId]);

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

    const handleToggleStatus = async () => {
        const newStatus = job.status === 'CLOSED' ? 'OPEN' : 'CLOSED';
        try {
            const res = await api.put(`/jobs/${job._id}`, { status: newStatus });
            if (res.data.success) {
                setJob({ ...job, status: newStatus });
                Alert.alert('Status Updated', `Job posting is now ${newStatus.toLowerCase()}.`);
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            Alert.alert('Error', 'Failed to update job status.');
        }
    };

    const handleDeleteJob = () => {
        Alert.alert(
            'Delete Job Posting',
            'Are you sure you want to permanently delete this job posting? This action cannot be undone and will delete all applicants.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await api.delete(`/jobs/${job._id}`);
                            if (res.data.success) {
                                Alert.alert('Deleted', 'Job posting has been successfully deleted.');
                                navigation.goBack();
                            }
                        } catch (error) {
                            console.error('Delete job error:', error);
                            Alert.alert('Error', 'Failed to delete job posting.');
                        }
                    }
                }
            ]
        );
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
        <>
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
                    <Text style={[styles.company, { color: COLORS.textSecondary }]}>
                        {companyName}
                        {job.recruiterId?.designation ? ` • ${job.recruiterId.designation}` : ''}
                    </Text>
                    {job.recruiterId?.name && companyName !== 'Confidential' ? (
                        <Text style={[styles.recruiterName, { color: COLORS.textTertiary, fontSize: 13, marginTop: 4, fontWeight: '600' }]}>
                            Hiring Contact: {job.recruiterId.name}
                        </Text>
                    ) : null}
                </Animated.View>

                <View style={styles.quickInfoRow}>
                    <TouchableOpacity 
                        style={[styles.infoCard, { backgroundColor: COLORS.surface }]}
                        activeOpacity={0.7}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                            setModalConfig({
                                visible: true,
                                title: 'Job Location',
                                value: job.location,
                                icon: 'location',
                                iconColor: COLORS.primary,
                                type: 'text',
                                salaryMin: null,
                                salaryMax: null,
                            });
                        }}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '18' }]}>
                            <Ionicons name="location" size={18} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.infoTitle, { color: COLORS.textTertiary }]}>Location</Text>
                        <Text 
                            style={[styles.infoValue, { color: COLORS.textPrimary, textAlign: 'center' }]}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.7}
                        >
                            {job.location}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.infoCard, { backgroundColor: COLORS.surface }]}
                        activeOpacity={0.7}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                            const salaryText = typeof job.salaryRange === 'string'
                                ? job.salaryRange
                                : ((job.salaryRange?.min && job.salaryRange?.max)
                                    ? `₹${Number(job.salaryRange.min).toLocaleString()} - ₹${Number(job.salaryRange.max).toLocaleString()}`
                                    : (job.salaryRange?.max ? `₹${Number(job.salaryRange.max).toLocaleString()}` : 'Competitive'));
                            setModalConfig({
                                visible: true,
                                title: 'Salary Package',
                                value: salaryText,
                                icon: 'wallet',
                                iconColor: COLORS.success,
                                type: typeof job.salaryRange === 'object' && (job.salaryRange?.max || job.salaryRange?.min) ? 'salary' : 'text',
                                salaryMin: job.salaryRange?.min || null,
                                salaryMax: job.salaryRange?.max || null,
                            });
                        }}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.success + '18' }]}>
                            <Ionicons name="wallet" size={18} color={COLORS.success} />
                        </View>
                        <Text style={[styles.infoTitle, { color: COLORS.textTertiary }]}>Salary</Text>
                        <Text 
                            style={[styles.infoValue, { color: COLORS.textPrimary, textAlign: 'center' }]}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.7}
                        >
                            {typeof job.salaryRange === 'string'
                                ? job.salaryRange
                                : (job.salaryRange ? 
                                    (job.salaryRange.min && job.salaryRange.max ? 
                                        `₹${formatSalaryShort(job.salaryRange.min)} - ₹${formatSalaryShort(job.salaryRange.max)}` : 
                                        (job.salaryRange.max ? `₹${formatSalaryShort(job.salaryRange.max)}` : 'Competitive')) 
                                    : 'Competitive')}
                        </Text>
                    </TouchableOpacity>
                    <View style={[styles.infoCard, { backgroundColor: COLORS.surface }]}>
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.warning + '18' }]}>
                            <Ionicons name="time" size={18} color={COLORS.warning} />
                        </View>
                        <Text style={[styles.infoTitle, { color: COLORS.textTertiary }]}>Type</Text>
                        <Text 
                            style={[styles.infoValue, { color: COLORS.textPrimary, textAlign: 'center' }]}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.7}
                        >
                            {job.type}
                        </Text>
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

                    {/* About the Company Section */}
                    {job.recruiterId?.companyName && job.recruiterId.companyName !== 'Confidential' ? (
                        <View style={{ marginTop: 30 }}>
                            <Text style={[styles.sectionHeading, { color: COLORS.textPrimary, marginTop: 0 }]}>About the Company</Text>
                            
                            {job.recruiterId.companyPhotos && job.recruiterId.companyPhotos.length > 0 ? (
                                <View style={styles.workspacePhotosContainer}>
                                    {job.recruiterId.companyPhotos.map((photo, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                setViewerImage(photo.url);
                                                setViewerVisible(true);
                                            }}
                                            style={[styles.workspacePhotoThumbWrapper, { borderColor: COLORS.border }]}
                                        >
                                            <Image 
                                                source={{ uri: photo.url }} 
                                                style={styles.workspacePhotoThumb} 
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : null}

                            <Text style={[styles.para, { color: COLORS.textSecondary, marginTop: 10 }]}>
                                {job.recruiterId.companyDescription || 'No company description provided.'}
                            </Text>

                            {job.recruiterId.website ? (
                                <TouchableOpacity 
                                    style={[styles.websiteBtn, { borderColor: COLORS.primary }]}
                                    activeOpacity={0.7}
                                    onPress={async () => {
                                        const url = job.recruiterId.website.startsWith('http') 
                                            ? job.recruiterId.website 
                                            : `https://${job.recruiterId.website}`;
                                        Linking.openURL(url).catch(err => {
                                            console.error("Failed to open URL:", err);
                                            Alert.alert('Error', 'Could not open the company website link.');
                                        });
                                    }}
                                >
                                    <Ionicons name="earth-outline" size={18} color={COLORS.primary} />
                                    <Text style={[styles.websiteBtnText, { color: COLORS.primary }]}>Visit Website</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    ) : null}
                </Animated.View>

                <View style={{ height: 180 }} />
            </ScrollView>

            {/* Sticky Footer */}
            <BlurView 
                intensity={Platform.OS === 'ios' ? 80 : 100} 
                tint={isDarkMode ? 'dark' : 'light'} 
                style={styles.footer}
            >
                {user?.role === 'RECRUITER' ? (
                    (job.recruiterId?._id === user._id || job.recruiterId === user._id) ? (
                        <View style={styles.recruiterActionsContainer}>
                            <PremiumButton 
                                title={`Manage Applicants (${job.applicantsCount || 0})`} 
                                onPress={() => navigation.navigate('JobApplicants', { jobId: job._id, jobTitle: job.title })}
                                style={{ marginBottom: 10 }}
                            />
                            <View style={styles.secondaryActionsRow}>
                                <TouchableOpacity 
                                    style={[styles.recruiterActionBtn, { borderColor: COLORS.primary }]}
                                    onPress={() => navigation.navigate('CreateJob', { job })}
                                >
                                    <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                                    <Text style={[styles.recruiterActionBtnText, { color: COLORS.primary }]}>Edit</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.recruiterActionBtn, { borderColor: job.status === 'CLOSED' ? COLORS.success : COLORS.warning }]}
                                    onPress={handleToggleStatus}
                                >
                                    <Ionicons 
                                        name={job.status === 'CLOSED' ? "checkmark-circle-outline" : "ban-outline"} 
                                        size={18} 
                                        color={job.status === 'CLOSED' ? COLORS.success : COLORS.warning} 
                                    />
                                    <Text style={[styles.recruiterActionBtnText, { color: job.status === 'CLOSED' ? COLORS.success : COLORS.warning }]}>
                                        {job.status === 'CLOSED' ? 'Reopen' : 'Close'}
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.recruiterActionBtn, { borderColor: COLORS.danger }]}
                                    onPress={handleDeleteJob}
                                >
                                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                                    <Text style={[styles.recruiterActionBtnText, { color: COLORS.danger }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.recruiterNotice}>
                            <Ionicons name="information-circle-outline" size={20} color={COLORS.textTertiary} />
                            <Text style={[styles.noticeText, { color: COLORS.textTertiary }]}>Viewing as Recruiter</Text>
                        </View>
                    )
                ) : (
                    <View style={{ flexDirection: 'row', gap: 12, width: '100%', alignItems: 'center' }}>
                        <TouchableOpacity
                            style={[
                                styles.recruiterActionBtn, 
                                { 
                                    borderColor: COLORS.primary,
                                    maxWidth: 54,
                                    height: 50,
                                    borderRadius: 14,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 0
                                }
                            ]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                if (job.recruiterId?._id) {
                                    navigation.navigate('ChatRoom', {
                                        otherUser: {
                                            _id: job.recruiterId._id,
                                            name: job.recruiterId.name || 'Recruiter',
                                            role: 'RECRUITER'
                                        }
                                    });
                                } else {
                                    Alert.alert('Unavailable', 'Recruiter chat is not available for this job.');
                                }
                            }}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.primary} />
                        </TouchableOpacity>

                        <View style={{ flex: 1 }}>
                            <PremiumButton 
                                title={job.status === 'CLOSED' ? 'Job Closed' : (hasApplied ? 'Application Sent' : (applying ? 'Processing...' : 'Apply Now'))} 
                                variant={job.status === 'CLOSED' || hasApplied ? 'secondary' : 'primary'}
                                disabled={job.status === 'CLOSED' || hasApplied || applying}
                                onPress={handleApply}
                                iconRight={hasApplied ? <Ionicons name="checkmark-circle" size={22} color="#FFF" /> : null}
                            />
                        </View>
                    </View>
                )}
            </BlurView>
        </ScreenWrapper>

        {/* ── Premium Detail Modal ── */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalConfig.visible}
            statusBarTranslucent={true}
            onRequestClose={() => setModalConfig(prev => ({ ...prev, visible: false }))}
        >
            <View style={styles.modalOverlay}>
                {/* Dimmed backdrop — tap to close */}
                <TouchableOpacity 
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1} 
                    onPress={() => setModalConfig(prev => ({ ...prev, visible: false }))}
                />

                {/* Bottom sheet card */}
                <View style={[styles.modalSheet, { backgroundColor: COLORS.surface }]}>

                    {/* ── Gradient hero banner ── */}
                    <View style={[styles.modalHeroBanner, { backgroundColor: modalConfig.iconColor + '18' }]}>
                        {/* Drag pill */}
                        <View style={[styles.modalDragPill, { backgroundColor: modalConfig.iconColor + '50' }]} />

                        {/* Large hero icon with coloured ring */}
                        <View style={[styles.modalHeroRing, {
                            borderColor: modalConfig.iconColor + '30',
                            backgroundColor: modalConfig.iconColor + '15'
                        }]}>
                            <View style={[styles.modalHeroIconInner, { backgroundColor: modalConfig.iconColor }]}>
                                <Ionicons name={modalConfig.icon} size={28} color="#FFF" />
                            </View>
                        </View>

                        {/* Title */}
                        <Text style={[styles.modalHeroTitle, { color: modalConfig.iconColor }]}>
                            {modalConfig.title}
                        </Text>
                    </View>

                    {/* ── Content area ── */}
                    <View style={styles.modalBody}>

                        {/* LOCATION — full scrollable text in a styled card */}
                        {modalConfig.type !== 'salary' && (
                            <View style={[styles.locationCard, {
                                backgroundColor: COLORS.background,
                                borderColor: COLORS.primary + '25'
                            }]}>
                                <Ionicons
                                    name="navigate-circle"
                                    size={20}
                                    color={COLORS.primary}
                                    style={{ marginTop: 2 }}
                                />
                                <Text style={[styles.locationCardText, { color: COLORS.textPrimary }]}>
                                    {modalConfig.value}
                                </Text>
                            </View>
                        )}

                        {/* SALARY — two beautiful chips */}
                        {modalConfig.type === 'salary' && (
                            <View style={styles.salaryChipsRow}>
                                {modalConfig.salaryMin ? (
                                    <View style={[styles.salaryChip, {
                                        backgroundColor: COLORS.success + '10',
                                        borderColor: COLORS.success + '35'
                                    }]}>
                                        <View style={[styles.salaryChipIcon, { backgroundColor: COLORS.success + '20' }]}>
                                            <Ionicons name="arrow-down-outline" size={16} color={COLORS.success} />
                                        </View>
                                        <View>
                                            <Text style={[styles.salaryChipLabel, { color: COLORS.textTertiary }]}>Minimum</Text>
                                            <Text style={[styles.salaryChipValue, { color: COLORS.success }]}>
                                                ₹{Number(modalConfig.salaryMin).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                ) : null}
                                {modalConfig.salaryMax ? (
                                    <View style={[styles.salaryChip, {
                                        backgroundColor: COLORS.primary + '10',
                                        borderColor: COLORS.primary + '35'
                                    }]}>
                                        <View style={[styles.salaryChipIcon, { backgroundColor: COLORS.primary + '20' }]}>
                                            <Ionicons name="arrow-up-outline" size={16} color={COLORS.primary} />
                                        </View>
                                        <View>
                                            <Text style={[styles.salaryChipLabel, { color: COLORS.textTertiary }]}>Maximum</Text>
                                            <Text style={[styles.salaryChipValue, { color: COLORS.primary }]}>
                                                ₹{Number(modalConfig.salaryMax).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                ) : null}
                                {/* Fallback for string salaries like "Competitive" */}
                                {!modalConfig.salaryMin && !modalConfig.salaryMax && (
                                    <View style={[styles.salaryChip, {
                                        flex: 1,
                                        backgroundColor: COLORS.warning + '10',
                                        borderColor: COLORS.warning + '35'
                                    }]}>
                                        <View style={[styles.salaryChipIcon, { backgroundColor: COLORS.warning + '20' }]}>
                                            <Ionicons name="cash-outline" size={16} color={COLORS.warning} />
                                        </View>
                                        <Text style={[styles.salaryChipValue, { color: COLORS.warning, fontSize: 18 }]}>
                                            {modalConfig.value}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Got it button */}
                        <TouchableOpacity
                            style={[styles.modalGotItBtn, { backgroundColor: modalConfig.iconColor }]}
                            onPress={() => setModalConfig(prev => ({ ...prev, visible: false }))}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.modalGotItText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

        {/* Full Screen Image Viewer Modal */}
        <Modal
            visible={viewerVisible}
            transparent={true}
            onRequestClose={() => setViewerVisible(false)}
            animationType="fade"
            statusBarTranslucent={true}
        >
            <View style={styles.viewerContainer}>
                <TouchableOpacity 
                    style={styles.viewerCloseBtn} 
                    onPress={() => setViewerVisible(false)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
                {viewerImage ? (
                    <Image 
                        source={{ uri: viewerImage }} 
                        style={styles.viewerImage} 
                        resizeMode="contain"
                    />
                ) : null}
            </View>
        </Modal>
        </>
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
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        ...SHADOWS.low,
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
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    modalContentCard: {
        width: '100%',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1.5,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        paddingHorizontal: 24,
        paddingTop: 0,
        alignItems: 'center',
        overflow: 'hidden',
        ...SHADOWS.high,
    },
    modalAccentBar: {
        width: '100%',
        height: 5,
        borderRadius: 3,
        marginBottom: 20,
        marginTop: 0,
    },
    modalIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    modalTitleText: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 6,
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    modalDivider: {
        width: '100%',
        height: 1,
        marginVertical: 14,
        borderRadius: 1,
        opacity: 0.6,
    },
    /* ── Modal styles ── */
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalSheet: {
        width: '100%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        ...SHADOWS.high,
    },
    modalHeroBanner: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    modalDragPill: {
        width: 40,
        height: 4,
        borderRadius: 2,
        marginBottom: 20,
    },
    modalHeroRing: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    modalHeroIconInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeroTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    },
    /* Location card */
    locationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        borderWidth: 1.5,
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
    },
    locationCardText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
    },
    /* Salary chips */
    salaryChipsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    salaryChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 18,
        borderWidth: 1.5,
        minWidth: 130,
    },
    salaryChipIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    salaryChipLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 3,
    },
    salaryChipValue: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    /* Got it button */
    modalGotItBtn: {
        width: '100%',
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    modalGotItText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    recruiterActionsContainer: {
        width: '100%',
    },
    secondaryActionsRow: {
        flexDirection: 'row',
        gap: 8,
        width: '100%',
    },
    recruiterActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 6,
    },
    recruiterActionBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    workspacePhotosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
        marginBottom: 8,
    },
    workspacePhotoThumbWrapper: {
        width: (width - 48 - 24) / 3, // Fits exactly 3 items on a row with 12px gaps
        aspectRatio: 1,
        borderRadius: 14,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    workspacePhotoThumb: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    viewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    viewerCloseBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 20,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    viewerImage: {
        width: '100%',
        height: '80%',
    },
    websiteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 8,
        marginTop: 16,
        width: '100%',
    },
    websiteBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
});

export default JobDetailsScreen;
