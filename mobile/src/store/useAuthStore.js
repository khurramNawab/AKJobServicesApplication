import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: true,

    // Actions
    setCredentials: async (user, token) => {
        try {
            await SecureStore.setItemAsync('userToken', token);
            await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
            set({ user, token, isLoading: false });
        } catch (e) {
            console.error('Error saving credentials:', e);
        }
    },

    logout: async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userInfo');
            set({ user: null, token: null, isLoading: false });
        } catch (e) {
            console.error('Error removing credentials:', e);
        }
    },

    setUser: async (user) => {
        try {
            await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
            set({ user });
        } catch (e) {
            console.error('Error updating userInfo in storage:', e);
        }
    },

    loadCredentials: async () => {
        console.log('[AuthStore] Loading credentials...');
        try {
            // Failsafe timer: Hide loading after 4 seconds regardless
            const storageTimer = setTimeout(() => {
                set({ isLoading: false });
                console.log('[AuthStore] Failsafe timeout reached');
            }, 4000);

            const token = await SecureStore.getItemAsync('userToken');
            const userInfoStr = await SecureStore.getItemAsync('userInfo');
            
            clearTimeout(storageTimer);
            
            if (token && userInfoStr) {
                try {
                    const user = JSON.parse(userInfoStr);
                    set({ user, token, isLoading: false });
                } catch (parseError) {
                    console.error('[AuthStore] Parse error:', parseError);
                    set({ isLoading: false });
                }
            } else {
                set({ isLoading: false });
            }
        } catch (e) {
            console.error('[AuthStore] Store load error:', e);
            set({ isLoading: false });
        } finally {
            // Guaranteed state update
            setTimeout(() => {
                set(state => {
                    if (state.isLoading) return { isLoading: false };
                    return {};
                });
            }, 500);
        }
    }
}));
