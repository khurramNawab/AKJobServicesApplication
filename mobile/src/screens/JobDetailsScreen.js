import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';

const JobDetailsScreen = ({ route, navigation }) => {
    const { jobId } = route.params;
    const { user } = useAuthStore();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const res = await api.get(`/jobs/${jobId}`);
            if (res.data.success) {
                setJob(res.data.data);
            }

            // If user is candidate, check if they've applied
            if (user?.role === 'CANDIDATE') {
                const checkRes = await api.get(`/applications/check/${jobId}`);
                if (checkRes.data.success) {
                    setHasApplied(checkRes.data.hasApplied);
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch job details');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (user?.role !== 'CANDIDATE') {
            Alert.alert('Access Denied', 'Only candidates can apply for jobs.');
            return;
        }

        try {
            setApplying(true);
            const res = await api.post(`/jobs/${jobId}/apply`, {});

            if (res.data.success) {
                Alert.alert('Success!', 'Your application has been submitted.');
                setHasApplied(true);
            }
        } catch (error) {
            console.error('Application API Error:', error);
            Alert.alert('Application Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerParams}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.centerParams}>
                <Text>Job not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.titleSection, { flexDirection: 'row', alignItems: 'center' }]}>
                    {job.recruiterId?.companyLogo && (
                        <Image source={{ uri: job.recruiterId.companyLogo }} style={styles.detailsLogo} />
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>{job.title}</Text>
                        <Text style={styles.companyName}>{job.recruiterId?.companyName || job.recruiterId?.name || 'Company Name'}</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                        <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.metaText}>{job.location}</Text>
                    </View>
                    <View style={styles.metaBadge}>
                        <Ionicons name="cash-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.metaText}>
                            {job.salaryRange?.min} - {job.salaryRange?.max}
                        </Text>
                    </View>
                    <View style={styles.metaBadge}>
                        <Ionicons name="briefcase-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.metaText}>{job.type}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.paragraph}>{job.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Requirements</Text>
                    <Text style={styles.paragraph}>{job.requirements}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Required Skills</Text>
                    <View style={styles.skillsContainer}>
                        {job.skills?.map((skill, index) => (
                            <View key={index} style={styles.skillBadge}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Footer with Apply Button */}
            {user?.role === 'CANDIDATE' && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.applyButton, hasApplied && styles.applyButtonDisabled]}
                        onPress={handleApply}
                        disabled={applying || hasApplied}
                    >
                        {applying ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.applyButtonText}>
                                {hasApplied ? 'Applied' : 'Apply Now'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundLight,
    },
    centerParams: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60, // status bar roughly
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 8,
        backgroundColor: COLORS.backgroundLight,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100, // Make room for footer
    },
    titleSection: {
        marginBottom: 24,
    },
    detailsLogo: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
        resizeMode: 'contain',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    companyName: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '500',
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 28,
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    metaText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: COLORS.textSecondary,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillBadge: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    skillText: {
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    applyButton: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonDisabled: {
        backgroundColor: COLORS.textHint,
    },
    applyButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default JobDetailsScreen;
