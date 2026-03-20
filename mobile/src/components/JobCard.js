import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import { LinearGradient } from 'expo-linear-gradient';

const JobCard = ({ job, onPress }) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    return (
        <TouchableOpacity 
            style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} 
            onPress={onPress} 
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={[styles.logoContainer, SHADOWS.soft, { backgroundColor: COLORS.surface }]}>
                    {job.recruiterId?.companyLogo ? (
                        <Image source={{ uri: job.recruiterId.companyLogo }} style={styles.companyLogoImage} />
                    ) : (
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.primaryLight]}
                            style={styles.logoPlaceholder}
                        >
                            <Text style={styles.logoText}>
                                {(job.recruiterId?.companyName || job.recruiterId?.name)?.charAt(0)?.toUpperCase()}
                            </Text>
                        </LinearGradient>
                    )}
                </View>

                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: COLORS.textPrimary }]} numberOfLines={1}>{job.title}</Text>
                    <Text style={[styles.companyName, { color: COLORS.textSecondary }]} numberOfLines={1}>
                        {job.recruiterId?.companyName || job.recruiterId?.name || 'Company Name'}
                    </Text>
                </View>
                
                <View style={[styles.typeBadge, { backgroundColor: COLORS.primary + '15' }]}>
                    <Text style={[styles.typeText, { color: COLORS.primary }]}>{job.type}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="location-outline" size={16} color={COLORS.textTertiary} />
                        <Text style={[styles.infoText, { color: COLORS.textSecondary }]}>{job.location}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="cash-outline" size={16} color={COLORS.primary} />
                        <Text style={[styles.infoText, { color: COLORS.primary, fontWeight: '700' }]}>
                            {job.salaryRange?.min} - {job.salaryRange?.max}
                        </Text>
                    </View>
                </View>

                <View style={styles.skillsContainer}>
                    {job.skills?.slice(0, 3).map((skill, index) => (
                        <View key={index} style={[styles.skillBadge, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                            <Text style={[styles.skillText, { color: COLORS.textSecondary }]}>{skill}</Text>
                        </View>
                    ))}
                    {job.skills?.length > 3 && (
                        <View style={[styles.skillBadge, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                            <Text style={[styles.skillText, { color: COLORS.textSecondary }]}>+{job.skills.length - 3}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: SIZES.radiusLg,
        padding: SIZES.md,
        marginBottom: SIZES.md,
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    logoContainer: {
        width: 52,
        height: 52,
        borderRadius: SIZES.radiusMd,
        marginRight: SIZES.md,
        overflow: 'hidden',
    },
    companyLogoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    logoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 2,
    },
    companyName: {
        fontSize: 14,
        fontWeight: '600',
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    footer: {
        marginTop: SIZES.xs,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 14,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: SIZES.xs,
    },
    skillBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
    },
    skillText: {
        fontSize: 12,
        fontWeight: '700',
    },
});

export default JobCard;

