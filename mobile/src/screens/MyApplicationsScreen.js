import React, { useState, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    ActivityIndicator, 
    TouchableOpacity, 
    TextInput,
    Image,
    Dimensions
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import PremiumButton from '../components/PremiumButton';
import EliteGradient from '../components/EliteGradient';
import SkeletonLoader from '../components/SkeletonLoader';
import PremiumTimeline from '../components/PremiumTimeline';

import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const ApplicationItem = React.memo(({ item, index, navigation, COLORS, getStatusConfig }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const config = getStatusConfig(item.status);
    const companyName = item.jobId?.recruiterId?.companyName || item.jobId?.recruiterId?.name || "Premium Company";
    
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsExpanded(!isExpanded);
    };

    return (
        <Animated.View 
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.cardContainer}
        >
            <TouchableOpacity 
                style={[
                    styles.appCard, 
                    { backgroundColor: COLORS.surface, borderColor: COLORS.border },
                    isExpanded && styles.appCardExpanded
                ]}
                activeOpacity={0.9}
                onPress={handlePress}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.logoWrapper, { backgroundColor: COLORS.backgroundSecondary }]}>
                        {item.jobId?.recruiterId?.companyLogo ? (
                            <Image source={{ uri: item.jobId.recruiterId.companyLogo }} style={styles.logo} />
                        ) : (
                            <View style={styles.logoPlaceholder}>
                                <Text style={[styles.logoTxt, { color: COLORS.primary }]}>{companyName.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.titleWrapper}>
                        <Text style={[styles.jobTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>{item.jobId?.title || 'Job Title'}</Text>
                        <Text style={[styles.companyName, { color: COLORS.textSecondary }]} numberOfLines={1}>{companyName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                        <Ionicons name={config.icon} size={12} color={config.color} />
                        <Text style={[styles.statusTxt, { color: config.color }]}>{config.text}</Text>
                    </View>
                </View>

                {isExpanded && (
                    <Animated.View 
                        entering={FadeInDown.duration(300)}
                        style={styles.expandedContent}
                    >
                        <View style={[styles.divider, { backgroundColor: COLORS.border }]} />
                        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Application Journey</Text>
                        <PremiumTimeline history={item.statusHistory} COLORS={COLORS} />
                        
                        <PremiumButton 
                            title="View Job Details" 
                            type="secondary"
                            onPress={() => navigation.navigate('JobDetails', { jobId: item.jobId?._id })}
                            style={styles.detailBtn}
                        />
                    </Animated.View>
                )}

                <View style={[styles.cardFooter, { borderTopColor: COLORS.border + '50' }]}>
                    <View style={styles.footerItem}>
                        <Ionicons name="location-outline" size={14} color={COLORS.textTertiary} />
                        <Text style={[styles.footerTxt, { color: COLORS.textSecondary }]}>{item.jobId?.location || 'Remote'}</Text>
                    </View>
                    <View style={styles.rightFooter}>
                        <Text style={[styles.footerTxt, { color: COLORS.textTertiary }]}>
                            {isExpanded ? 'Tap to close' : 'Tap to see progress'}
                        </Text>
                        <Ionicons 
                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                            size={14} 
                            color={COLORS.textTertiary} 
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

const MyApplicationsScreen = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchApplications = async () => {
        try {
            if (!refreshing) setLoading(true);
            const res = await api.get('/applications/me');
            if (res.data.success) {
                setApplications(res.data.data);
            }
        } catch (error) {
            console.error('Fetch applications error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchApplications();
        }, [])
    );

    const getStatusConfig = useCallback((status) => {
        switch (status) {
            case 'APPLIED': return { color: COLORS.primary, bg: COLORS.primary + '20', text: 'Submitted', icon: 'send-outline' };
            case 'REVIEWING': return { color: COLORS.warning, bg: COLORS.warning + '20', text: 'Reviewing', icon: 'eye-outline' };
            case 'SHORTLISTED': return { color: COLORS.success, bg: COLORS.success + '20', text: 'Shortlisted', icon: 'star-outline' };
            case 'REJECTED': return { color: COLORS.danger, bg: COLORS.danger + '15', text: 'Not Selected', icon: 'close-circle-outline' };
            case 'HIRED': return { color: COLORS.success, bg: COLORS.success + '25', text: 'Hired!', icon: 'ribbon-outline' };
            default: return { color: COLORS.textTertiary, bg: COLORS.backgroundSecondary, text: status, icon: 'help-circle-outline' };
        }
    }, [COLORS]);

    const filteredApplications = useMemo(() => {
        if (!searchQuery) return applications;
        return applications.filter(app => 
            app.jobId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.jobId?.recruiterId?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [applications, searchQuery]);

    const renderItem = useCallback(({ item, index }) => {
        if (loading) {
            return (
                <View style={styles.skeletonWrap}>
                    <SkeletonLoader height={110} borderRadius={24} />
                </View>
            );
        }
        return (
            <ApplicationItem 
                item={item} 
                index={index} 
                navigation={navigation} 
                COLORS={COLORS} 
                getStatusConfig={getStatusConfig} 
            />
        );
    }, [loading, navigation, COLORS, getStatusConfig]);

    const keyExtractor = useCallback((item, index) => item?._id || index.toString(), []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchApplications();
    }, []);

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                {navigation.canGoBack() && (
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        style={[styles.headerBtn, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border, marginRight: 16 }]}
                    >
                        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                )}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>Applications</Text>
                    <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>
                        You have applied to {applications.length} jobs
                    </Text>
                </View>
                <TouchableOpacity style={[styles.statBtn, { backgroundColor: COLORS.primary + '10' }]}>
                    <Ionicons name="analytics" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={[styles.searchBox, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border }]}>
                <Ionicons name="search" size={20} color={COLORS.textTertiary} />
                <TextInput 
                    style={[styles.searchInput, { color: COLORS.textPrimary }]}
                    placeholder="Search your applications"
                    placeholderTextColor={COLORS.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    );

    return (
        <ScreenWrapper bottom={false}>
            <FlatList
                data={loading ? Array(5).fill(0) : filteredApplications}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onRefresh={onRefresh}
                refreshing={refreshing}
                initialNumToRender={6}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={false}
                ListEmptyComponent={
                    !loading && (
                        <Animated.View entering={FadeInDown} style={styles.emptyContainer}>
                            <View style={[styles.emptyIcon, { backgroundColor: COLORS.surfaceSecondary }]}>
                                <Ionicons name="briefcase-outline" size={60} color={COLORS.textTertiary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>No applications found</Text>
                            <Text style={[styles.emptySubtitle, { color: COLORS.textSecondary }]}>
                                Explore our latest job opportunities and start applying today!
                            </Text>
                            <PremiumButton 
                                title="Explore Jobs" 
                                onPress={() => navigation.navigate('Home')}
                                style={styles.exploreBtn}
                            />
                        </Animated.View>
                    )
                }
            />
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
        marginBottom: SIZES.xl,
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
    statBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 40,
    },
    cardContainer: {
        paddingHorizontal: SIZES.lg,
        marginBottom: 14,
    },
    appCard: {
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    logoPlaceholder: {
        fontSize: 18,
        fontWeight: '800',
    },
    titleWrapper: {
        flex: 1,
        marginLeft: 14,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    companyName: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    statusTxt: {
        fontSize: 11,
        fontWeight: '800',
    },
    cardFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        marginTop: 14,
        paddingTop: 14,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rightFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    appCardExpanded: {
        ...SHADOWS.medium,
        borderColor: 'transparent',
    },
    expandedContent: {
        marginTop: 12,
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 16,
        opacity: 0.5,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    detailBtn: {
        marginTop: 16,
        height: 48,
        borderRadius: 14,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerTxt: {
        fontSize: 12,
        fontWeight: '600',
    },
    skeletonWrap: {
        paddingHorizontal: SIZES.lg,
        marginBottom: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 40,
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
        marginBottom: 8,
        letterSpacing: -0.5,
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

export default MyApplicationsScreen;
