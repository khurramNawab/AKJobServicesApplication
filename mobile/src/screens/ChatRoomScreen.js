import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform, 
    ActivityIndicator, 
    Alert,
    SafeAreaView,
    StatusBar,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

const ChatRoomScreen = ({ route, navigation }) => {
    const { conversationId, otherUser } = route.params;
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef();

    const [convId, setConvId] = useState(conversationId);

    useEffect(() => {
        if (convId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        } else if (otherUser?._id) {
            initConversation();
        }
    }, [convId, otherUser?._id]);

    const initConversation = async () => {
        try {
            const res = await api.get('/chat/conversations');
            const existing = res.data.data.find(c => 
                c.participants.some(p => p._id === otherUser._id)
            );
            if (existing) {
                setConvId(existing._id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Init conversation error:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/chat/messages/${convId}`);
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        try {
            setSending(true);
            const textToSend = inputText.trim();
            setInputText(''); // Optimistic clear

            const res = await api.post('/chat/send', {
                receiverId: otherUser._id,
                text: textToSend
            });

            if (res.data.success) {
                const newMsg = res.data.data;
                if (!convId) {
                    setConvId(newMsg.conversationId);
                } else {
                    fetchMessages();
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item, index }) => {
        const isMyMessage = item.senderId === user._id;
        const showTime = true; // Could add logic to only show if time gap is large
        
        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMyMessage ? 
                        [styles.myMessage, { backgroundColor: COLORS.primary }] : 
                        [styles.theirMessage, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMyMessage ? { color: '#FFFFFF' } : { color: COLORS.textPrimary }
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isMyMessage ? { color: 'rgba(255, 255, 255, 0.7)' } : { color: COLORS.textTertiary }
                    ]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            
            <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                
                <View style={styles.headerProfile}>
                    <View style={[styles.avatarBox, { backgroundColor: COLORS.primary + '15' }]}>
                        {otherUser?.avatar ? (
                            <Image source={{ uri: otherUser.avatar }} style={styles.avatarImg} />
                        ) : (
                            <Text style={[styles.avatarInitial, { color: COLORS.primary }]}>
                                {otherUser?.name?.charAt(0).toUpperCase()}
                            </Text>
                        )}
                        <View style={styles.onlineStatus} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.headerName, { color: COLORS.textPrimary }]} numberOfLines={1}>
                            {otherUser?.name}
                        </Text>
                        <Text style={[styles.headerStatus, { color: COLORS.secondary }]}>Active now</Text>
                    </View>
                </View>
                
                <TouchableOpacity style={styles.headerAction}>
                    <Ionicons name="call-outline" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputArea, { backgroundColor: COLORS.surface, borderTopColor: COLORS.border }]}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                    
                    <View style={[styles.inputWrapper, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                        <TextInput
                            style={[styles.input, { color: COLORS.textPrimary }]}
                            placeholder="Message..."
                            placeholderTextColor={COLORS.textTertiary}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxHeight={100}
                        />
                        <TouchableOpacity style={styles.emojiBtn}>
                            <Ionicons name="happy-outline" size={22} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                        style={[
                            styles.sendButton, 
                            { backgroundColor: COLORS.primary },
                            (!inputText.trim() || sending) && { opacity: 0.6 }
                        ]}
                        onPress={handleSend}
                        disabled={sending || !inputText.trim()}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="send" size={20} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerProfile: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    avatarBox: {
        width: 44,
        height: 44,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    avatarInitial: {
        fontSize: 18,
        fontWeight: '800',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    headerInfo: {
        marginLeft: 12,
        flex: 1,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    headerStatus: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 1,
    },
    headerAction: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageList: {
        padding: 20,
        paddingBottom: 30,
    },
    messageContainer: {
        marginBottom: 12,
        maxWidth: '85%',
    },
    myMessageContainer: {
        alignSelf: 'flex-end',
    },
    theirMessageContainer: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
    },
    myMessage: {
        borderBottomRightRadius: 4,
        ...SHADOWS.soft,
    },
    theirMessage: {
        borderBottomLeftRadius: 4,
        borderWidth: 1,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    messageTime: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    attachBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 16,
        minHeight: 48,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        paddingVertical: 10,
    },
    emojiBtn: {
        padding: 4,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        ...SHADOWS.soft,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ChatRoomScreen;

