import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    FadeInDown, 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring,
    withSequence
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

/**
 * PremiumJobCard Component
 * High-end job card with modern typography, company logos, and smooth entry animations.
 */
const PremiumJobCard = ({ job, onPress, onToggleSave, isSaved = false, index = 0 }) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
 
    const companyName = job.recruiterId?.companyName || job.recruiterId?.name || 'Top Company';
    // Force HTTPS and add cache busting for reliability
    const logoUrl = job.recruiterId?.companyLogo ? 
        job.recruiterId.companyLogo.replace('http://', 'https://') + `?v=${Date.now()}` : null;

    const scale = useSharedValue(1);

    const animatedHeartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const onToggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSequence(
            withSpring(1.4),
            withSpring(1)
        );
        onToggleSave?.();
    };

    return (
        <Animated.View 
            entering={FadeInDown.delay(index * 100).springify()}
            style={styles.container}
        >
            <TouchableOpacity 
                style={[
                    styles.card, 
                    { 
                        backgroundColor: COLORS.surface, 
                        borderColor: COLORS.border,
                        shadowColor: isDarkMode ? '#000' : COLORS.primary 
                    }
                ]} 
                onPress={onPress} 
                activeOpacity={0.9}
            >
                <View style={styles.header}>
                    <View style={[styles.logoWrapper, { backgroundColor: COLORS.backgroundSecondary }]}>
                        {logoUrl ? (
                            <Image source={{ uri: logoUrl }} style={styles.logo} />
                        ) : (
                            <LinearGradient
                                colors={COLORS.gradientPrimary}
                                style={styles.logoPlaceholder}
                            >
                                <Text style={styles.logoText}>{companyName.charAt(0).toUpperCase()}</Text>
                            </LinearGradient>
                        )}
                    </View>
 
                    <View style={styles.titleArea}>
                        <Text style={[styles.jobTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
                            {job.title}
                        </Text>
                        <Text style={[styles.companyName, { color: COLORS.textSecondary }]} numberOfLines={1}>
                            {companyName}
                        </Text>
                    </View>
 
                    <TouchableOpacity 
                        style={styles.bookmarkBtn}
                        onPress={onToggle}
                    >
                        <Animated.View style={animatedHeartStyle}>
                            <Ionicons 
                                name={isSaved ? "heart" : "heart-outline"} 
                                size={24} 
                                color={isSaved ? COLORS.danger : COLORS.textTertiary} 
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                <View style={styles.tagsRow}>
                    <View style={[styles.tag, { backgroundColor: COLORS.primary + '10' }]}>
                        <Ionicons name="briefcase-outline" size={14} color={COLORS.primary} />
                        <Text style={[styles.tagText, { color: COLORS.primary }]}>{job.type}</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: COLORS.success + '10' }]}>
                        <Ionicons name="cash-outline" size={14} color={COLORS.success} />
                        <Text style={[styles.tagText, { color: COLORS.success }]}>
                            {job.salaryRange?.min} - {job.salaryRange?.max}
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.locationWrap}>
                        <Ionicons name="location-outline" size={16} color={COLORS.textTertiary} />
                        <Text style={[styles.locationText, { color: COLORS.textSecondary }]}>
                            {job.location}
                        </Text>
                    </View>
                    
                    <View style={styles.applicantsWrap}>
                        <View style={styles.avatarsStack}>
                            {[1, 2, 3].map((_, i) => (
                                <View 
                                    key={i} 
                                    style={[
                                        styles.miniAvatar, 
                                        { 
                                            left: i * -8, 
                                            backgroundColor: COLORS.surfaceSecondary,
                                            borderColor: COLORS.surface 
                                        }
                                    ]}
                                />
                            ))}
                        </View>
                        <Text style={[styles.applicantsText, { color: COLORS.textTertiary }]}>
                            {job.applicantsCount || 0}+ Applied
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.md,
        paddingHorizontal: 2, // For shadow visibility
    },
    card: {
        borderRadius: SIZES.radiusLg,
        padding: SIZES.md + 4,
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    logoWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
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
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    titleArea: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    jobTitle: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 2,
    },
    companyName: {
        fontSize: 13,
        fontWeight: '600',
    },
    bookmarkBtn: {
        padding: 4,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: SIZES.md,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)',
    },
    locationWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        fontWeight: '600',
    },
    applicantsWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarsStack: {
        flexDirection: 'row',
        marginRight: 8,
    },
    miniAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    applicantsText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default React.memo(PremiumJobCard);
