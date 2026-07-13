import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useThemeStore = create(
    persist(
        (set) => ({
            isDarkMode: false,
            currentRole: 'CANDIDATE',
            
            toggleTheme: () => set((state) => ({
                isDarkMode: !state.isDarkMode
            })),

            setRole: (role) => set((state) => ({
                currentRole: role || 'CANDIDATE'
            })),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
            version: 3
        }
    )
);

