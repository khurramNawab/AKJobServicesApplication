import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Alert,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout, ZoomIn, ZoomOut } from 'react-native-reanimated';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import PremiumButton from '../components/PremiumButton';
import EliteGradient from '../components/EliteGradient';
import SkeletonLoader from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');

const RecruiterJobItem = React.memo(({ item, index, navigation, COLORS }) => (
    <Animated.View 
        entering={FadeInDown.delay(index * 100).springify()}
        layout={Layout.springify()}
        style={styles.cardPadding}
    >
        <TouchableOpacity
            style={[styles.jobCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('JobApplicants', { jobId: item._id, jobTitle: item.title })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.titleArea}>
                    <Text style={[styles.jobTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.metaRow}>
                        <TouchableOpacity 
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                            activeOpacity={0.7}
                            onPress={() => Alert.alert('Job Location', item.location)}
                        >
                            <Ionicons name="location-outline" size={14} color={COLORS.textTertiary} />
                            <Text style={[styles.metaText, { color: COLORS.textTertiary }]}>{item.location}</Text>
                        </TouchableOpacity>
                        <View style={[styles.dot, { backgroundColor: COLORS.border }]} />
                        <Text style={[styles.metaText, { color: COLORS.textTertiary }]}>{item.type}</Text>
                    </View>
                </View>
                <View style={[styles.applicantsBadge, { backgroundColor: COLORS.primary + '10' }]}>
                    <Text style={[styles.applicantCount, { color: COLORS.primary }]}>{item.applicantsCount || 0}</Text>
                    <Text style={[styles.applicantLabel, { color: COLORS.primary }]}>Apps</Text>
                </View>
            </View>

            <View style={[styles.cardDivider, { backgroundColor: COLORS.border + '50' }]} />

            <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textTertiary} />
                    <Text style={[styles.footerText, { color: COLORS.textSecondary }]}>
                        Posted {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
                <View style={styles.actionBtn}>
                    <Text style={[styles.actionText, { color: COLORS.primary }]}>View Candidates</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                </View>
            </View>
        </TouchableOpacity>
    </Animated.View>
));

const RecruiterJobsScreen = ({ navigation }) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    const fetchMyJobs = async (isSilent = false) => {
        try {
            if (!isSilent && !hasLoadedOnce) setLoading(true);
            const res = await api.get('/jobs/me');
            if (res.data.success) {
                setJobs(res.data.data);
            }
        } catch (error) {
            console.error('Fetch my jobs error:', error);
            Alert.alert('Network Error', 'Could not load your job postings.');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setHasLoadedOnce(true);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchMyJobs(hasLoadedOnce);
        });
        return unsubscribe;
    }, [navigation, hasLoadedOnce]);

    const renderItem = useCallback(({ item, index }) => {
        if (loading) {
            return (
                <View style={styles.skeletonPadding}>
                    <SkeletonLoader height={140} borderRadius={24} />
                </View>
            );
        }
        return (
            <RecruiterJobItem 
                item={item} 
                index={index} 
                navigation={navigation} 
                COLORS={COLORS} 
            />
        );
    }, [loading, navigation, COLORS]);

    const keyExtractor = useCallback((item, index) => item?._id || index.toString(), []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMyJobs();
    }, []);

    const renderHeader = useMemo(() => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>Hiring Dashboard</Text>
                    <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>
                        You have {jobs.length} active postings
                    </Text>
                </View>
                <TouchableOpacity 
                    style={[styles.headerIcon, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                    onPress={() => navigation.navigate('ChatList')}
                >
                    <Ionicons name="chatbubbles-outline" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    ), [jobs.length, COLORS, navigation]);

    return (
        <ScreenWrapper bottom={false}>
            <FlatList
                data={loading ? Array(4).fill(0) : jobs}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onRefresh={onRefresh}
                refreshing={refreshing}
                initialNumToRender={5}
                maxToRenderPerBatch={8}
                windowSize={10}
                ListEmptyComponent={
                    !loading && (
                        <Animated.View entering={FadeInDown} style={styles.emptyContainer}>
                            <View style={[styles.emptyIcon, { backgroundColor: COLORS.surfaceSecondary }]}>
                                <Ionicons name="rocket-outline" size={60} color={COLORS.primary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>Ready to hire?</Text>
                            <Text style={[styles.emptySubtitle, { color: COLORS.textSecondary }]}>
                                Post your first job and find the perfect talent for your professional team.
                            </Text>
                            <PremiumButton 
                                title="Post a New Job" 
                                onPress={() => navigation.navigate('CreateJob')}
                                style={styles.postBtn}
                            />
                        </Animated.View>
                    )
                }
            />

            {!loading && jobs.length > 0 && (
                <Animated.View 
                    entering={ZoomIn.duration(300)} 
                    exiting={ZoomOut.duration(300)} 
                    style={styles.fabWrapper}
                >
                    <TouchableOpacity 
                        style={[styles.fab, SHADOWS.medium]} 
                        onPress={() => navigation.navigate('CreateJob')}
                        activeOpacity={0.9}
                    >
                        <EliteGradient style={styles.fabGradient}>
                            <Ionicons name="add" size={32} color="#FFF" />
                        </EliteGradient>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.md,
        paddingBottom: SIZES.xl,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    listContent: {
        paddingBottom: 120,
    },
    cardPadding: {
        paddingHorizontal: SIZES.lg,
        marginBottom: 16,
    },
    jobCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    titleArea: {
        flex: 1,
        marginRight: 10,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '600',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    applicantsBadge: {
        width: 54,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applicantCount: {
        fontSize: 18,
        fontWeight: '800',
    },
    applicantLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardDivider: {
        height: 1,
        width: '100%',
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '800',
    },
    skeletonPadding: {
        paddingHorizontal: SIZES.lg,
        marginBottom: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 40,
    },
    emptyIcon: {
        width: 110,
        height: 110,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
        marginBottom: 32,
    },
    postBtn: {
        width: '100%',
    },
    fabWrapper: {
        position: 'absolute',
        bottom: 30,
        right: 24,
    },
    fab: {
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

export default RecruiterJobsScreen;
