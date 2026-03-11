import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { COLORS, SHADOWS } from '../constants/theme';

const JobApplicantsScreen = ({ route, navigation }) => {
    const { jobId, jobTitle } = route.params;
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = async () => {
        try {
            const res = await api.get(`/applications/job/${jobId}`);
            if (res.data.success) {
                setApplicants(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching applicants:', error);
            Alert.alert('Debug (Applicants)', JSON.stringify(error.response?.data) || error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (applicationId, newStatus) => {
        try {
            const res = await api.put(`/applications/${applicationId}/status`, { status: newStatus });
            if (res.data.success) {
                Alert.alert('Success', `Applicant marked as ${newStatus}`);
                fetchApplicants(); // refresh list
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update candidate status.');
        }
    };

    const showStatusOptions = (applicant) => {
        // Basic react native alert with buttons
        Alert.alert(
            'Update Status',
            `For candidate: ${applicant.candidateId?.name}`,
            [
                { text: 'REVIEWING', onPress: () => updateStatus(applicant._id, 'REVIEWING') },
                { text: 'SHORTLISTED', onPress: () => updateStatus(applicant._id, 'SHORTLISTED') },
                { text: 'REJECTED', onPress: () => updateStatus(applicant._id, 'REJECTED'), style: 'destructive' },
                { text: 'Cancel', style: 'cancel' }
            ],
            { cancelable: true }
        );
    };

    const handleViewResume = (item) => {
        const resumeUrl = item.candidateId?.resumeUrl;
        if (resumeUrl) {
            Linking.openURL(resumeUrl).catch(err => {
                console.error("Failed to open URL:", err);
                Alert.alert("Error", "Could not open the resume.");
            });
        } else {
            Alert.alert("No Resume", "This candidate has not uploaded a resume.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPLIED': return COLORS.textSecondary;
            case 'REVIEWING': return COLORS.secondary;
            case 'SHORTLISTED': return COLORS.success;
            case 'REJECTED': return COLORS.danger;
            case 'HIRED': return COLORS.primary;
            default: return COLORS.textSecondary;
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.applicantInfo}>
                    <Text style={styles.name}>{item.candidateId?.name || 'Unknown Candidate'}</Text>
                    <Text style={styles.email}>{item.candidateId?.email || 'N/A'}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}
                    onPress={() => showStatusOptions(item)}
                >
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status} ▾
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                    Applied: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity style={styles.viewResumeBtn} onPress={() => handleViewResume(item)}>
                    <Text style={styles.viewResumeText}>View Resume</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{jobTitle}</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={applicants}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color={COLORS.textHint} />
                            <Text style={styles.emptyText}>No applicants yet.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundLight,
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
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginHorizontal: 12,
    },
    listContent: {
        padding: 24,
    },
    card: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    applicantInfo: {
        flex: 1,
        marginRight: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: COLORS.white,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textHint,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    viewResumeBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: COLORS.primary + '15',
        borderRadius: 6,
    },
    viewResumeText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold'
    }
});

export default JobApplicantsScreen;
