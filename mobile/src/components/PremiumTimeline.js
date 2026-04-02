import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SIZES, TYPOGRAPHY } from '../constants/theme';

const STATUS_DISPLAY = {
    'APPLIED': { label: 'Applied', icon: 'send', color: '#6366F1' },
    'REVIEWING': { label: 'In Review', icon: 'eye', color: '#F59E0B' },
    'SHORTLISTED': { label: 'Shortlisted', icon: 'star', color: '#10B981' },
    'REJECTED': { label: 'Not Selected', icon: 'close-circle', color: '#EF4444' },
    'HIRED': { label: 'Hired!', icon: 'ribbon', color: '#8B5CF6' }
};

/**
 * PremiumTimeline Component
 * Renders a visual history of application status changes.
 */
const PremiumTimeline = ({ history = [], COLORS }) => {
    if (!history || history.length === 0) return null;

    // Sort by timestamp descending (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <View style={styles.container}>
            {sortedHistory.map((item, index) => {
                const config = STATUS_DISPLAY[item.status] || { label: item.status, icon: 'help-circle', color: COLORS.textTertiary };
                const isLatest = index === 0;

                return (
                    <Animated.View 
                        key={index} 
                        entering={FadeIn.delay(index * 100)}
                        style={styles.timelineItem}
                    >
                        <View style={styles.leftCol}>
                            <View style={[styles.dot, { backgroundColor: isLatest ? config.color : COLORS.border }]} />
                            {index !== sortedHistory.length - 1 && (
                                <View style={[styles.line, { backgroundColor: COLORS.border }]} />
                            )}
                        </View>
                        <View style={styles.rightCol}>
                            <View style={styles.statusRow}>
                                <Text style={[
                                    styles.statusLabel, 
                                    { color: isLatest ? COLORS.textPrimary : COLORS.textSecondary, fontWeight: isLatest ? '800' : '600' }
                                ]}>
                                    {config.label}
                                </Text>
                                <Text style={[styles.dateText, { color: COLORS.textTertiary }]}>
                                    {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Text>
                            </View>
                            {isLatest && (
                                <Text style={[styles.latestHint, { color: COLORS.textTertiary }]}>
                                    Latest Update
                                </Text>
                            )}
                        </View>
                    </Animated.View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingLeft: 4,
    },
    timelineItem: {
        flexDirection: 'row',
        minHeight: 45,
    },
    leftCol: {
        alignItems: 'center',
        marginRight: 12,
        width: 12,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 6,
    },
    line: {
        flex: 1,
        width: 2,
    },
    rightCol: {
        flex: 1,
        paddingBottom: 16,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
    },
    dateText: {
        fontSize: 11,
        fontWeight: '700',
    },
    latestHint: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginTop: 2,
    }
});

export default PremiumTimeline;
