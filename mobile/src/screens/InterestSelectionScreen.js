import React, { useState, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    TextInput,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
    FadeInDown, 
    FadeInRight, 
    Layout,
    ZoomIn
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LIGHT_COLORS, DARK_COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import ScreenWrapper from '../components/ScreenWrapper';
import PremiumButton from '../components/PremiumButton';
import api from '../services/api';

const { width } = Dimensions.get('window');

const INTEREST_CATEGORIES = [
    { id: 'tech', label: 'Technology', icon: 'code-slash', color: '#6366F1' },
    { id: 'design', label: 'Design', icon: 'color-palette', color: '#EC4899' },
    { id: 'marketing', label: 'Marketing', icon: 'megaphone', color: '#F59E0B' },
    { id: 'sales', label: 'Sales', icon: 'trending-up', color: '#10B981' },
    { id: 'finance', label: 'Finance', icon: 'wallet', color: '#06B6D4' },
    { id: 'healthcare', label: 'Healthcare', icon: 'medkit', color: '#EF4444' },
    { id: 'education', label: 'Education', icon: 'school', color: '#8B5CF6' },
    { id: 'engineering', label: 'Engineering', icon: 'construct', color: '#64748B' },
    { id: 'hr', label: 'HR', icon: 'people', color: '#F43F5E' },
    { id: 'support', label: 'Support', icon: 'headset', color: '#3B82F6' },
    { id: 'management', label: 'Management', icon: 'briefcase', color: '#0F172A' },
    { id: 'others', label: 'Others', icon: 'apps', color: '#14B8A6' },
];

const InterestSelectionScreen = ({ navigation, route }) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
    
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const filteredCategories = useMemo(() => {
        return INTEREST_CATEGORIES.filter(cat => 
            cat.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const toggleInterest = (id) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (selectedInterests.includes(id)) {
            setSelectedInterests(prev => prev.filter(item => item !== id));
        } else {
            setSelectedInterests(prev => [...prev, id]);
        }
    };

    const handleContinue = async () => {
        if (selectedInterests.length < 3) return;
        
        try {
            setLoading(true);
            const res = await api.put('/candidates/me', { interests: selectedInterests });
            if (res.data.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // If it's part of onboarding, go to Home. If from settings, go back.
                if (route.params?.fromOnboarding) {
                    navigation.replace('MainTabs');
                } else {
                    navigation.goBack();
                }
            }
        } catch (error) {
            console.error('Update Interests Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bottom={false}>
            <View style={styles.container}>
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
                    <Text style={[styles.title, { color: COLORS.textPrimary }]}>Choose Your Interests</Text>
                    <Text style={[styles.subtitle, { color: COLORS.textSecondary }]}>
                        Select at least 3 categories to personalize your job feed.
                    </Text>
                </Animated.View>

                {/* Search */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.searchContainer}>
                    <View style={[styles.searchBox, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                        <Ionicons name="search" size={20} color={COLORS.textTertiary} />
                        <TextInput
                            style={[styles.searchInput, { color: COLORS.textPrimary }]}
                            placeholder="Search categories..."
                            placeholderTextColor={COLORS.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>

                {/* Grid */}
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.grid}
                >
                    <View style={styles.gridRow}>
                        {filteredCategories.map((cat, index) => {
                            const isSelected = selectedInterests.includes(cat.id);
                            return (
                                <Animated.View 
                                    key={cat.id}
                                    entering={FadeInRight.delay(index * 50).springify()}
                                    layout={Layout.springify()}
                                >
                                    <TouchableOpacity 
                                        style={[
                                            styles.card, 
                                            { 
                                                backgroundColor: COLORS.surface,
                                                borderColor: isSelected ? cat.color : COLORS.border,
                                                shadowColor: isSelected ? cat.color : '#000',
                                            },
                                            isSelected && styles.selectedCard
                                        ]}
                                        onPress={() => toggleInterest(cat.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[
                                            styles.iconContainer, 
                                            { backgroundColor: isSelected ? cat.color : cat.color + '15' }
                                        ]}>
                                            <Ionicons 
                                                name={cat.icon} 
                                                size={24} 
                                                color={isSelected ? '#FFF' : cat.color} 
                                            />
                                        </View>
                                        <Text style={[
                                            styles.cardLabel, 
                                            { color: isSelected ? COLORS.textPrimary : COLORS.textSecondary }
                                        ]}>
                                            {cat.label}
                                        </Text>
                                        {isSelected && (
                                            <Animated.View entering={ZoomIn} style={[styles.checkBadge, { backgroundColor: cat.color }]}>
                                                <Ionicons name="checkmark" size={12} color="#FFF" />
                                            </Animated.View>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={[styles.footer, { backgroundColor: COLORS.background }]}>
                    <View style={styles.selectionCount}>
                        <Text style={[styles.countText, { color: COLORS.textSecondary }]}>
                            {selectedInterests.length} selected
                        </Text>
                        {selectedInterests.length < 3 && (
                            <Text style={[styles.neededText, { color: COLORS.danger }]}>
                                Need {3 - selectedInterests.length} more
                            </Text>
                        )}
                    </View>
                    <PremiumButton
                        title={loading ? "Saving..." : (selectedInterests.length < 3 ? "Select at least 3" : "Continue")}
                        onPress={handleContinue}
                        disabled={selectedInterests.length < 3 || loading}
                        loading={loading}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        marginBottom: SIZES.xl,
    },
    title: {
        ...TYPOGRAPHY.h1,
        marginBottom: SIZES.sm,
    },
    subtitle: {
        ...TYPOGRAPHY.bodyMedium,
        lineHeight: 22,
    },
    searchContainer: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.xl,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        borderRadius: 20,
        borderWidth: 1.5,
        ...SHADOWS.low,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '600',
    },
    grid: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 150,
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: (width - 48) / 2,
        marginBottom: 16,
        padding: 20,
        borderRadius: 24,
        borderWidth: 2,
        alignItems: 'center',
        ...SHADOWS.low,
    },
    selectedCard: {
        ...SHADOWS.medium,
        transform: [{ scale: 1.02 }],
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '800',
        textAlign: 'center',
    },
    checkBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SIZES.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : SIZES.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    selectionCount: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    countText: {
        fontSize: 14,
        fontWeight: '700',
    },
    neededText: {
        fontSize: 14,
        fontWeight: '800',
    }
});

export default InterestSelectionScreen;
