import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert,
    RefreshControl,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import SkeletonLoader from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');

const NotificationsScreen = ({ navigation }) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            if (!refreshing) setLoading(true);
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const handleClearAll = () => {
        Alert.alert(
            "Clear Activity",
            "Are you sure you want to remove all notifications from your history?",
            [
                { text: "Keep Them", style: "cancel" },
                { 
                    text: "Clear History", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete('/notifications');
                            setNotifications([]);
                        } catch (error) {
                            console.error('Clear notifications error:', error);
                        }
                    }
                }
            ]
        );
    };

    const getIconInfo = (type) => {
        switch (type) {
            case 'APPLICATION_STATUS': return { icon: 'briefcase', color: COLORS.primary };
            case 'NEW_MESSAGE': return { icon: 'chatbubbles', color: COLORS.secondary };
            case 'JOB_MATCH': return { icon: 'sparkles', color: COLORS.accent };
            case 'SYSTEM': return { icon: 'shield-checkmark', color: COLORS.textTertiary };
            default: return { icon: 'notifications', color: COLORS.primary };
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSecs = Math.floor((now - date) / 1000);
        if (diffInSecs < 60) return 'Just now';
        if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
        if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const renderItem = ({ item, index }) => {
        const { icon, color } = getIconInfo(item.type);
        const isUnread = !item.isRead;

        return (
            <Animated.View 
                entering={FadeInDown.delay(index * 100).springify()}
                layout={Layout.springify()}
                style={styles.cardWrapper}
            >
                <TouchableOpacity 
                    style={[
                        styles.notiCard, 
                        { backgroundColor: COLORS.surface, borderColor: isUnread ? COLORS.primary + '20' : COLORS.border }, 
                        isUnread && styles.unreadCard
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleMarkAsRead(item._id)}
                >
                    <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
                        <Ionicons name={icon} size={22} color={color} />
                    </View>
                    <View style={styles.textContent}>
                        <View style={styles.topRow}>
                            <Text style={[styles.notiTitle, { color: COLORS.textPrimary }, isUnread && styles.boldText]}>{item.title}</Text>
                            <Text style={[styles.timeTxt, { color: COLORS.textTertiary }]}>{formatTime(item.createdAt)}</Text>
                        </View>
                        <Text style={[styles.notiMsg, { color: COLORS.textSecondary }]} numberOfLines={2}>
                            {item.message}
                        </Text>
                    </View>
                    {isUnread && <View style={[styles.unreadDot, { backgroundColor: COLORS.primary }]} />}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <ScreenWrapper bottom={false}>
            <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerBtn, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border }]}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleArea}>
                    <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>Activity</Text>
                </View>
                {notifications.length > 0 ? (
                    <TouchableOpacity onPress={handleClearAll} style={[styles.headerBtn, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border }]}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 48 }} />
                )}
            </View>

            <FlatList
                data={loading ? Array(8).fill(0) : notifications}
                keyExtractor={(item, index) => item?._id || index.toString()}
                renderItem={loading ? () => (
                    <View style={styles.skeletonWrap}>
                        <SkeletonLoader height={80} borderRadius={20} />
                    </View>
                ) : renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor={COLORS.primary} />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIcon, { backgroundColor: COLORS.surfaceSecondary }]}>
                                <Ionicons name="notifications-off-outline" size={60} color={COLORS.textTertiary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>All caught up!</Text>
                            <Text style={[styles.emptySubtitle, { color: COLORS.textSecondary }]}>
                                Your notification history is clear. We'll alert you when there's an update on your applications.
                            </Text>
                        </View>
                    )
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    headerTitleArea: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    listContent: {
        paddingBottom: 40,
    },
    cardWrapper: {
        paddingHorizontal: SIZES.lg,
        marginTop: 12,
    },
    notiCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContent: {
        flex: 1,
        marginLeft: 14,
        marginRight: 8,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notiTitle: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    boldText: {
        fontWeight: '800',
    },
    timeTxt: {
        fontSize: 11,
        fontWeight: '600',
    },
    notiMsg: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 14,
        right: 14,
    },
    skeletonWrap: {
        paddingHorizontal: SIZES.lg,
        marginTop: 12,
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 110,
        height: 110,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    }
});

export default NotificationsScreen;
