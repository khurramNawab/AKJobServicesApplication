import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    ActivityIndicator, 
    TouchableOpacity, 
    TextInput,
    StatusBar,
    ScrollView,
    Platform,
    Alert,
    BackHandler
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import api from '../services/api';
import JobCard from '../components/JobCard';
import { LinearGradient } from 'expo-linear-gradient';

import { useWindowDimensions } from 'react-native';

const HomeScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const isWideScreen = width > 768;
    const MAX_WIDTH = 600;

    const user = useAuthStore((state) => state.user);
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search and Filtering State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [preferences, setPreferences] = useState({ title: '', location: '' });

    const filters = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const resJobs = await api.get('/jobs');
            let fetchedJobs = resJobs.data.success ? resJobs.data.data : [];

            setJobs(fetchedJobs);

            let prefs = { title: '', location: '' };
            if (user?.role === 'CANDIDATE') {
                try {
                    const resProfile = await api.get('/candidates/me');
                    if (resProfile.data.success && resProfile.data.data) {
                        prefs = {
                            title: resProfile.data.data.preferredJobTitle || '',
                            location: resProfile.data.data.preferredLocation || ''
                        };
                        setPreferences(prefs);
                    }
                } catch (err) {
                    console.error('Failed to fetch candidate preferences', err);
                }
            }

            applyFilters(fetchedJobs, searchQuery, activeFilter, prefs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fix: Back Button Logic for Android & Exit prevention for Mac Web
    useFocusEffect(
        useCallback(() => {
            fetchData();
            
            const onBackPress = () => {
                if (Platform.OS === 'web') return false; // Ignore on Web/Mac
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

    const applyFilters = (baseJobs, search, filterType, currentPrefs) => {
        let result = baseJobs;

        if (currentPrefs.title || currentPrefs.location) {
            result = result.filter(job => {
                const titleMatch = currentPrefs.title ? job.title.toLowerCase().includes(currentPrefs.title.toLowerCase()) : true;
                const locMatch = currentPrefs.location ? job.location.toLowerCase().includes(currentPrefs.location.toLowerCase()) : true;
                return titleMatch && locMatch;
            });
        }

        if (filterType !== 'All') {
            result = result.filter(job => job.type === filterType);
        }

        if (search.trim() !== '') {
            result = result.filter(job =>
                job.title.toLowerCase().includes(search.toLowerCase()) ||
                job.location.toLowerCase().includes(search.toLowerCase()) ||
                job.recruiterId?.companyName?.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredJobs(result);
    };

    useEffect(() => {
        applyFilters(jobs, searchQuery, activeFilter, preferences);
    }, [searchQuery, activeFilter, jobs, preferences]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderHeader = () => (
        <View style={styles.headerSection}>
            <View style={styles.topBar}>
                <View>
                    <Text style={[styles.greetingText, { color: COLORS.textPrimary }]}>Hello, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
                    <Text style={[styles.welcomeText, { color: COLORS.textSecondary }]}>Find your next career move</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.notificationButton, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} 
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
                    <View style={[styles.notificationDot, { borderColor: COLORS.surface }]} />
                </TouchableOpacity>
            </View>

            <View style={[styles.searchBox, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: COLORS.textPrimary }]}
                    placeholder="Search jobs, companies..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity 
                    style={[styles.filterIconButton, { backgroundColor: COLORS.primary }]} 
                    activeOpacity={0.8}
                    onPress={() => Alert.alert("Filter", "Advanced search filters are being customized for your experience.")}
                >
                    <Ionicons name="options-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {filters.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.filterItem,
                                { backgroundColor: COLORS.surface, borderColor: COLORS.border },
                                activeFilter === item && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                            ]}
                            activeOpacity={0.8}
                            onPress={() => setActiveFilter(item)}
                        >
                            <Text style={[
                                styles.filterLabel,
                                { color: COLORS.textSecondary },
                                activeFilter === item && { color: '#FFFFFF' }
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <View style={[styles.container, isWideScreen && { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' }]}>
                <FlatList
                    data={filteredJobs}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={
                        <>
                            {renderHeader()}
                            {preferences.title || preferences.location ? (
                                <View style={styles.recommendationBanner}>
                                    <LinearGradient
                                        colors={[COLORS.primary + '15', COLORS.primaryLight + '05']}
                                        style={styles.recommendationGradient}
                                    >
                                        <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                                        <Text style={[styles.recommendationText, { color: COLORS.primary }]}>
                                            Tailored for your preferences
                                        </Text>
                                    </LinearGradient>
                                </View>
                            ) : null}
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Popular Jobs</Text>
                                <TouchableOpacity 
                                    activeOpacity={0.7}
                                    onPress={() => Alert.alert("Popular Jobs", "We are fetching all popular opportunities for you.")}
                                >
                                    <Text style={[styles.seeAllText, { color: COLORS.primary }]}>See all</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.cardWrapper}>
                            <JobCard
                                job={item}
                                onPress={() => navigation.navigate('JobDetails', { jobId: item._id })}
                            />
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyView}>
                            <View style={[styles.emptyIconBox, { backgroundColor: COLORS.surfaceSecondary }]}>
                                <Ionicons name="search-outline" size={40} color={COLORS.textTertiary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>No matching jobs</Text>
                            <Text style={[styles.emptySubtitle, { color: COLORS.textSecondary }]}>Try adjusting your filters or search terms</Text>
                        </View>
                    }
                />
            </View>
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
    headerSection: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.md,
        paddingBottom: SIZES.md,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.xl,
    },
    greetingText: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    welcomeText: {
        fontSize: 15,
        marginTop: 2,
        fontWeight: '600',
    },
    notificationButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    notificationDot: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 2,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        paddingLeft: 16,
        paddingRight: 8,
        height: 60,
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    filterIconButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterWrapper: {
        marginTop: SIZES.xl,
    },
    filterScroll: {
        gap: 12,
        paddingRight: SIZES.lg,
    },
    filterItem: {
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    recommendationBanner: {
        marginHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
        borderRadius: 16,
        overflow: 'hidden',
    },
    recommendationGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 10,
    },
    recommendationText: {
        fontWeight: '800',
        fontSize: 13,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        marginVertical: SIZES.md,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '800',
    },
    listContent: {
        paddingBottom: 40,
    },
    cardWrapper: {
        paddingHorizontal: SIZES.lg,
    },
    emptyView: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconBox: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    }
});

export default HomeScreen;

