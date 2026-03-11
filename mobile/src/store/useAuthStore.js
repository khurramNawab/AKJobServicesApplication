import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: true,

    // Actions
    setCredentials: async (user, token) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(user));
            set({ user, token, isLoading: false });
        } catch (e) {
            console.error('Error saving credentials:', e);
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userInfo');
            set({ user: null, token: null, isLoading: false });
        } catch (e) {
            console.error('Error removing credentials:', e);
        }
    },

    loadCredentials: async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (token && userInfoStr) {
                set({ user: JSON.parse(userInfoStr), token, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (e) {
            console.error('Error loading credentials:', e);
            set({ isLoading: false });
        }
    }
}));
