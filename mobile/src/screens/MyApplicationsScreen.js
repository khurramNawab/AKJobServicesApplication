import React, { useState, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    ActivityIndicator, 
    TouchableOpacity, 
    TextInput,
    Image
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import ModernButton from '../components/ModernButton';
import ScreenWrapper from '../components/ScreenWrapper';

const MyApplicationsScreen = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchApplications();
        }, [])
    );

    const fetchApplications = async () => {
        try {
            const res = await api.get('/applications/me');
            if (res.data.success) {
                setApplications(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPLIED': return { color: COLORS.primary, bg: COLORS.primary + '15', text: 'Submited' };
            case 'REVIEWING': return { color: COLORS.secondary, bg: COLORS.secondary + '15', text: 'Under Review' };
            case 'SHORTLISTED': return { color: '#10B981', bg: '#10B98115', text: 'Shortlisted' };
            case 'REJECTED': return { color: COLORS.danger, bg: COLORS.danger + '15', text: 'Rejected' };
            case 'HIRED': return { color: '#10B981', bg: '#10B98125', text: 'Hired' };
            default: return { color: COLORS.textTertiary, bg: COLORS.background, text: status };
        }
    };

    const filteredApplications = useMemo(() => {
        if (!searchQuery) return applications;
        return applications.filter(app => 
            app.jobId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.jobId?.recruiterId?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [applications, searchQuery]);

    const renderItem = ({ item }) => {
        const status = getStatusStyle(item.status);
        const companyName = item.jobId?.recruiterId?.companyName || item.jobId?.recruiterId?.name || "Company Name";
        
        return (
            <TouchableOpacity 
                style={[styles.appCard, SHADOWS.soft, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('JobDetails', { jobId: item.jobId?._id })}
            >
                <View style={styles.cardMain}>
                    <View style={[styles.logoBox, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                        {item.jobId?.recruiterId?.companyLogo ? (
                            <Image source={{ uri: item.jobId.recruiterId.companyLogo }} style={styles.companyLogo} />
                        ) : (
                            <Text style={[styles.logoPlaceholder, { color: COLORS.primary }]}>
                                {companyName.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>
                    <View style={styles.infoCol}>
                        <Text style={[styles.jobTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>{item.jobId?.title || 'Unknown Job'}</Text>
                        <Text style={[styles.companyName, { color: COLORS.textSecondary }]} numberOfLines={1}>{companyName}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color={COLORS.textTertiary} />
                            <Text style={[styles.locationText, { color: COLORS.textTertiary }]}>{item.jobId?.location || 'Remote'}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusTagText, { color: status.color }]}>{status.text}</Text>
                    </View>
                </View>
                <View style={[styles.cardFooter, { backgroundColor: COLORS.background + '50', borderTopColor: COLORS.border }]}>
                    <View style={styles.dateBox}>
                        <Ionicons name="calendar-outline" size={12} color={COLORS.textTertiary} />
                        <Text style={[styles.dateText, { color: COLORS.textTertiary }]}>Applied {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper bottom={false}>
            <View style={[styles.header, { backgroundColor: COLORS.surface }]}>
                <View style={styles.titleRow}>
                    <View>
                        <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>My Applications</Text>
                        <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>Tracking {applications.length} opportunities</Text>
                    </View>
                    <View style={[styles.headerIconBox, { backgroundColor: COLORS.background }]}>
                        <Ionicons name="stats-chart" size={20} color={COLORS.primary} />
                    </View>
                </View>

                <View style={styles.searchSection}>
                    <View style={[styles.searchBar, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                        <Ionicons name="search" size={20} color={COLORS.textTertiary} />
                        <TextInput 
                            style={[styles.searchInput, { color: COLORS.textPrimary }]}
                            placeholder="Find application..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={COLORS.textTertiary}
                        />
                        {searchQuery !== '' && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredApplications}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconBox, { backgroundColor: COLORS.surface }]}>
                                <Ionicons name="document-text-outline" size={60} color={COLORS.textTertiary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>No Applications Yet</Text>
                            <Text style={[styles.emptyDesc, { color: COLORS.textSecondary }]}>
                                Start your journey by exploring new opportunities that match your professional skills.
                            </Text>
                            <ModernButton 
                                title="Explore Jobs"
                                onPress={() => navigation.navigate('Home')}
                                style={styles.exploreBtn}
                                textStyle={{ fontSize: 16 }}
                            />
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
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: 10,
        paddingBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
    headerIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        marginTop: 4,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '500',
    },
    listContent: {
        padding: SIZES.lg,
        paddingBottom: 40,
    },
    appCard: {
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardMain: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    logoBox: {
        width: 54,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
    },
    companyLogo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    logoPlaceholder: {
        fontSize: 20,
        fontWeight: '800',
    },
    infoCol: {
        flex: 1,
        marginLeft: 14,
        marginRight: 8,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    companyName: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusTagText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 11,
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
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
    exploreBtn: {
        width: '100%',
        height: 56,
    }
});

export default MyApplicationsScreen;
