import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert,
    RefreshControl
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, SIZES, SHADOWS } from '../constants/theme';
import api from '../services/api';

const NotificationsScreen = ({ navigation }) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleClearAll = () => {
        Alert.alert(
            "Clear Notifications",
            "Are you sure you want to delete all notifications?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Clear All", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete('/notifications');
                            setNotifications([]);
                        } catch (error) {
                            console.error('Error clearing notifications:', error);
                        }
                    }
                }
            ]
        );
    };

    const getIconInfo = (type) => {
        switch (type) {
            case 'APPLICATION_STATUS': return { icon: 'briefcase-outline', color: COLORS.primary };
            case 'NEW_MESSAGE': return { icon: 'chatbubble-outline', color: COLORS.secondary };
            case 'JOB_MATCH': return { icon: 'sparkles-outline', color: COLORS.accent };
            case 'SYSTEM': return { icon: 'notifications-outline', color: COLORS.textSecondary };
            default: return { icon: 'notifications-outline', color: COLORS.primary };
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const renderItem = ({ item }) => {
        const { icon, color } = getIconInfo(item.type);
        return (
            <TouchableOpacity 
                style={[
                    styles.card, 
                    { backgroundColor: COLORS.surface, borderColor: item.isRead ? COLORS.border : COLORS.primary + '30' }, 
                    SHADOWS.soft,
                    !item.isRead && { borderLeftWidth: 4, borderLeftColor: COLORS.primary }
                ]}
                onPress={() => handleMarkAsRead(item._id)}
            >
                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.content}>
                    <View style={styles.row}>
                        <Text style={[styles.title, { color: COLORS.textPrimary }, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
                        <Text style={[styles.time, { color: COLORS.textTertiary }]}>{formatTime(item.createdAt)}</Text>
                    </View>
                    <Text style={[styles.message, { color: COLORS.textSecondary }]} numberOfLines={2}>
                        {item.message}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper>
            <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={[styles.backBtn, { backgroundColor: COLORS.background }]}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>Notifications</Text>
                {notifications.length > 0 ? (
                    <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                        <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 44 }} />
                )}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <View style={[styles.emptyIconBox, { backgroundColor: COLORS.surface }]}>
                                <Ionicons name="notifications-off-outline" size={64} color={COLORS.textTertiary} />
                            </View>
                            <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No notifications yet</Text>
                            <Text style={[styles.emptySubtitle, { color: COLORS.textTertiary }]}>We'll notify you when something important happens.</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '800',
    },
    list: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    content: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
    },
    unreadTitle: {
        fontWeight: '800',
    },
    time: {
        fontSize: 11,
        fontWeight: '600',
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
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
    emptyText: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
    }
});

export default NotificationsScreen;
