import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Image, 
    TextInput,
    RefreshControl,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout, SlideInTop, SlideOutTop } from 'react-native-reanimated';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import SkeletonLoader from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');

const ChatItem = React.memo(({ item, index, navigation, user, COLORS, formatTime }) => {
    const otherParticipant = item.participants?.find(p => p._id !== user._id);
    const name = otherParticipant?.name || 'User';
    const initial = name.charAt(0).toUpperCase();
    const lastMessage = item.lastMessage;
    const lastMsgText = item.lastMessage ? (item.lastMessage.text || (item.lastMessage.attachments?.length > 0 ? 'Attachment' : '')) : 'No messages yet';
    const isUnread = item.unreadCount > 0;

    return (
        <Animated.View 
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.cardWrapper}
        >
            <TouchableOpacity 
                style={[styles.chatCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ChatRoom', { 
                    conversationId: item._id,
                    otherUser: otherParticipant
                })}
            >
                <View style={[styles.avatarBox, { backgroundColor: COLORS.primary + '10' }]}>
                    {otherParticipant?.avatar || otherParticipant?.profilePhoto ? (
                        <Image source={{ uri: otherParticipant.avatar || otherParticipant.profilePhoto }} style={styles.avatarImg} />
                    ) : (
                        <Text style={[styles.avatarTxt, { color: COLORS.primary }]}>{initial}</Text>
                    )}
                    <View style={[styles.statusDot, { borderColor: COLORS.surface }]} />
                </View>
                
                <View style={styles.chatContent}>
                    <View style={styles.topLine}>
                        <Text style={[styles.userName, { color: COLORS.textPrimary }]} numberOfLines={1}>{name}</Text>
                        <Text style={[styles.timeTxt, { color: isUnread ? COLORS.primary : COLORS.textTertiary, fontWeight: isUnread ? '800' : '600' }]}>
                            {formatTime(item.updatedAt, lastMessage?.createdAt)}
                        </Text>
                    </View>
                    
                    <View style={styles.bottomLine}>
                        <Text 
                            style={[
                                styles.lastMsgText, 
                                { color: isUnread ? COLORS.textPrimary : COLORS.textSecondary, fontWeight: isUnread ? '700' : '500' }
                            ]} 
                            numberOfLines={1}
                        >
                            {lastMessage ? (
                                lastMessage.senderId === user._id ? `You: ${lastMsgText}` : lastMsgText
                            ) : 'Start a conversation'}
                        </Text>
                        {isUnread && (
                            <View style={[styles.unreadBadge, { backgroundColor: COLORS.primary }]}>
                                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

const ChatListScreen = ({ navigation }) => {
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchConversations = async () => {
        try {
            if (!refreshing) setLoading(true);
            const res = await api.get('/chat/conversations');
            if (res.data.success) {
                setConversations(res.data.data);
            }
        } catch (error) {
            console.error('Fetch conversations error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchConversations();
        });
        return unsubscribe;
    }, [navigation]);

    const filteredConversations = useMemo(() => {
        if (searchQuery.trim() === '') return conversations;
        const query = searchQuery.toLowerCase();
        return conversations.filter(conv => {
            const otherParticipant = conv.participants?.find(p => p._id !== user._id);
            return (
                otherParticipant?.name?.toLowerCase().includes(query) ||
                conv.lastMessage?.text?.toLowerCase().includes(query)
            );
        });
    }, [searchQuery, conversations, user]);

    const formatTime = useCallback((dateString, lastMsgDate) => {
        const date = lastMsgDate ? new Date(lastMsgDate) : new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }, []);

    const renderItem = useCallback(({ item, index }) => {
        if (loading) {
            return (
                <View style={styles.skeletonWrap}>
                    <SkeletonLoader height={88} borderRadius={20} />
                </View>
            );
        }
        return (
            <ChatItem 
                item={item} 
                index={index} 
                navigation={navigation} 
                user={user} 
                COLORS={COLORS} 
                formatTime={formatTime} 
            />
        );
    }, [loading, navigation, user, COLORS, formatTime]);

    const keyExtractor = useCallback((item, index) => item?._id || index.toString(), []);

    return (
        <ScreenWrapper bottom={false}>
            <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
                {!isSearchVisible ? (
                    <>
                        <View>
                            <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>Messages</Text>
                            <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>Connect with recruiters & talent</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.headerBtn, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border }]} 
                            onPress={() => setIsSearchVisible(true)}
                        >
                            <Ionicons name="search-outline" size={22} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <Animated.View entering={SlideInTop} exiting={SlideOutTop} style={styles.searchBarContainer}>
                        <View style={[styles.searchInputBox, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border }]}>
                            <Ionicons name="search" size={20} color={COLORS.textTertiary} />
                            <TextInput
                                style={[styles.searchInput, { color: COLORS.textPrimary }]}
                                placeholder="Search conversations..."
                                placeholderTextColor={COLORS.textTertiary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => { setIsSearchVisible(false); setSearchQuery(''); }}>
                            <Text style={[styles.cancelTxt, { color: COLORS.primary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>

            <FlatList
                data={loading ? Array(6).fill(0) : filteredConversations}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={useCallback(() => { setRefreshing(true); fetchConversations(); }, [])} 
                        tintColor={COLORS.primary} 
                    />
                }
                showsVerticalScrollIndicator={false}
                initialNumToRender={8}
                maxToRenderPerBatch={10}
                windowSize={10}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIcon, { backgroundColor: COLORS.surfaceSecondary }]}>
                                <Ionicons name="chatbubbles-outline" size={60} color={COLORS.textTertiary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>No messages yet</Text>
                            <Text style={[styles.emptySubtitle, { color: COLORS.textSecondary }]}>
                                Once you start a conversation, they will appear here. Build your professional network!
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
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    headerBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchInputBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '600',
    },
    cancelBtn: {
        paddingHorizontal: 4,
    },
    cancelTxt: {
        fontSize: 15,
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 40,
    },
    cardWrapper: {
        paddingHorizontal: SIZES.lg,
        marginTop: 12,
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    avatarBox: {
        width: 60,
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },
    avatarTxt: {
        fontSize: 22,
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
    chatContent: {
        flex: 1,
        marginLeft: 14,
    },
    topLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    timeTxt: {
        fontSize: 11,
    },
    bottomLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
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

export default ChatListScreen;
