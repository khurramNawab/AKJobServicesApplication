import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { LIGHT_COLORS, DARK_COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import ModernButton from '../components/ModernButton';

const CreateJobScreen = ({ navigation }) => {
    const { isDarkMode } = useThemeStore();
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        skills: '', 
        location: '',
        type: 'Full-time',
        minSalary: '',
        maxSalary: ''
    });

    const handleInputChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const setJobType = (type) => {
        setFormData({ ...formData, type });
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
            }

            const res = await api.post('/jobs', payload);

            if (res.data.success) {
                Alert.alert('Success!', 'Your job posting is now live and visible to candidates.');
                navigation.goBack();
            }
        } catch (error) {
            console.log('Error posting job:', error.response?.data?.message || error.message);
            Alert.alert('Post Failed', error.response?.data?.message || 'Something went wrong while publishing your job.');
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, icon, ...props }) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.textPrimary }]}>{label}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                <Ionicons name={icon} size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, { color: COLORS.textPrimary }]}
                    placeholderTextColor={COLORS.textTertiary}
                    {...props}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
                <TouchableOpacity style={[styles.closeBtn, { backgroundColor: COLORS.background }]} onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>New Posting</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.section}>
                        <Text style={[styles.sectionHeading, { color: COLORS.primary }]}>Job Details</Text>
                        
                        <InputField 
                            label="Job Title *" 
                            icon="briefcase-outline"
                            placeholder="e.g. Senior Software Engineer"
                            value={formData.title}
                            onChangeText={(text) => handleInputChange('title', text)}
                        />

                        <InputField 
                            label="Location *" 
                            icon="location-outline"
                            placeholder="e.g. Remote or New York, NY"
                            value={formData.location}
                            onChangeText={(text) => handleInputChange('location', text)}
                        />

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textPrimary }]}>Job Type</Text>
                            <View style={styles.typeSwitcher}>
                                {['Full-time', 'Part-time', 'Contract', 'Intern'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeOption, 
                                            { backgroundColor: COLORS.background, borderColor: COLORS.border },
                                            formData.type === type && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                                        ]}
                                        onPress={() => setJobType(type)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[
                                            styles.typeOptionText, 
                                            { color: COLORS.textSecondary },
                                            formData.type === type && { color: COLORS.white }
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionHeading, { color: COLORS.primary }]}>Compensation & Skills</Text>
                        
                        <View style={styles.salaryRow}>
                            <View style={{ flex: 1 }}>
                                <InputField 
                                    label="Min Salary ($)" 
                                    icon="wallet-outline"
                                    placeholder="80,000"
                                    keyboardType="numeric"
                                    value={formData.minSalary}
                                    onChangeText={(text) => handleInputChange('minSalary', text)}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <InputField 
                                    label="Max Salary ($)" 
                                    icon="cash-outline"
                                    placeholder="120,000"
                                    keyboardType="numeric"
                                    value={formData.maxSalary}
                                    onChangeText={(text) => handleInputChange('maxSalary', text)}
                                />
                            </View>
                        </View>

                        <InputField 
                            label="Required Skills (Comma separated)" 
                            icon="code-working-outline"
                            placeholder="React, TypeScript, Node.js"
                            value={formData.skills}
                            onChangeText={(text) => handleInputChange('skills', text)}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionHeading, { color: COLORS.primary }]}>Role Description</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: COLORS.textPrimary }]}>Job Description *</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="Describe the role and responsibilities..."
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
                                style={[styles.textArea, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.textPrimary }]}
                                placeholder="List required experience, certifications, etc."
                                placeholderTextColor={COLORS.textTertiary}
                                multiline
                                numberOfLines={4}
                                value={formData.requirements}
                                onChangeText={(text) => handleInputChange('requirements', text)}
                            />
                        </View>
                    </View>

                    <ModernButton 
                        title="Publish Job Posting"
                        onPress={handleSubmit}
                        loading={loading}
                        style={styles.submitBtn}
                    />

                    <View style={{ height: 40 }} />
                </ScrollView>
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
        paddingHorizontal: SIZES.lg,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    scrollContent: {
        padding: SIZES.lg,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeading: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    textArea: {
        borderRadius: 16,
        padding: 16,
        height: 140,
        textAlignVertical: 'top',
        fontSize: 15,
        borderWidth: 1,
        fontWeight: '600',
    },
    typeSwitcher: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    typeOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    typeOptionText: {
        fontSize: 13,
        fontWeight: '700',
    },
    salaryRow: {
        flexDirection: 'row',
    },
    submitBtn: {
        marginTop: 10,
        height: 60,
    }
});

export default CreateJobScreen;

