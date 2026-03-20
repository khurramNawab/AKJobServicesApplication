import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';

/**
 * RESUME VIEWER SCREEN
 * 
 * Production-ready PDF/Doc viewer using WebView.
 * On Android, we use Google Docs Viewer as a proxy to render PDFs.
 */
const ResumeViewerScreen = ({ route, navigation }) => {
    const { resumeUrl, title } = route.params;
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    // Cache-buster to force fresh load
    const freshUrl = resumeUrl + (resumeUrl?.includes('?') ? '&' : '?') + 't=' + new Date().getTime();

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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            
            <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>{title || 'Resume Viewer'}</Text>
                
                <TouchableOpacity onPress={handleOpenExternal} style={styles.externalButton} disabled={!resumeUrl}>
                    <Ionicons name="share-outline" size={24} color={resumeUrl ? COLORS.primary : COLORS.textTertiary} />
                </TouchableOpacity>
            </View>

            {resumeUrl ? (
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
            ) : (
                <View style={styles.emptyView}>
                    <Ionicons name="document-text-outline" size={80} color={COLORS.textTertiary} />
                    <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No resume URL provided.</Text>
                </View>
            )}
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
    }
});

export default ResumeViewerScreen;
