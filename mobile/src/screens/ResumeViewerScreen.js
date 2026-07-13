import React from 'react';
import {
    View, StyleSheet, TouchableOpacity, Text,
    ActivityIndicator, Linking, Alert, Share
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';
import ModernButton from '../components/ModernButton';

/**
 * RESUME VIEWER SCREEN
 *
 * Strategy (in order of reliability for React Native):
 *   1. Google Docs Viewer  →  WebView loads docs.google.com/gview?url=...
 *      Works for any publicly accessible PDF/DOCX URL.
 *   2. Linking.openURL     →  Opens the raw URL in the phone's default browser.
 *      Always works as a last resort.
 *
 * WHY NOT PDF.js?
 *   PDF.js requires loading CDN scripts inside a sandboxed WebView, which is
 *   blocked on most Android/iOS setups. It also requires fetching the PDF via JS
 *   fetch(), which Cloudinary raw-type URLs block (no CORS headers for JS).
 */

/**
 * Build the Google Docs Viewer URL from any resume URL.
 * Google Docs can render PDFs and DOCX from any public link.
 */
const getViewerUrl = (rawUrl) => {
    if (!rawUrl) return null;
    const encoded = encodeURIComponent(rawUrl);
    return `https://docs.google.com/gview?url=${encoded}&embedded=true`;
};

const ResumeViewerScreen = ({ route, navigation }) => {
    const { resumeUrl: initialUrl, title } = route.params;
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [resumeUrl, setResumeUrl] = React.useState(initialUrl || null);
    const [uploading, setUploading] = React.useState(false);
    const [webViewKey, setWebViewKey] = React.useState(1);
    const [loading, setLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const [openingBrowser, setOpeningBrowser] = React.useState(false);

    // Log URL for debugging
    React.useEffect(() => {
        console.log('[ResumeViewer] Raw URL from route:', initialUrl);
        console.log('[ResumeViewer] Google Docs viewer URL:', getViewerUrl(initialUrl));
    }, []);

    // ─── Open directly in phone browser (guaranteed fallback) ────────────────
    const handleOpenInBrowser = async () => {
        const url = resumeUrl;
        if (!url) {
            Alert.alert('No Resume', 'Resume URL is not available.');
            return;
        }
        try {
            setOpeningBrowser(true);
            await Linking.openURL(url);
        } catch (e) {
            console.error('[ResumeViewer] Linking.openURL failed:', e);
            Alert.alert('Error', 'Could not open the file. ' + e.message);
        } finally {
            setOpeningBrowser(false);
        }
    };

    // ─── Share the raw URL ──────────────────────────────────────────────────
    const handleShare = async () => {
        if (!resumeUrl) return;
        try {
            await Share.share({ message: resumeUrl, url: resumeUrl });
        } catch (e) {
            handleOpenInBrowser();
        }
    };

    // ─── Retry: rebuild viewer URL and bump WebView key ──────────────────────
    const handleRetry = () => {
        setHasError(false);
        setLoading(true);
        setWebViewKey(prev => prev + 1);
    };

    // ─── WebView error: switch to error UI ───────────────────────────────────
    const handleWebViewError = (syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('[ResumeViewer] WebView error:', nativeEvent);
        setLoading(false);
        setHasError(true);
    };

    // ─── Upload / Replace resume ─────────────────────────────────────────────
    const handleResumeUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ],
            });

            if (result.canceled) return;

            const file = result.assets[0];

            if (file.size > 300 * 1024) {
                Alert.alert('File too large', '300 kb not more than that');
                return;
            }

            setUploading(true);

            const formData = new FormData();
            formData.append('resume', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/pdf',
            });

            console.log('[ResumeViewer] Starting upload to:', `${api.defaults.baseURL}/candidates/me/resume`);
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch(`${api.defaults.baseURL}/candidates/me/resume`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const resData = await response.json();
            console.log('[ResumeViewer] Upload response:', JSON.stringify(resData, null, 2));

            if (resData.success) {
                const newUrl = resData.resumeUrl || resData.data?.resumeUrl;
                console.log('[ResumeViewer] New resume URL:', newUrl);
                setResumeUrl(newUrl);
                setHasError(false);
                setLoading(true);
                setWebViewKey(prev => prev + 1);
                Alert.alert('Success! 🎉', 'Your resume has been updated.');
            } else {
                throw new Error(resData.message || 'Error updating resume');
            }
        } catch (error) {
            console.error('[ResumeViewer] Upload error:', error);
            Alert.alert(
                'Upload Failed',
                error.response?.data?.message || error.message || 'Failed to update resume.'
            );
        } finally {
            setUploading(false);
        }
    };

    // The URL we feed to Google Docs Viewer
    const viewerUrl = getViewerUrl(resumeUrl);

    return (
        <ScreenWrapper bottom={false}>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.navBtn}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons name="close" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
                    {title || 'Resume Viewer'}
                </Text>

                <TouchableOpacity
                    onPress={handleShare}
                    style={styles.navBtn}
                    disabled={!resumeUrl}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons
                        name="share-outline"
                        size={24}
                        color={resumeUrl ? COLORS.primary : COLORS.textTertiary}
                    />
                </TouchableOpacity>
            </View>

            {/* ── Content ────────────────────────────────────────────────── */}
            {resumeUrl ? (
                <View style={{ flex: 1 }}>
                    {hasError ? (
                        /* ── Error State ─────────────────────────────────── */
                        <View style={[styles.centerView, { backgroundColor: COLORS.background }]}>
                            <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                                <Ionicons name="document-text-outline" size={52} color={COLORS.primary} />
                            </View>
                            <Text style={[styles.errorTitle, { color: COLORS.textPrimary }]}>
                                Preview Unavailable
                            </Text>
                            <Text style={[styles.errorSub, { color: COLORS.textSecondary }]}>
                                The in-app preview failed to load. You can open the resume directly in your browser below.
                            </Text>

                            <View style={styles.errorBtns}>
                                {/* Retry Google Docs */}
                                <TouchableOpacity
                                    style={[styles.pill, { backgroundColor: COLORS.primary }]}
                                    onPress={handleRetry}
                                >
                                    <Ionicons name="refresh" size={15} color="#FFF" />
                                    <Text style={styles.pillText}>Retry</Text>
                                </TouchableOpacity>

                                {/* Open in browser — always works */}
                                <TouchableOpacity
                                    style={[styles.pill, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary }]}
                                    onPress={handleOpenInBrowser}
                                    disabled={openingBrowser}
                                >
                                    {openingBrowser ? (
                                        <ActivityIndicator size="small" color={COLORS.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="open-outline" size={15} color={COLORS.primary} />
                                            <Text style={[styles.pillText, { color: COLORS.primary }]}>
                                                Open in Browser
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Direct URL hint */}
                            <TouchableOpacity onPress={handleOpenInBrowser} style={styles.directLink}>
                                <Ionicons name="link-outline" size={13} color={COLORS.textTertiary} />
                                <Text style={[styles.directLinkText, { color: COLORS.textTertiary }]} numberOfLines={1}>
                                    {resumeUrl}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* ── Google Docs Viewer ───────────────────────────── */
                        <>
                            {loading && (
                                <View style={[styles.loader, { backgroundColor: COLORS.background }]}
                                    pointerEvents="none"
                                >
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                    <Text style={{ color: COLORS.textSecondary, marginTop: 14, fontSize: 13, fontWeight: '500' }}>
                                        Loading document...
                                    </Text>
                                </View>
                            )}
                            <WebView
                                key={webViewKey}
                                source={{ uri: viewerUrl }}
                                style={{ flex: 1 }}
                                onLoadStart={() => setLoading(true)}
                                onLoad={() => setLoading(false)}
                                onLoadEnd={() => setLoading(false)}
                                onError={handleWebViewError}
                                onHttpError={(e) => {
                                    console.warn('[ResumeViewer] HTTP error:', e.nativeEvent.statusCode);
                                    // Google Docs sometimes returns 204/cached — only fail on real errors
                                    if (e.nativeEvent.statusCode >= 400) {
                                        setLoading(false);
                                        setHasError(true);
                                    }
                                }}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                startInLoadingState={false}
                                originWhitelist={['*']}
                                mixedContentMode="always"
                                allowsInlineMediaPlayback={true}
                                userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                            />
                        </>
                    )}

                    {/* ── Replace Resume FAB ────────────────────────────── */}
                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: COLORS.primary }]}
                        onPress={handleResumeUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="repeat" size={20} color="white" />
                                <Text style={styles.fabText}>Replace Resume</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                /* ── No Resume Uploaded ──────────────────────────────────── */
                <View style={[styles.centerView, { backgroundColor: COLORS.background }]}>
                    <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                        <Ionicons name="document-text-outline" size={52} color={COLORS.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>
                        No Resume Yet
                    </Text>
                    <Text style={[styles.errorSub, { color: COLORS.textSecondary }]}>
                        Upload your CV so recruiters can find you faster.
                    </Text>
                    <View style={{ width: '100%', paddingHorizontal: 32, marginTop: 8 }}>
                        <ModernButton title="Upload Resume" onPress={handleResumeUpload} loading={uploading} />
                        <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 12, color: COLORS.textTertiary }}>
                            PDF or DOCX · 300 kb not more than that
                        </Text>
                    </View>
                </View>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    navBtn: { padding: 4 },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    loader: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    centerView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 12,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 4,
        letterSpacing: -0.3,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 4,
        letterSpacing: -0.3,
    },
    errorSub: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },
    errorBtns: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 11,
        borderRadius: 20,
        gap: 6,
    },
    pillText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    directLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 16,
        paddingHorizontal: 16,
        maxWidth: '90%',
    },
    directLinkText: {
        fontSize: 11,
        flex: 1,
        textDecorationLine: 'underline',
    },
    fab: {
        position: 'absolute',
        bottom: 28,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 13,
        borderRadius: 30,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        gap: 8,
    },
    fabText: { color: 'white', fontSize: 15, fontWeight: '700' },
});

export default ResumeViewerScreen;
