import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    ScrollView, 
    TouchableOpacity, 
    Alert,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';

// Premium Components
import ScreenWrapper from '../components/ScreenWrapper';
import PremiumButton from '../components/PremiumButton';
import PremiumInput from '../components/PremiumInput';
import EliteGradient from '../components/EliteGradient';

const { width } = Dimensions.get('window');

const CreateJobScreen = ({ route, navigation }) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const jobToEdit = route?.params?.job;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: jobToEdit?.title || '',
        description: jobToEdit?.description || '',
        requirements: jobToEdit?.requirements || '',
        skills: jobToEdit?.skills?.join(', ') || '', 
        location: jobToEdit?.location || '',
        type: jobToEdit?.type || 'Full-time',
        minSalary: jobToEdit?.salaryRange?.min ? String(jobToEdit.salaryRange.min) : '',
        maxSalary: jobToEdit?.salaryRange?.max ? String(jobToEdit.salaryRange.max) : ''
    });

    const handleInputChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description || !formData.location) {
            Alert.alert('Required Fields', 'Please fill in the Job Title, Description, and Location to continue.');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                title: formData.title,
                description: formData.description,
                requirements: formData.requirements,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                location: formData.location,
                type: formData.type,
            };

            if (formData.minSalary && formData.maxSalary) {
                payload.salaryRange = {
                    min: Number(formData.minSalary),
                    max: Number(formData.maxSalary)
                }
            } else {
                payload.salaryRange = 'Competitive';
            }

            let res;
            if (jobToEdit) {
                res = await api.put(`/jobs/${jobToEdit._id}`, payload);
            } else {
                res = await api.post('/jobs', payload);
            }

            if (res.data.success) {
                Alert.alert('Success!', jobToEdit ? 'Your job posting has been updated.' : 'Your job posting is now live and visible to candidates.');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Post job error:', error);
            const msg = error?.response?.data?.message || 'Something went wrong while publishing your job.';
            Alert.alert('Post Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bottom={false}>
            <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
                <TouchableOpacity 
                    style={[styles.headerBtn, { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border }]} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleArea}>
                    <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>{jobToEdit ? 'Edit Job Posting' : 'Post a Job'}</Text>
                    <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>{jobToEdit ? 'Modify your active listing' : 'Find your next elite hire'}</Text>
                </View>
                <View style={{ width: 48 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.section, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                        <Text style={[styles.sectionHeading, { color: COLORS.primary }]}>Basic Information</Text>
                        
                        <PremiumInput 
                            label="Job Title" 
                            placeholder="e.g. Senior Product Designer"
                            value={formData.title}
                            onChangeText={(text) => handleInputChange('title', text)}
                            iconLeft={<Ionicons name="briefcase-outline" size={20} color={COLORS.textTertiary} />}
                        />

                        <PremiumInput 
                            label="Location" 
                            placeholder="e.g. Remote or San Francisco, CA"
                            value={formData.location}
                            onChangeText={(text) => handleInputChange('location', text)}
                            iconLeft={<Ionicons name="location-outline" size={20} color={COLORS.textTertiary} />}
                        />

                        <View style={styles.typeContainer}>
                            <Text style={[styles.label, { color: COLORS.textPrimary }]}>Employment Type</Text>
                            <View style={styles.typeGrid}>
                                {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeBtn, 
                                            { backgroundColor: COLORS.surfaceSecondary, borderColor: COLORS.border },
                                            formData.type === type && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                                        ]}
                                        onPress={() => handleInputChange('type', type)}
                                    >
                                        <Text style={[
                                            styles.typeTxt, 
                                            { color: COLORS.textSecondary },
                                            formData.type === type && { color: '#FFF' }
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.section, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                        <Text style={[styles.sectionHeading, { color: COLORS.primary }]}>Compensation & Skills</Text>
                        
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <PremiumInput 
                                    label="Min Salary (₹)" 
                                    placeholder="80,000"
                                    keyboardType="numeric"
                                    value={formData.minSalary}
                                    onChangeText={(text) => handleInputChange('minSalary', text)}
                                />
                            </View>
                            <View style={{ width: 16 }} />
                            <View style={{ flex: 1 }}>
                                <PremiumInput 
                                    label="Max Salary (₹)" 
                                    placeholder="150,000"
                                    keyboardType="numeric"
                                    value={formData.maxSalary}
                                    onChangeText={(text) => handleInputChange('maxSalary', text)}
                                />
                            </View>
                        </View>

                        <PremiumInput 
                            label="Required Skills" 
                            placeholder="React, TypeScript, Figma..."
                            value={formData.skills}
                            onChangeText={(text) => handleInputChange('skills', text)}
                            iconLeft={<Ionicons name="code-working-outline" size={20} color={COLORS.textTertiary} />}
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.section, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                        <Text style={[styles.sectionHeading, { color: COLORS.primary }]}>Role Details</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textPrimary }]}>Job Description</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: COLORS.backgroundSecondary, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="Describe the mission and responsibilities..."
                                placeholderTextColor={COLORS.textTertiary}
                                multiline
                                numberOfLines={6}
                                value={formData.description}
                                onChangeText={(text) => handleInputChange('description', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textPrimary }]}>Candidate Requirements</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: COLORS.backgroundSecondary, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="Qualifications, experience, etc."
                                placeholderTextColor={COLORS.textTertiary}
                                multiline
                                numberOfLines={4}
                                value={formData.requirements}
                                onChangeText={(text) => handleInputChange('requirements', text)}
                            />
                        </View>
                    </Animated.View>

                    <PremiumButton 
                        title={jobToEdit ? "Save Changes" : "Publish Job Posting"}
                        onPress={handleSubmit}
                        loading={loading}
                        style={styles.publishBtn}
                    />
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    headerTitleArea: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    scrollContent: {
        padding: SIZES.lg,
    },
    section: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        marginBottom: 20,
        ...SHADOWS.soft,
    },
    sectionHeading: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    typeContainer: {
        marginTop: 10,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    typeTxt: {
        fontSize: 13,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
    },
    textArea: {
        borderRadius: 16,
        padding: 16,
        height: 120,
        textAlignVertical: 'top',
        fontSize: 15,
        borderWidth: 1,
        fontWeight: '600',
    },
    publishBtn: {
        height: 60,
        marginTop: 10,
    }
});

export default CreateJobScreen;
