import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    ActivityIndicator, 
    TouchableOpacity, 
    Alert, 
    Linking,
    ScrollView,
    Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import ModernButton from '../components/ModernButton';
import ScreenWrapper from '../components/ScreenWrapper';

const JobApplicantsScreen = ({ route, navigation }) => {
    const { jobId, jobTitle } = route.params;
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = async () => {
        try {
            const res = await api.get(`/applications/job/${jobId}`);
            if (res.data.success) {
                setApplicants(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching applicants:', error);
            Alert.alert('Network Error', 'Failed to load applicants. Please pull to refresh.');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (applicationId, newStatus) => {
        try {
            const res = await api.put(`/applications/${applicationId}/status`, { status: newStatus });
            if (res.data.success) {
                Alert.alert('Status Updated', `Candidate is now marked as ${newStatus}`);
                fetchApplicants();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Update Failed', 'Could not change candidate status.');
        }
    };

    const showStatusOptions = (applicant) => {
        Alert.alert(
            'Change Status',
            `Update status for ${applicant.candidateId?.name}`,
            [
                { text: 'Under Review', onPress: () => updateStatus(applicant._id, 'REVIEWING') },
                { text: 'Shortlist', onPress: () => updateStatus(applicant._id, 'SHORTLISTED') },
                { text: 'Reject', onPress: () => updateStatus(applicant._id, 'REJECTED'), style: 'destructive' },
                { text: 'Hired', onPress: () => updateStatus(applicant._id, 'HIRED') },
                { text: 'Cancel', style: 'cancel' }
            ],
            { cancelable: true }
        );
    };

    const handleViewResume = (item) => {
        const resumeUrl = item.profile?.resumeUrl;
        if (resumeUrl) {
            navigation.navigate('ResumeViewer', { 
                resumeUrl: resumeUrl,
                title: `${item.candidateId?.name}'s Resume` 
            });
        } else {
            Alert.alert("Resume Not Found", "This candidate hasn't uploaded their resume yet.");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPLIED': return { color: COLORS.primary, bg: COLORS.primary + '15', label: 'New' };
            case 'REVIEWING': return { color: COLORS.secondary, bg: COLORS.secondary + '15', label: 'Reviewing' };
            case 'SHORTLISTED': return { color: '#059669', bg: '#D1FAE5', label: 'Shortlisted' };
            case 'REJECTED': return { color: COLORS.danger, bg: COLORS.danger + '15', label: 'Rejected' };
            case 'HIRED': return { color: '#10B981', bg: '#D1FAE5', label: 'Hired' };
            default: return { color: COLORS.textTertiary, bg: COLORS.surface, label: status };
        }
    };

    const renderItem = ({ item }) => {
        const status = getStatusStyle(item.status);
        const name = item.candidateId?.name || 'Unknown Candidate';
        const initial = name.charAt(0).toUpperCase();

        return (
            <View style={[styles.applicantCard, SHADOWS.soft, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.avatarBox, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '20' }]}>
                        {item.candidateId?.avatar ? (
                            <Image source={{ uri: item.candidateId.avatar }} style={styles.avatarImg} />
                        ) : (
                            <Text style={[styles.avatarText, { color: COLORS.primary }]}>{initial}</Text>
                        )}
                    </View>
                    <View style={styles.basicInfo}>
                        <Text style={[styles.candidateName, { color: COLORS.textPrimary }]} numberOfLines={1}>{name}</Text>
                        <Text style={[styles.candidateEmail, { color: COLORS.textTertiary }]} numberOfLines={1}>{item.candidateId?.email}</Text>
                        <View style={styles.badgeRow}>
                            <View style={[styles.statusTag, { backgroundColor: status.bg }]}>
                                <Text style={[styles.statusTagText, { color: status.color }]}>{status.label}</Text>
                            </View>
                            <TouchableOpacity onPress={() => showStatusOptions(item)} style={styles.editStatusBtn}>
                                <Ionicons name="ellipsis-horizontal" size={16} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {item.profile?.headline && (
                    <Text style={[styles.headlineText, { color: COLORS.textSecondary }]} numberOfLines={2}>{item.profile.headline}</Text>
                )}

                {item.profile?.skills && item.profile.skills.length > 0 && (
                    <View style={styles.skillsWrapper}>
                        {item.profile.skills.slice(0, 3).map((skill, index) => (
                            <View key={index} style={[styles.skillChip, { backgroundColor: COLORS.background }]}>
                                <Text style={[styles.skillChipText, { color: COLORS.textSecondary }]}>{skill}</Text>
                            </View>
                        ))}
                        {item.profile.skills.length > 3 && (
                            <Text style={[styles.moreSkillsText, { color: COLORS.textTertiary }]}>+{item.profile.skills.length - 3} more</Text>
                        )}
                    </View>
                )}

                {item.coverLetter && (
                    <View style={[styles.coverLetterBox, { backgroundColor: COLORS.background + '50', borderColor: COLORS.border }]}>
                        <Text style={[styles.clLabel, { color: COLORS.textTertiary }]}>Introduction</Text>
                        <Text style={[styles.clText, { color: COLORS.textPrimary }]} numberOfLines={2}>{item.coverLetter}</Text>
                    </View>
                )}

                <View style={styles.cardActions}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, { borderColor: COLORS.primary }]} 
                        onPress={() => handleViewResume(item)}
                    >
                        <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
                        <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Resume</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                        onPress={() => navigation.navigate('ChatRoom', {
                            otherUser: item.candidateId,
                            conversationId: null
                        })}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.white} />
                        <Text style={[styles.actionBtnText, { color: COLORS.white }]}>Message</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ScreenWrapper>
            <View style={[styles.navigatorHeader, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
                <TouchableOpacity 
                    style={[styles.backBtn, { backgroundColor: COLORS.background }]} 
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleBox}>
                    <Text style={[styles.screenTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>{jobTitle}</Text>
                    <Text style={[styles.screenSubtitle, { color: COLORS.textSecondary }]}>View and Manage Applicants</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={applicants}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyView}>
                            <View style={[styles.emptyIconCircle, { backgroundColor: COLORS.surface }]}>
                                <Ionicons name="people-outline" size={50} color={COLORS.textTertiary} />
                            </View>
                            <Text style={[styles.emptyHeading, { color: COLORS.textPrimary }]}>No Applicants Yet</Text>
                            <Text style={[styles.emptySub, { color: COLORS.textSecondary }]}>When candidates apply for this position, they will appear here.</Text>
                        </View>
                    }
                />
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navigatorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleBox: {
        flex: 1,
        alignItems: 'center',
    },
    screenTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    screenSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    listContainer: {
        paddingHorizontal: SIZES.lg,
        paddingTop: 20,
        paddingBottom: 40,
    },
    applicantCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '800',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },
    basicInfo: {
        flex: 1,
        marginLeft: 14,
    },
    candidateName: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.4,
    },
    candidateEmail: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusTagText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    editStatusBtn: {
        padding: 4,
    },
    headlineText: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        marginBottom: 12,
    },
    skillsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    skillChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    skillChipText: {
        fontSize: 11,
        fontWeight: '600',
    },
    moreSkillsText: {
        fontSize: 11,
        fontWeight: '600',
    },
    coverLetterBox: {
        borderRadius: 16,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
    },
    clLabel: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    clText: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 14,
        gap: 8,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
    centerBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyView: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyHeading: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 10,
    },
    emptySub: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    }
});

export default JobApplicantsScreen;
