import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    RefreshControl,
    Dimensions
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import * as Haptics from 'expo-haptics';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import SkeletonLoader from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');

const TalentDirectoryScreen = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCandidates = async () => {
        try {
            if (!refreshing) setLoading(true);
            const res = await api.get('/candidates');
            if (res.data.success) {
                // Filter out any candidates that don't have valid user credentials associated
                const validCandidates = (res.data.data || []).filter(c => c && c.userId);
                setCandidates(validCandidates);
            }
        } catch (error) {
            console.error('Fetch candidates error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCandidates();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchCandidates();
    };

    const filteredCandidates = useMemo(() => {
        if (!searchQuery.trim()) return candidates;
        const query = searchQuery.toLowerCase();
        return candidates.filter(c => {
            const name = c.userId?.name?.toLowerCase() || '';
            const email = c.userId?.email?.toLowerCase() || '';
            const bio = c.bio?.toLowerCase() || '';
            const skills = (c.skills || []).map(s => s.toLowerCase());
            const title = c.title?.toLowerCase() || '';

            return name.includes(query) ||
                email.includes(query) ||
                bio.includes(query) ||
                title.includes(query) ||
                skills.some(s => s.includes(query));
        });
    }, [candidates, searchQuery]);

    const handleMessageCandidate = (candidate) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('ChatRoom', {
            otherUser: {
                _id: candidate.userId?._id,
                name: candidate.userId?.name || 'Candidate',
                role: 'CANDIDATE'
            }
        });
    };

    const handleViewResume = (candidate) => {
        if (!candidate.resumeUrl) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('ResumeViewer', {
            resumeUrl: candidate.resumeUrl,
            title: `${candidate.userId?.name || 'Candidate'}'s Resume`
        });
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTextContainer}>
                <Text style={[styles.title, { color: COLORS.textPrimary }]}>Find Talents</Text>
                <Text style={[styles.subtitle, { color: COLORS.textTertiary }]}>
                    Discover top candidates for your active openings
                </Text>
            </View>

            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border }]}>
                <Ionicons name="search" size={20} color={COLORS.textTertiary} />
                <TextInput
                    style={[styles.searchInput, { color: COLORS.textPrimary }]}
                    placeholder="Search by name, skill, or role"
                    placeholderTextColor={COLORS.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} style={{ marginRight: 8 }} />
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );

    const renderItem = ({ item: candidate, index }) => {
        const name = candidate.userId?.name || 'Anonymous Talent';
        const title = candidate.title || 'Professional Candidate';
        const bio = candidate.bio || 'No bio provided.';
        const photoUrl = candidate.profilePhoto ? candidate.profilePhoto.replace('http://', 'https://') : null;
        const skills = candidate.skills || [];

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 80).springify()}
                style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
            >
                {/* Candidate Info Header */}
                <View style={styles.cardHeader}>
                    <View style={[styles.avatarWrapper, { backgroundColor: COLORS.primary + '15' }]}>
                        {photoUrl ? (
                            <Image source={{ uri: photoUrl }} style={styles.avatar} />
                        ) : (
                            <Text style={[styles.avatarText, { color: COLORS.primary }]}>
                                {name.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>

                    <View style={styles.infoArea}>
                        <Text style={[styles.candidateName, { color: COLORS.textPrimary }]} numberOfLines={1}>
                            {name}
                        </Text>
                        <Text style={[styles.candidateTitle, { color: COLORS.primary }]} numberOfLines={1}>
                            {title}
                        </Text>
                    </View>
                </View>

                {/* Bio */}
                <Text style={[styles.candidateBio, { color: COLORS.textSecondary }]} numberOfLines={2}>
                    {bio}
                </Text>

                {/* Skills Pills */}
                {skills.length > 0 ? (
                    <View style={styles.skillsContainer}>
                        {skills.slice(0, 4).map((skill, sIdx) => (
                            <View key={sIdx} style={[styles.skillPill, { backgroundColor: COLORS.backgroundSecondary, borderColor: COLORS.border }]}>
                                <Text style={[styles.skillText, { color: COLORS.textSecondary }]}>{skill}</Text>
                            </View>
                        ))}
                        {skills.length > 4 ? (
                            <View style={[styles.skillPill, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' }]}>
                                <Text style={[styles.skillText, { color: COLORS.primary }]}>+{skills.length - 4}</Text>
                            </View>
                        ) : null}
                    </View>
                ) : null}

                {/* Actions Footer */}
                <View style={[styles.cardFooter, { borderTopColor: COLORS.border }]}>
                    {candidate.resumeUrl ? (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.secondaryBtn, { borderColor: COLORS.border }]}
                            onPress={() => handleViewResume(candidate)}
                        >
                            <Ionicons name="document-text-outline" size={16} color={COLORS.textSecondary} />
                            <Text style={[styles.actionText, { color: COLORS.textSecondary }]}>Resume</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flex: 1 }} />
                    )}

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.primaryBtn, { backgroundColor: COLORS.primary }]}
                        onPress={() => handleMessageCandidate(candidate)}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color="#FFF" />
                        <Text style={[styles.actionText, { color: '#FFF' }]}>Message</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    if (loading && !refreshing) {
        return (
            <ScreenWrapper>
                {renderHeader()}
                <View style={styles.listPadding}>
                    {[1, 2, 3].map(i => (
                        <View key={i} style={styles.skeletonSpace}>
                            <SkeletonLoader height={190} borderRadius={24} />
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
                data={filteredCandidates}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <Animated.View entering={FadeInUp} style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={50} color={COLORS.textTertiary} />
                        <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No candidates found.</Text>
                    </Animated.View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.md,
        marginBottom: SIZES.lg,
    },
    headerTextContainer: {
        marginBottom: SIZES.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 54,
        borderRadius: 16,
        paddingLeft: 16,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
        paddingVertical: 12,
    },
    listPadding: {
        paddingHorizontal: SIZES.lg,
    },
    skeletonSpace: {
        marginBottom: SIZES.md,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 18,
        marginBottom: SIZES.md,
        ...SHADOWS.soft,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    avatarWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '800',
    },
    infoArea: {
        flex: 1,
    },
    candidateName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    candidateTitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    candidateBio: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
        marginBottom: 14,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 16,
    },
    skillPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
    },
    skillText: {
        fontSize: 11,
        fontWeight: '700',
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 14,
        borderTopWidth: 1,
    },
    actionBtn: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    secondaryBtn: {
        borderWidth: 1,
    },
    primaryBtn: {
        // bg primary
    },
    actionText: {
        fontSize: 13,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 10,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '600',
    }
});

export default TalentDirectoryScreen;
