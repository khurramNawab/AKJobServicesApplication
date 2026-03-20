import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    ActivityIndicator, 
    TouchableOpacity, 
    Alert, 
    SafeAreaView,
    StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import ModernButton from '../components/ModernButton';

const getStyles = (COLORS, SIZES) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    notificationBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    dot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        borderWidth: 2,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 100,
        paddingTop: 10,
    },
    jobCard: {
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardTop: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'flex-start',
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 6,
    },
    locationText: {
        fontSize: 13,
        fontWeight: '600',
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    cardStats: {
        flexDirection: 'row',
        marginHorizontal: 20,
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 15,
        fontWeight: '800',
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: COLORS.border,
    },
    cardAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyIconBox: {
        width: 100,
        height: 100,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 10,
    },
    emptyDesc: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
        marginBottom: 30,
    },
    emptyBtn: {
        width: '100%',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 22,
        overflow: 'hidden',
    },
    fabGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

const RecruiterJobsScreen = ({ navigation }) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
    const styles = getStyles(COLORS, SIZES);

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchMyJobs();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchMyJobs = async () => {
        try {
            const res = await api.get('/jobs/me');
            if (res.data.success) {
                setJobs(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            Alert.alert('Network Error', 'Could not load your job postings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.jobCard, SHADOWS.soft, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('JobApplicants', { jobId: item._id, jobTitle: item.title })}
        >
            <View style={styles.cardTop}>
                <View style={styles.jobInfo}>
                    <Text style={[styles.jobTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={14} color={COLORS.textTertiary} />
                        <Text style={[styles.locationText, { color: COLORS.textTertiary }]}>{item.location}</Text>
                    </View>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: COLORS.secondary + '15' }]}>
                    <Text style={[styles.typeBadgeText, { color: COLORS.secondary }]}>{item.type}</Text>
                </View>
            </View>
            
            <View style={[styles.cardStats, { backgroundColor: COLORS.background + '50', borderColor: COLORS.border }]}>
                <View style={styles.statBox}>
                    <Text style={[styles.statLabel, { color: COLORS.textTertiary }]}>Applicants</Text>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{item.applicantsCount || 0}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={[styles.statLabel, { color: COLORS.textTertiary }]}>Posted On</Text>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>

            <View style={styles.cardAction}>
                <Text style={styles.actionText}>View Applicants</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>My Job Postings</Text>
                        <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>Manage your active opportunities</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.notificationBtn, SHADOWS.soft, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                        onPress={() => navigation.navigate('ChatList')}
                    >
                        <Ionicons name="chatbubbles-outline" size={22} color={COLORS.textPrimary} />
                        {jobs.reduce((acc, job) => acc + (job.applicantsCount || 0), 0) > 0 && (
                            <View style={[styles.dot, { borderColor: COLORS.surface }]} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconBox, { backgroundColor: COLORS.surface }]}>
                                <Ionicons name="briefcase-outline" size={60} color={COLORS.textTertiary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>No Job Postings</Text>
                            <Text style={[styles.emptyDesc, { color: COLORS.textSecondary }]}>
                                You haven't posted any jobs yet. Start hiring by creating your first job posting today.
                            </Text>
                            <ModernButton 
                                title="Create First Posting"
                                onPress={() => navigation.navigate('CreateJob')}
                                style={styles.emptyBtn}
                            />
                        </View>
                    }
                />
            )}

            <TouchableOpacity 
                style={[styles.fab, SHADOWS.medium]} 
                onPress={() => navigation.navigate('CreateJob')}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryLight]}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={32} color={COLORS.white} />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
};


export default RecruiterJobsScreen;

