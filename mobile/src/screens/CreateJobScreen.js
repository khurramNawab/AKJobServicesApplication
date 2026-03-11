import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { COLORS } from '../constants/theme';

const CreateJobScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        skills: '', // Will split by comma on submit
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
            Alert.alert('Error', 'Please fill in all required fields (Title, Description, Location).');
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
                Alert.alert('Success', 'Job posted successfully!');
                navigation.goBack();
            }
        } catch (error) {
            console.log('Error posting job:', error.response?.data?.message || error.message);
            Alert.alert('Posting Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post a Job</Text>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <Text style={styles.submitText}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Job Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Senior React Developer"
                        value={formData.title}
                        onChangeText={(text) => handleInputChange('title', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Remote, New York, etc."
                        value={formData.location}
                        onChangeText={(text) => handleInputChange('location', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Job Type</Text>
                    <View style={styles.pillContainer}>
                        {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.typePill, formData.type === type && styles.typePillActive]}
                                onPress={() => setJobType(type)}
                            >
                                <Text style={[styles.typeText, formData.type === type && styles.typeTextActive]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Min Salary ($)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 80000"
                            keyboardType="numeric"
                            value={formData.minSalary}
                            onChangeText={(text) => handleInputChange('minSalary', text)}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                        <Text style={styles.label}>Max Salary ($)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 120000"
                            keyboardType="numeric"
                            value={formData.maxSalary}
                            onChangeText={(text) => handleInputChange('maxSalary', text)}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Required Skills (Comma separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. React, Node.js, MongoDB"
                        value={formData.skills}
                        onChangeText={(text) => handleInputChange('skills', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Job Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe the role responsibilities..."
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        value={formData.description}
                        onChangeText={(text) => handleInputChange('description', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Requirements</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="List required experience, degrees, etc..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={formData.requirements}
                        onChangeText={(text) => handleInputChange('requirements', text)}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundLight,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60, // approximate status bar
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    submitButton: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    submitText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    formContainer: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: COLORS.textPrimary,
    },
    textArea: {
        height: 120,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    typePill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    typePillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    typeText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    typeTextActive: {
        color: COLORS.white,
        fontWeight: 'bold',
    }
});

export default CreateJobScreen;
