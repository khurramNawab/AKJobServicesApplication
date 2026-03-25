import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator, 
    TextInput,
    RefreshControl,
    Animated
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

const ChatListScreen = ({ navigation }) => {
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchConversations = async () => {
        try {
            const res = await api.get('/chat/conversations');
            if (res.data.success) {
                setConversations(res.data.data);
                setFilteredConversations(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredConversations(conversations);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = conversations.filter(conv => {
                const otherParticipant = conv.participants.find(p => p._id !== user._id);
                return (
                    otherParticipant?.name?.toLowerCase().includes(query) ||
                    conv.lastMessage?.text?.toLowerCase().includes(query)
                );
            });
            setFilteredConversations(filtered);
        }
    }, [searchQuery, conversations]);

    useFocusEffect(
        useCallback(() => {
            fetchConversations();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const formatTime = (dateString, lastMsgDate) => {
        const date = lastMsgDate ? new Date(lastMsgDate) : new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const ConversationItem = ({ item, index }) => {
        const otherParticipant = item.participants.find(p => p._id !== user._id);
        const name = otherParticipant?.name || 'User';
        const initial = name.charAt(0).toUpperCase();
        const lastMessage = item.lastMessage;
        const lastMsgText = item.lastMessage ? (item.lastMessage.text || (item.lastMessage.attachments?.length > 0 ? 'Attachment [📎]' : '')) : 'No messages yet';
        
        const translateY = React.useRef(new Animated.Value(20)).current;
        const opacity = React.useRef(new Animated.Value(0)).current;

        React.useEffect(() => {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 350,
                    delay: Math.min(index * 50, 500),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 350,
                    delay: Math.min(index * 50, 500),
                    useNativeDriver: true,
                })
            ]).start();
        }, []);

        return (
            <Animated.View style={{ opacity, transform: [{ translateY }] }}>
                <TouchableOpacity 
                    style={[
                        styles.conversationCard, 
                        { 
                            backgroundColor: COLORS.surface, 
                            borderColor: item.unreadCount > 0 ? COLORS.primary + '50' : COLORS.border 
                        }, 
                        item.unreadCount > 0 ? SHADOWS.medium : SHADOWS.soft
                    ]}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('ChatRoom', { 
                        conversationId: item._id,
                        otherUser: otherParticipant
                    })}
                >
                    <View style={[styles.avatarBox, { backgroundColor: COLORS.primary + '15' }]}>
                        {otherParticipant?.avatar ? (
                            <Image source={{ uri: otherParticipant.avatar }} style={styles.avatarImg} />
                        ) : (
                            <Text style={[styles.avatarText, { color: COLORS.primary }]}>{initial}</Text>
                        )}
                        <View style={[styles.statusDot, { borderColor: COLORS.surface }]} />
                    </View>
                    
                    <View style={styles.chatInfo}>
                        <View style={styles.topRow}>
                            <View style={styles.nameAndRole}>
                                <Text style={[styles.userName, { color: COLORS.textPrimary }]} numberOfLines={1}>{name}</Text>
                                <View style={[styles.roleBadge, { backgroundColor: COLORS.primary + '10' }]}>
                                    <Text style={[styles.roleLabel, { color: COLORS.primary }]}>{otherParticipant?.role === 'RECRUITER' ? 'Recruiter' : 'Candidate'}</Text>
                                </View>
                            </View>
                            <Text style={[styles.timeText, { color: item.unreadCount > 0 ? COLORS.primary : COLORS.textTertiary, fontWeight: item.unreadCount > 0 ? '800' : '600' }]}>
                                {formatTime(item.updatedAt, lastMessage?.createdAt)}
                            </Text>
                        </View>
                        <View style={styles.bottomRow}>
                            <Text 
                                style={[
                                    styles.lastMsgText, 
                                    { color: item.unreadCount > 0 ? COLORS.textPrimary : COLORS.textSecondary },
                                    item.unreadCount > 0 && { fontWeight: '700' }
                                ]} 
                                numberOfLines={1}
                            >
                                {lastMessage ? (
                                    lastMessage.senderId === user._id ? `You: ${lastMsgText}` : lastMsgText
                                ) : 'No messages yet'}
                            </Text>
                            {item.unreadCount > 0 && (
                                <View style={[styles.unreadBadge, { backgroundColor: COLORS.primary }]}>
                                    <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderItem = ({ item, index }) => {
        return <ConversationItem item={item} index={index} />;
    };

    return (
        <ScreenWrapper bottom={false}>
            <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
                {isSearchVisible ? (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={[styles.searchInput, { color: COLORS.textPrimary, backgroundColor: COLORS.background }]}
                            placeholder="Search messages..."
                            placeholderTextColor={COLORS.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        <TouchableOpacity style={styles.closeSearchBtn} onPress={() => { setIsSearchVisible(false); setSearchQuery(''); }}>
                            <Ionicons name="close-outline" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>Messages</Text>
                        <TouchableOpacity 
                            style={[styles.searchBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} 
                            activeOpacity={0.7}
                            onPress={() => setIsSearchVisible(true)}
                        >
                            <Ionicons name="search-outline" size={22} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconCircle, { backgroundColor: COLORS.backgroundLight }]}>
                                <Ionicons name="chatbubbles-outline" size={60} color={COLORS.textTertiary} />
                            </View>
                            <Text style={[styles.emptyText, { color: COLORS.textPrimary }]}>No messages yet</Text>
                            <Text style={[styles.emptySubtext, { color: COLORS.textSecondary }]}>
                                When you contact recruiters or candidates, your chats will appear here.
                            </Text>
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
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    searchBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '600',
    },
    closeSearchBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    listContent: {
        padding: SIZES.lg,
        paddingBottom: 40,
    },
    conversationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
    },
    avatarBox: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '800',
    },
    statusDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 3,
    },
    chatInfo: {
        flex: 1,
        marginLeft: 16,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    nameAndRole: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    roleBadge: {
        marginLeft: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleLabel: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    lastMsgText: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    }
});

export default ChatListScreen;

