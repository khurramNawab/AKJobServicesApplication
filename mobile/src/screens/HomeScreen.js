import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    Alert,
    BackHandler,
    Dimensions,
    Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInRight,
    FadeInDown,
    Layout
} from 'react-native-reanimated';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import api from '../services/api';
import { getGreetingData } from '../utils/greetingHelper';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import PremiumJobCard from '../components/PremiumJobCard';
import SkeletonLoader from '../components/SkeletonLoader';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: '1', title: 'Design', icon: 'color-palette-outline' },
    { id: '2', title: 'Tech', icon: 'code-slash-outline' },
    { id: '3', title: 'Marketing', icon: 'megaphone-outline' },
    { id: '4', title: 'Finance', icon: 'wallet-outline' },
    { id: '5', title: 'Sales', icon: 'trending-up-outline' },
];

const HomeScreen = ({ navigation }) => {
    const user = useAuthStore((state) => state.user);
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [jobs, setJobs] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [candidate, setCandidate] = useState(null);
    const [recruiter, setRecruiter] = useState(null);
    const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);

    const avatarUri = user?.role === 'RECRUITER' ? recruiter?.companyLogo : candidate?.profilePhoto;
    const finalAvatarUri = avatarUri ? avatarUri.replace('http://', 'https://') : null;

    const filters = ['All', 'Full-time', 'Part-time', 'Remote', 'Internship'];

    const fetchData = async () => {
        try {
            if (!refreshing) setLoading(true);

            // Role-specific vertical data
            const isCandidate = user?.role === 'CANDIDATE';
            const isRecruiter = user?.role === 'RECRUITER';

            // Distinct default fetch for recruiters vs. candidates
            const baseEndpoint = isRecruiter ? '/jobs/me' : '/jobs';

            // Base requests (Index 0 is Jobs, Index 1 is Notifications)
            const requests = [
                api.get(baseEndpoint),
                api.get('/notifications')
            ];

            if (isCandidate) {
                requests.push(api.get('/saved-jobs/me'));
                requests.push(api.get('/candidates/me'));
            } else if (isRecruiter) {
                requests.push(api.get('/recruiters/me'));
            }

            // Use allSettled to prevent one failure from breaking everything
            const results = await Promise.allSettled(requests);

            // Process Jobs (Always index 0)
            const jobResult = results[0];
            if (jobResult.status === 'fulfilled' && jobResult.value.data.success) {
                setJobs(jobResult.value.data.data);
            } else if (jobResult.status === 'rejected') {
                console.error('Jobs Fetch Error:', jobResult.reason);
            }

            // Process Notifications (Always index 1)
            const notifResult = results[1];
            if (notifResult.status === 'fulfilled' && notifResult.value.data.success) {
                const hasUnread = notifResult.value.data.data.some(n => !n.isRead);
                setHasUnreadNotifs(hasUnread);
            } else if (notifResult.status === 'rejected') {
                console.error('Notifications Fetch Error:', notifResult.reason);
            }

            // Process Role-Specific Data (Shifted by +1)
            if (isCandidate && results.length >= 4) {
                const savedResult = results[2];
                const candidateResult = results[3];

                if (savedResult.status === 'fulfilled' && savedResult.value.data.success) {
                    const ids = new Set(savedResult.value.data.data.map(item => item.jobId?._id));
                    setSavedJobIds(ids);
                } else if (savedResult.status === 'rejected') {
                    console.error('Saved Jobs Fetch Error:', savedResult.reason);
                }

                if (candidateResult.status === 'fulfilled' && candidateResult.value.data.success) {
                    setCandidate(candidateResult.value.data.data);
                } else if (candidateResult.status === 'rejected') {
                    console.error('Candidate Profile Fetch Error:', candidateResult.reason);
                }
            } else if (isRecruiter && results[2]) {
                const recruiterResult = results[2];
                if (recruiterResult.status === 'fulfilled' && recruiterResult.value.data.success) {
                    setRecruiter(recruiterResult.value.data.data);
                } else if (recruiterResult.status === 'rejected') {
                    console.error('Recruiter Profile Fetch Error:', recruiterResult.reason);
                }
            }

        } catch (error) {
            console.error('Critical Home Fetch Error:', error);
        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleToggleSave = async (jobId) => {
        try {
            const res = await api.post(`/saved-jobs/toggle/${jobId}`);
            if (res.data.success) {
                setSavedJobIds(prev => {
                    const next = new Set(prev);
                    if (res.data.isSaved) next.add(jobId);
                    else next.delete(jobId);
                    return next;
                });
            }
        } catch (error) {
            console.error('Toggle save error:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();

            const onBackPress = () => {
                if (navigation.isFocused()) {
                    Alert.alert('Exit App', 'Are you sure you want to exit?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Exit', onPress: () => BackHandler.exitApp() }
                    ]);
                    return true;
                }
                return false;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [navigation])
    );

    const filteredJobs = useMemo(() => {
        let result = [...jobs];
        if (activeFilter !== 'All') {
            result = result.filter(j => j.type === activeFilter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(j => {
                const titleLower = j.title.toLowerCase();
                const companyLower = j.recruiterId?.companyName?.toLowerCase() || '';
                const categoryLower = j.category?.toLowerCase() || '';
                const skillsLower = (j.skills || []).map(s => s.toLowerCase());

                if (query === 'tech' || query === 'technology') {
                    // Tech category interest should match traditional tech terms, software, developer, dev, programming
                    return titleLower.includes('tech') || 
                           titleLower.includes('developer') || 
                           titleLower.includes('dev') ||
                           titleLower.includes('software') ||
                           titleLower.includes('programming') ||
                           companyLower.includes('tech') ||
                           categoryLower.includes('tech') ||
                           categoryLower.includes('developer') ||
                           categoryLower.includes('dev') ||
                           categoryLower.includes('software') ||
                           skillsLower.some(s => s.includes('tech') || s.includes('dev') || s.includes('software'));
                }

                // If they search specifically for developer/dev, it's also a tech query
                if (query === 'developer' || query === 'dev') {
                    return titleLower.includes('developer') || 
                           titleLower.includes('dev') || 
                           titleLower.includes('tech') ||
                           titleLower.includes('software') ||
                           categoryLower.includes('tech') ||
                           categoryLower.includes('developer') ||
                           categoryLower.includes('dev') ||
                           companyLower.includes('tech');
                }

                return titleLower.includes(query) || 
                       companyLower.includes(query) || 
                       categoryLower.includes(query);
            });
        }
        return result;
    }, [jobs, searchQuery, activeFilter]);

    const renderHeader = useMemo(() => (
        <View style={styles.headerContainer}>
            {/* Top Navigation Bar */}
            <View style={styles.topBar}>
                <View style={styles.userInfo}>
                    <View style={[styles.avatarFrame, { borderColor: COLORS.primary + '30' }]}>
                        <View style={[styles.avatar, { backgroundColor: COLORS.primary + '30' }]}>
                            {finalAvatarUri ? (
                                <Image
                                    source={{ uri: finalAvatarUri }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={[styles.avatarText, { color: COLORS.primary }]}>
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            )}
                        </View>
                    </View>
                    <Animated.View entering={FadeInDown.delay(200).duration(800)}>
                        <Text style={[styles.greeting, { color: COLORS.textTertiary }]}>
                            {getGreetingData(user?.name, user?.loginCount).main}
                        </Text>
                        <Text style={[styles.userName, { color: COLORS.textPrimary }]} numberOfLines={1}>
                            {getGreetingData(user?.name, user?.loginCount).sub}
                        </Text>
                    </Animated.View>
                </View>
                <TouchableOpacity
                    style={[styles.notifBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
                    {hasUnreadNotifs && <View style={styles.notifBadge} />}
                </TouchableOpacity>
            </View>

            {/* Interest Prompt */}
            {user?.role === 'CANDIDATE' && candidate && (!candidate.interests || candidate.interests.length === 0) && (
                <Animated.View entering={FadeInDown.delay(300)} style={styles.interestCard}>
                    <TouchableOpacity
                        style={[styles.interestInner, { backgroundColor: COLORS.primary }]}
                        onPress={() => navigation.navigate('InterestSelection', { fromOnboarding: false })}
                    >
                        <View style={styles.interestTxtContent}>
                            <Text style={styles.interestTitle}>Personalize Your Feed</Text>
                            <Text style={styles.interestSubtitle}>Choose your interests to see better job matches.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#FFF" />
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Search Section */}
            <Animated.View entering={FadeInDown.duration(600)} style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border }]}>
                    <Ionicons name="search" size={20} color={COLORS.textTertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: COLORS.textPrimary }]}
                        placeholder="Search for jobs or companies"
                        placeholderTextColor={COLORS.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={[styles.filterBtn, { backgroundColor: COLORS.primary }]}>
                        <Ionicons name="options" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Categories */}
            {user?.role === 'CANDIDATE' && (
                <>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Choose Interest</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('InterestSelection', { fromOnboarding: false })}>
                            <Text style={[styles.seeAll, { color: COLORS.primary }]}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryScroll}
                        style={{ marginBottom: 20 }}
                    >
                        {CATEGORIES.map((cat, index) => (
                            <Animated.View
                                key={cat.id}
                                entering={FadeInRight.delay(index * 100)}
                            >
                                <TouchableOpacity
                                    style={[styles.categoryCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setSearchQuery(cat.title);
                                    }}
                                >
                                    <View style={[styles.categoryIcon, { backgroundColor: COLORS.primary + '20' }]}>
                                        <Ionicons name={cat.icon} size={24} color={COLORS.primary} />
                                    </View>
                                    <Text style={[styles.categoryText, { color: COLORS.textSecondary }]}>{cat.title}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </>
            )}

            {/* Featured Job (Asymmetry) */}
            {!loading && jobs.length > 0 && !searchQuery && activeFilter === 'All' && (
                <View style={styles.featuredSection}>
                    <Text style={[styles.sectionTitle, { color: COLORS.textPrimary, marginLeft: SIZES.lg, marginBottom: 16 }]}>
                        Featured Opportunity
                    </Text>
                    <TouchableOpacity
                        style={[styles.featuredCard, { backgroundColor: COLORS.primary }]}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('JobDetails', { jobId: jobs[0]._id })}
                    >
                        <View style={styles.featuredHeader}>
                            <View style={styles.featuredLogoWrap}>
                                {jobs[0].recruiterId?.companyLogo ? (
                                    <Image
                                        source={{ uri: jobs[0].recruiterId.companyLogo.replace('http://', 'https://') + `?v=${Date.now()}` }}
                                        style={styles.featuredLogo}
                                    />
                                ) : (
                                    <Text style={styles.featuredLogoText}>
                                        {(jobs[0].recruiterId?.companyName || 'C').charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.featuredBadge}>
                                <Text style={styles.featuredBadgeText}>PROMOTED</Text>
                            </View>
                        </View>
                        <Text style={styles.featuredTitle}>{jobs[0].title}</Text>
                        <Text style={styles.featuredCompany}>{jobs[0].recruiterId?.companyName || 'Premium Company'}</Text>
                        <View style={styles.featuredFooter}>
                            <View style={styles.featuredInfo}>
                                <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.featuredInfoText}>{jobs[0].location}</Text>
                            </View>
                            <View style={styles.featuredPrice}>
                                <Text style={styles.featuredPriceText}>
                                    ₹{jobs[0].salaryRange?.max ? Number(jobs[0].salaryRange.max).toLocaleString() : 'Competitive'}/yr
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Filters */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {filters.map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setActiveFilter(f);
                            }}
                            style={[
                                styles.pill,
                                activeFilter === f
                                    ? { backgroundColor: COLORS.primary }
                                    : { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border, borderWidth: 1 }
                            ]}
                        >
                            <Text style={[
                                styles.pillText,
                                { color: activeFilter === f ? '#FFF' : COLORS.textSecondary }
                            ]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.listHeader}>
                <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Recent Opportunities</Text>
            </View>
        </View>
    ), [user, COLORS, searchQuery, activeFilter, navigation, candidate, recruiter, finalAvatarUri]);

    const renderEmpty = useCallback(() => (
        <View style={styles.emptyContainer}>
            {loading ? (
                Array(3).fill(0).map((_, i) => (
                    <View key={i} style={styles.skeletonWrap}>
                        <SkeletonLoader height={140} borderRadius={20} />
                    </View>
                ))
            ) : (
                <Animated.View
                    entering={FadeInDown}
                    style={styles.emptyContent}
                >
                    <Ionicons name="briefcase-outline" size={60} color={COLORS.textTertiary} />
                    <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No jobs found for this search.</Text>
                </Animated.View>
            )}
        </View>
    ), [loading, COLORS]);

    const renderItem = useCallback(({ item, index }) => (
        <View style={styles.cardPadding}>
            <PremiumJobCard
                index={index}
                job={item}
                isSaved={savedJobIds.has(item._id)}
                onToggleSave={() => handleToggleSave(item._id)}
                onPress={() => navigation.navigate('JobDetails', { jobId: item._id })}
            />
        </View>
    ), [navigation, savedJobIds]);

    const keyExtractor = useCallback((item) => item._id || Math.random().toString(), []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    return (
        <ScreenWrapper bottom={false}>
            <FlatList
                data={filteredJobs}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onRefresh={onRefresh}
                refreshing={refreshing}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingTop: SIZES.md,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.xl,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarFrame: {
        padding: 2,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '800',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    greeting: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
        maxWidth: width * 0.6,
    },
    notifBtn: {
        width: 46,
        height: 46,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    notifBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    interestCard: {
        paddingHorizontal: SIZES.lg,
        marginTop: SIZES.lg,
    },
    interestInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        ...SHADOWS.medium,
    },
    interestTxtContent: {
        flex: 1,
    },
    interestTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    interestSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    searchContainer: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.xl + 4,
        marginTop: SIZES.lg,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        borderRadius: 18,
        paddingLeft: 16,
        paddingRight: 6,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
    },
    filterBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '700',
    },
    categoryScroll: {
        paddingLeft: SIZES.lg,
        paddingRight: 8,
        gap: 12,
        marginBottom: SIZES.xl,
    },
    categoryCard: {
        width: 100,
        height: 110,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        ...SHADOWS.soft,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '700',
    },
    filterContainer: {
        marginBottom: SIZES.lg,
    },
    filterScroll: {
        paddingLeft: SIZES.lg,
        paddingRight: 8,
        gap: 10,
    },
    pill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '700',
    },
    listHeader: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.md,
    },
    listContent: {
        paddingBottom: 40,
    },
    cardPadding: {
        paddingHorizontal: SIZES.lg,
    },
    emptyContainer: {
        paddingHorizontal: SIZES.lg,
        marginTop: 20,
        alignItems: 'center',
    },
    skeletonWrap: {
        width: '100%',
        marginBottom: SIZES.md,
    },
    emptyContent: {
        alignItems: 'center',
        marginTop: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '600',
    },
    featuredSection: {
        marginBottom: SIZES.xl,
    },
    featuredCard: {
        marginHorizontal: SIZES.lg,
        padding: 20,
        borderRadius: 24,
        ...SHADOWS.premium,
    },
    featuredHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    featuredLogoWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    featuredLogo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    featuredLogoText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
    },
    featuredBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    featuredBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    featuredTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 4,
    },
    featuredCompany: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 20,
    },
    featuredFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    featuredInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featuredInfoText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    featuredPrice: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,1)',
    },
    featuredPriceText: {
        color: '#4F46E5',
        fontSize: 14,
        fontWeight: '800',
    }
});

export default HomeScreen;
