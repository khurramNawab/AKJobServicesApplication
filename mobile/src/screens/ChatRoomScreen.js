import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Keyboard,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { 
    FadeInDown, 
    Layout, 
    SlideInRight, 
    SlideInLeft 
} from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import EliteGradient from '../components/EliteGradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const ChatRoomScreen = ({ route, navigation }) => {
    const { conversationId, otherUser } = route.params;
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [convId, setConvId] = useState(conversationId);

    const flatListRef = useRef();

    useEffect(() => {
        if (convId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 4000);
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
            console.error('Init conv error:', error);
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
            console.error('Fetch messages error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() && attachments.length === 0) return;

        const textToSend = inputText.trim();
        const attachmentsToSend = [...attachments];
        
        setInputText('');
        setAttachments([]);

        try {
            setSending(true);
            const res = await api.post('/chat/send', {
                receiverId: otherUser._id,
                text: textToSend,
                attachments: attachmentsToSend
            });

            if (res.data.success) {
                if (!convId) {
                    setConvId(res.data.data.conversationId);
                } else {
                    fetchMessages();
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        } catch (error) {
            console.error('Send error:', error);
            Alert.alert('Error', 'Message failed to send.');
        } finally {
            setSending(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
        });

        if (!result.canceled) {
            // For now, we mock the upload or wait for user to confirm backend storage
            // In a real app, we'd upload to Cloudinary/S3 here
            setAttachments([...attachments, {
                url: result.assets[0].uri,
                fileType: 'IMAGE',
                fileName: result.assets[0].fileName || 'image.jpg'
            }]);
        }
    };

    const pickDocument = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            });

            if (!res.canceled) {
                setAttachments([...attachments, {
                    url: res.assets[0].uri,
                    fileType: 'DOCUMENT',
                    fileName: res.assets[0].name
                }]);
            }
        } catch (err) {
            console.error('Doc pick error:', err);
        }
    };

    const handleEmojiPick = (emoji) => {
        setInputText(prev => prev + emoji);
    };
    
    const handleCall = () => {
        if (!otherUser?.phoneNumber) {
            Alert.alert('Not Available', 'This user has not listed a public phone number.');
            return;
        }
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const cleanNumber = otherUser.phoneNumber.replace(/[()\-\s]/g, '');
        
        Alert.alert(
            'Professional Call',
            `Start a direct voice call with ${otherUser.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Call Now', 
                    onPress: () => Linking.openURL(`tel:${cleanNumber}`),
                    style: 'default'
                }
            ]
        );
    };

    const renderMessage = ({ item, index }) => {
        const isMe = item.senderId === user._id;
        const prevMsg = index < messages.length - 1 ? messages[index + 1] : null;
        const nextMsg = index > 0 ? messages[index - 1] : null;
        
        // Grouping logic (messages are in desc order)
        const isSameAsPrev = prevMsg && prevMsg.senderId === item.senderId;
        const isSameAsNext = nextMsg && nextMsg.senderId === item.senderId;
        
        const showAvatar = !isMe && !isSameAsNext;

        return (
            <Animated.View 
                entering={isMe ? SlideInRight.springify() : SlideInLeft.springify()}
                layout={Layout.springify()}
                style={[
                    styles.msgWrapper,
                    isMe ? styles.myMsgWrapper : styles.theirMsgWrapper,
                    isSameAsNext && { marginBottom: 2 }
                ]}
            >
                {!isMe && (
                    <View style={styles.avatarSpace}>
                        {showAvatar && (
                            <View style={[styles.miniAvatar, { backgroundColor: COLORS.primary + '20' }]}>
                                {otherUser?.avatar || otherUser?.profilePhoto ? (
                                    <Image source={{ uri: otherUser.avatar || otherUser.profilePhoto }} style={styles.miniAvatarImg} />
                                ) : (
                                    <Text style={[styles.miniAvatarTxt, { color: COLORS.primary }]}>
                                        {otherUser?.name?.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                )}

                <View style={[
                    styles.bubble,
                    isMe ? 
                        { 
                            backgroundColor: COLORS.primary, 
                            borderTopRightRadius: isSameAsNext ? 4 : 20,
                            borderBottomRightRadius: isSameAsPrev ? 4 : 20
                        } : 
                        { 
                            backgroundColor: COLORS.surface, 
                            borderColor: COLORS.border, 
                            borderWidth: 1,
                            borderTopLeftRadius: isSameAsNext ? 4 : 20,
                            borderBottomLeftRadius: isSameAsPrev ? 4 : 20
                        }
                ]}>
                    <Text style={[
                        styles.msgText,
                        { color: isMe ? '#FFF' : COLORS.textPrimary }
                    ]}>
                        {item.text}
                    </Text>

                    {item.attachments && item.attachments.length > 0 && (
                        <View style={styles.msgAttachments}>
                            {item.attachments.map((file, i) => (
                                <View key={i} style={styles.msgFileWrapper}>
                                    {file.fileType === 'IMAGE' ? (
                                        <TouchableOpacity onPress={() => Linking.openURL(file.url)}>
                                            <Image source={{ uri: file.url }} style={styles.msgImage} />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity 
                                            style={[styles.msgDoc, { backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : COLORS.backgroundSecondary }]}
                                            onPress={() => Linking.openURL(file.url)}
                                        >
                                            <Ionicons name="document-text" size={24} color={isMe ? '#FFF' : COLORS.primary} />
                                            <Text style={[styles.msgDocText, { color: isMe ? '#FFF' : COLORS.textPrimary }]} numberOfLines={1}>
                                                {file.fileName || 'Document'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}
                    
                    <View style={styles.msgFooter}>
                        <Text style={[
                            styles.timeText,
                            { color: isMe ? 'rgba(255,255,255,0.7)' : COLORS.textTertiary }
                        ]}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {isMe && (
                            <Ionicons 
                                name={item.isRead ? "checkmark-done" : "checkmark"} 
                                size={14} 
                                color={item.isRead ? "#A5B4FC" : "rgba(255,255,255,0.5)"} 
                                style={styles.statusIcon} 
                            />
                        )}
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <ScreenWrapper bottom={false}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={26} color={COLORS.textPrimary} />
                </TouchableOpacity>
                
                <View style={styles.headerInfo}>
                    <View style={[styles.avatar, { backgroundColor: COLORS.primary + '20' }]}>
                        {otherUser?.avatar || otherUser?.profilePhoto ? (
                            <Image source={{ uri: otherUser.avatar || otherUser.profilePhoto }} style={styles.avatarImg} />
                        ) : (
                            <Text style={[styles.avatarTxt, { color: COLORS.primary }]}>
                                {otherUser?.name?.charAt(0).toUpperCase()}
                            </Text>
                        )}
                        <View style={styles.onlineDot} />
                    </View>
                    <View>
                        <Text style={[styles.headerName, { color: COLORS.textPrimary }]} numberOfLines={1}>
                            {otherUser?.name}
                        </Text>
                        <Text style={[styles.statusTxt, { color: COLORS.success }]}>Online</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                    <Ionicons name="call-outline" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <BlurView 
                    intensity={Platform.OS === 'ios' ? 80 : 100} 
                    tint={isDarkMode ? 'dark' : 'light'} 
                    style={styles.inputContainer}
                >
                    {attachments.length > 0 && (
                        <View style={styles.attachmentPreview}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {attachments.map((file, i) => (
                                    <View key={i} style={styles.previewItem}>
                                        {file.fileType === 'IMAGE' ? (
                                            <Image source={{ uri: file.url }} style={styles.previewImg} />
                                        ) : (
                                            <View style={[styles.previewDoc, { backgroundColor: COLORS.primary + '15' }]}>
                                                <Ionicons name="document-text" size={24} color={COLORS.primary} />
                                            </View>
                                        )}
                                        <TouchableOpacity 
                                            style={styles.removeBtn} 
                                            onPress={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                                        >
                                            <Ionicons name="close-circle" size={20} color={COLORS.danger} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    
                    <View style={styles.inputArea}>
                        <TouchableOpacity style={styles.plusBtn} onPress={pickImage}>
                            <Ionicons name="image-outline" size={26} color={COLORS.primary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.plusBtn} onPress={pickDocument}>
                            <Ionicons name="document-attach-outline" size={26} color={COLORS.primary} />
                        </TouchableOpacity>

                        <View style={[styles.inputWrapper, { backgroundColor: COLORS.backgroundSecondary, borderColor: COLORS.border }]}>
                            <TextInput
                                style={[styles.input, { color: COLORS.textPrimary }]}
                                placeholder="Message..."
                                placeholderTextColor={COLORS.textTertiary}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxHeight={100}
                                onFocus={() => setShowEmojiPicker(false)}
                            />
                            <TouchableOpacity 
                                style={styles.emojiBtn} 
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setShowEmojiPicker(true);
                                }}
                            >
                                <Ionicons name="happy-outline" size={24} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={[styles.sendBtn, { backgroundColor: COLORS.primary, opacity: (inputText.trim() || attachments.length > 0) ? 1 : 0.6 }]}
                            onPress={handleSend}
                            disabled={(!inputText.trim() && attachments.length === 0) || sending}
                        >
                            <Ionicons name="send" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </BlurView>

                {/* Custom Elite Emoji Picker (Crash-Proof) */}
                {showEmojiPicker && (
                    <View style={[styles.emojiPickerContainer, { backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                        <ScrollView 
                            horizontal={false} 
                            contentContainerStyle={styles.emojiGrid}
                            showsVerticalScrollIndicator={false}
                        >
                            {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'].map((emoji, i) => (
                                <TouchableOpacity 
                                    key={i} 
                                    style={styles.emojiItem}
                                    onPress={() => handleEmojiPick(emoji)}
                                >
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
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
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
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
    avatarTxt: {
        fontSize: 18,
        fontWeight: '800',
    },
    onlineDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    headerName: {
        fontSize: 16,
        fontWeight: '800',
        maxWidth: 150,
    },
    statusTxt: {
        fontSize: 12,
        fontWeight: '600',
    },
    callBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    msgWrapper: {
        flexDirection: 'row',
        marginBottom: 8,
        maxWidth: '85%',
    },
    myMsgWrapper: {
        alignSelf: 'flex-end',
    },
    theirMsgWrapper: {
        alignSelf: 'flex-start',
    },
    avatarSpace: {
        width: 38,
        justifyContent: 'flex-end',
        paddingBottom: 2,
    },
    miniAvatar: {
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    miniAvatarImg: {
        width: '100%',
        height: '100%',
    },
    miniAvatarTxt: {
        fontSize: 12,
        fontWeight: '900',
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        ...SHADOWS.low,
    },
    msgText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    msgAttachments: {
        marginTop: 8,
        gap: 8,
    },
    msgFileWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    msgImage: {
        width: 200,
        height: 150,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    msgDoc: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 10,
        minWidth: 180,
    },
    msgDocText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    msgFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
        gap: 4,
    },
    timeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    statusIcon: {
        marginLeft: 2,
    },
    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    attachmentPreview: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    previewItem: {
        width: 60,
        height: 60,
        marginRight: 12,
        borderRadius: 12,
        overflow: 'visible',
    },
    previewImg: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    previewDoc: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFF',
        borderRadius: 10,
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    },
    plusBtn: {
        marginRight: 12,
    },
    inputWrapper: {
        flex: 1,
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingRight: 4, // More space for emoji btn
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.soft,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        paddingVertical: 10,
    },
    emojiBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiPickerContainer: {
        height: 280,
        width: '100%',
        paddingVertical: 10,
    },
    emojiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
        justifyContent: 'center',
    },
    emojiItem: {
        width: width / 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 28,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        ...SHADOWS.premium,
    }
});

export default ChatRoomScreen;
