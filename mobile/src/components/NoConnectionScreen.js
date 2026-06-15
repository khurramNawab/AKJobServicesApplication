import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const NoConnectionScreen = ({ onRetry }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                
                {/* Illustration Placeholder (mimicking the attached image) */}
                <View style={styles.illustrationContainer}>
                    {/* Background abstract shapes */}
                    <View style={styles.circleBg} />
                    <View style={styles.triangleBlue} />
                    <View style={styles.triangleYellow} />
                    <View style={styles.triangleRed} />
                    
                    {/* Cloud and Phone */}
                    <Ionicons name="cloudy-night" size={80} color="#FFD700" style={styles.cloudIcon} />
                    <Ionicons name="flash" size={30} color="#FF3B30" style={styles.lightningIcon} />
                    
                    <View style={styles.phoneMockup}>
                        <View style={styles.signalBars}>
                            <View style={[styles.bar, styles.bar1]} />
                            <View style={[styles.bar, styles.bar2]} />
                            <View style={[styles.bar, styles.bar3]} />
                            <View style={[styles.bar, styles.bar4]} />
                        </View>
                    </View>
                </View>

                {/* Text Content */}
                <Text style={styles.title}>No connection</Text>
                <Text style={styles.subtitle}>
                    Please check your internet connectivity{'\n'}and try again
                </Text>

                {/* Retry Button */}
                <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        backgroundColor: '#FFFFFF',
        zIndex: 9999, // Ensure it covers everything
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 30,
        width: '100%',
        marginTop: -50,
    },
    illustrationContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    circleBg: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#F0F0F0',
        bottom: 20,
    },
    triangleBlue: {
        position: 'absolute',
        bottom: 20,
        right: 10,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 30,
        borderRightWidth: 30,
        borderBottomWidth: 40,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#2D68F8',
    },
    triangleYellow: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 20,
        borderRightWidth: 20,
        borderBottomWidth: 30,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FFD700',
    },
    triangleRed: {
        position: 'absolute',
        bottom: 20,
        left: 10,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderBottomWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FF3B30',
    },
    cloudIcon: {
        position: 'absolute',
        top: 10,
    },
    lightningIcon: {
        position: 'absolute',
        top: 70,
    },
    phoneMockup: {
        position: 'absolute',
        bottom: 15,
        width: 60,
        height: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signalBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 20,
        gap: 3,
    },
    bar: {
        width: 4,
        borderRadius: 2,
    },
    bar1: { height: 6, backgroundColor: '#FF3B30' },
    bar2: { height: 10, backgroundColor: '#D1D5DB' },
    bar3: { height: 15, backgroundColor: '#D1D5DB' },
    bar4: { height: 20, backgroundColor: '#D1D5DB' },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#2D68F8',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default NoConnectionScreen;
