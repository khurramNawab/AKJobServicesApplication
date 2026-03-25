import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform, Linking } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModernButton from '../components/ModernButton';

/**
 * RESUME VIEWER SCREEN
 * 
 * Production-ready PDF/Doc viewer using WebView.
 * On Android, we use Google Docs Viewer as a proxy to render PDFs.
 */
const ResumeViewerScreen = ({ route, navigation }) => {
    const { resumeUrl: initialUrl, title } = route.params;
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [resumeUrl, setResumeUrl] = React.useState(initialUrl);
    const [uploading, setUploading] = React.useState(false);

    // Cache-buster to force fresh load
    const freshUrl = resumeUrl ? (resumeUrl + (resumeUrl?.includes('?') ? '&' : '?') + 't=' + new Date().getTime()) : null;

    // Android cannot natively render PDFs in WebView. 
    // We use Google Docs Viewer to provide a seamless preview experience.
    const viewerUrl = Platform.OS === 'ios'
        ? freshUrl
        : `https://docs.google.com/viewer?url=${encodeURIComponent(freshUrl)}&embedded=true`;

    const handleOpenExternal = () => {
        if (resumeUrl) {
            Linking.openURL(resumeUrl).catch(err => {
                console.error("Failed to open URL:", err);
            });
        }
    };

    const handleResumeUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ],
            });

            if (result.canceled) return;

            const file = result.assets[0];

            if (file.size > 250 * 1024) {
                Alert.alert('File too large', 'Please upload a file smaller than 250KB');
                return;
            }

            setUploading(true);

            const formData = new FormData();
            formData.append('resume', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/pdf',
            });

            const token = await AsyncStorage.getItem('userToken');
            const apiUrl = `${api.defaults.baseURL}/candidates/me/resume`;

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const textData = await res.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (err) {
                throw new Error('Server returned an invalid response.');
            }

            if (data.success) {
                Alert.alert('Success', 'Resume updated successfully!');
                setResumeUrl(data.data.resumeUrl);
            } else {
                throw new Error(data.message || 'Error updating resume');
            }
        } catch (error) {
            console.error('Update Error:', error);
            Alert.alert('Update Failed', error.message || 'Failed to update resume.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScreenWrapper bottom={false}>
            
            <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons name="close" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>{title || 'Resume Viewer'}</Text>
                
                <TouchableOpacity 
                    onPress={handleOpenExternal} 
                    style={styles.externalButton} 
                    disabled={!resumeUrl}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons name="share-outline" size={24} color={resumeUrl ? COLORS.primary : COLORS.textTertiary} />
                </TouchableOpacity>
            </View>

            {resumeUrl ? (
                <View style={{ flex: 1 }}>
                    <WebView
                        source={{ uri: viewerUrl }}
                        style={[styles.webview, { backgroundColor: COLORS.background }]}
                        startInLoadingState={true}
                        scalesPageToFit={true}
                        originWhitelist={['*']}
                        renderLoading={() => (
                            <View style={[styles.loader, { backgroundColor: COLORS.background }]}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                            </View>
                        )}
                    />
                    <TouchableOpacity 
                        style={[styles.floatingButton, { backgroundColor: COLORS.primary }]}
                        onPress={handleResumeUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="repeat" size={24} color="white" />
                                <Text style={styles.floatingButtonText}>Replace Resume</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.emptyView}>
                    <Ionicons name="document-text-outline" size={80} color={COLORS.textTertiary} />
                    <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No resume uploaded yet.</Text>
                    
                    <View style={{ width: '100%', paddingHorizontal: 40 }}>
                        <ModernButton 
                            title="Upload Resume"
                            onPress={handleResumeUpload}
                            loading={uploading}
                        />
                        <Text style={[styles.noteText, { color: COLORS.textTertiary }]}>Max file size: 250KB (PDF/DOCX)</Text>
                    </View>
                </View>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    externalButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10
    },
    webview: {
        flex: 1,
    },
    loader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 24,
    },
    uploadButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        gap: 8,
    },
    floatingButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
    },
    noteText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 12,
        fontWeight: '500',
    }
});

export default ResumeViewerScreen;
