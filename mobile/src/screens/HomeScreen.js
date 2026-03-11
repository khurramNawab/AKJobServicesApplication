import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS } from '../constants/theme';
import api from '../services/api';
import JobCard from '../components/JobCard';

const HomeScreen = ({ navigation }) => {
    const user = useAuthStore((state) => state.user);

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

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const applyFilters = (baseJobs, search, filterType, currentPrefs) => {
        let result = baseJobs;

        // 1. apply preferences if they exist
        if (currentPrefs.title || currentPrefs.location) {
            result = result.filter(job => {
                const titleMatch = currentPrefs.title ? job.title.toLowerCase().includes(currentPrefs.title.toLowerCase()) : true;
                const locMatch = currentPrefs.location ? job.location.toLowerCase().includes(currentPrefs.location.toLowerCase()) : true;
                return titleMatch && locMatch;
            });
        }

        // 2. apply manual type filter
        if (filterType !== 'All') {
            result = result.filter(job => job.type === filterType);
        }

        // 3. apply search query
        if (search.trim() !== '') {
            result = result.filter(job =>
                job.title.toLowerCase().includes(search.toLowerCase()) ||
                job.location.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredJobs(result);
    };

    useEffect(() => {
        applyFilters(jobs, searchQuery, activeFilter, preferences);
    }, [searchQuery, activeFilter, jobs, preferences]);

    const handleSeedData = async () => {
        try {
            setLoading(true);
            const res = await api.post('/jobs/seed');
            if (res.data.success) {
                Alert.alert('Success', `${res.data.count} mock jobs created!`);
                fetchJobs(); // refresh the list
            }
        } catch (error) {
            console.error('Error seeding data:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to seed data');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderHeader = () => (
        <View style={styles.headerWrapper}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
                    <Text style={styles.subtitle}>Find your dream job today</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by job title or location..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filterContainer}>
                <FlatList
                    data={filters}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterPill,
                                activeFilter === item && styles.filterPillActive
                            ]}
                            onPress={() => setActiveFilter(item)}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === item && styles.filterTextActive
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            <View style={styles.listContainer}>
                {(preferences.title || preferences.location) ? (
                    <View style={styles.preferenceBanner}>
                        <Text style={styles.preferenceBannerText}>
                            ✨ Recommended based on your preferences
                        </Text>
                    </View>
                ) : null}
                <Text style={styles.sectionTitle}>Recent Jobs</Text>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                ) : (
                    <FlatList
                        data={filteredJobs}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <JobCard
                                job={item}
                                onPress={() => navigation.navigate('JobDetails', { jobId: item._id })}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="briefcase-outline" size={48} color={COLORS.textHint} />
                                <Text style={styles.emptyText}>No jobs found</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Floating Action Button for Recruiters to easily add dummy data */}
            {user?.role === 'RECRUITER' && (
                <TouchableOpacity style={styles.fab} onPress={handleSeedData}>
                    <Ionicons name="add" size={30} color={COLORS.white} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundLight,
        paddingTop: 60, // approximate status bar height
    },
    headerWrapper: {
        paddingHorizontal: 24,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    filterContainer: {
        marginBottom: 10,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 10,
    },
    filterPillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    filterTextActive: {
        color: COLORS.white,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    loader: {
        marginTop: 40,
    },
    preferenceBanner: {
        backgroundColor: COLORS.secondary + '15',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.secondary + '50',
    },
    preferenceBannerText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 13,
        textAlign: 'center',
    },
    flatListContent: {
        paddingBottom: 40,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: COLORS.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6, // android shadow
        shadowColor: COLORS.primary, // ios shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    }
});

export default HomeScreen;
