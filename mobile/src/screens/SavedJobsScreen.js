import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SIZES, TYPOGRAPHY } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import PremiumJobCard from '../components/PremiumJobCard';
import SkeletonLoader from '../components/SkeletonLoader';
import PremiumButton from '../components/PremiumButton';

const SavedJobsScreen = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSavedJobs = async () => {
        try {
            if (!refreshing) setLoading(true);
            const res = await api.get('/saved-jobs/me');
            if (res.data.success) {
                // Filter out any bookmarked jobs that might have been deleted from the DB
                const validSavedJobs = (res.data.data || []).filter(item => item && item.jobId);
                setSavedJobs(validSavedJobs);
            }
        } catch (error) {
            console.error('Fetch saved jobs error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSavedJobs();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchSavedJobs();
    };

    const handleToggleSave = async (jobId) => {
        try {
            const res = await api.post(`/saved-jobs/toggle/${jobId}`);
            if (res.data.success && !res.data.isSaved) {
                // If removed, filter out from list
                setSavedJobs(prev => prev.filter(item => item.jobId?._id !== jobId));
            }
        } catch (error) {
            console.error('Toggle save error:', error);
        }
    };

    const renderHeader = () => (
        <View style={[styles.header, { borderBottomColor: COLORS.border, borderBottomWidth: 1 }]}>
            <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={[styles.headerBtn, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border }]}
            >
                <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerTitleArea}>
                <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>Saved Jobs</Text>
            </View>
            <View style={{ width: 48 }} /> 
        </View>
    );

    const renderItem = ({ item, index }) => (
        <PremiumJobCard 
            job={item.jobId} 
            index={index}
            isSaved={true}
            onToggleSave={() => handleToggleSave(item.jobId?._id)}
            onPress={() => navigation.navigate('JobDetails', { jobId: item.jobId?._id })}
        />
    );

    if (loading && !refreshing) {
        return (
            <ScreenWrapper>
                {renderHeader()}
                <View style={styles.listPadding}>
                    {[1, 2, 3, 4].map(i => (
                        <View key={i} style={styles.skeletonSpace}>
                            <SkeletonLoader height={140} borderRadius={24} />
                        </View>
                    ))}
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bottom={false}>
            {renderHeader()}
            <FlatList
                data={savedJobs}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <Animated.View entering={FadeInDown} style={styles.emptyContainer}>
                        <View style={[styles.emptyIcon, { backgroundColor: COLORS.primary + '10' }]}>
                            <Ionicons name="heart-outline" size={60} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>Your wishlist is empty</Text>
                        <Text style={[styles.emptySubtitle, { color: COLORS.textSecondary }]}>
                            Save jobs you're interested in and come back to them later.
                        </Text>
                        <PremiumButton 
                            title="Explore Jobs" 
                            onPress={() => navigation.navigate('Home')}
                            style={styles.exploreBtn}
                        />
                    </Animated.View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    headerTitleArea: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.md,
        paddingBottom: 40,
    },
    listPadding: {
        paddingHorizontal: SIZES.lg,
    },
    skeletonSpace: {
        marginBottom: SIZES.md,
    },
    emptyContainer: {
        marginTop: 80,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
        marginBottom: 32,
    },
    exploreBtn: {
        width: '100%',
    }
});

export default SavedJobsScreen;
