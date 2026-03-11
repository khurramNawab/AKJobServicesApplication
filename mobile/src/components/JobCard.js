import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

const JobCard = ({ job, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                {job.recruiterId?.companyLogo ? (
                    <Image source={{ uri: job.recruiterId.companyLogo }} style={styles.companyLogoImage} />
                ) : (
                    <View style={styles.companyLogo}>
                        <Text style={styles.logoText}>
                            {(job.recruiterId?.companyName || job.recruiterId?.name)?.charAt(0)?.toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={styles.headerText}>
                    <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
                    <Text style={styles.companyName} numberOfLines={1}>
                        {job.recruiterId?.companyName || job.recruiterId?.name || 'Company Name'}
                    </Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{job.type}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{job.location}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>
                        {job.salaryRange?.min} - {job.salaryRange?.max} {job.salaryRange?.currency}
                    </Text>
                </View>
            </View>

            <View style={styles.skillsContainer}>
                {job.skills?.slice(0, 3).map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                    </View>
                ))}
                {job.skills?.length > 3 && (
                    <View style={styles.skillBadge}>
                        <Text style={styles.skillText}>+{job.skills.length - 3}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    companyLogo: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '20', // Light primary color
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    companyLogoImage: {
        width: 48,
        height: 48,
        borderRadius: 12,
        marginRight: 12,
        resizeMode: 'contain',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    headerText: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        backgroundColor: COLORS.secondary + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    details: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillBadge: {
        backgroundColor: COLORS.backgroundLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
    },
    skillText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
});

export default JobCard;
