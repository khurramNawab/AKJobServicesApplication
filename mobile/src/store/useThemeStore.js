import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useThemeStore = create(
    persist(
        (set) => ({
            isDarkMode: false, // The active mode used by components
            candidateDarkMode: false, // Persisted candidate preference
            recruiterDarkMode: false, // Persisted recruiter preference (default light)
            currentRole: 'CANDIDATE',
            
            toggleTheme: () => set((state) => {
                const newMode = !state.isDarkMode;
                if (state.currentRole === 'RECRUITER') {
                    return { isDarkMode: newMode, recruiterDarkMode: newMode };
                }
                return { isDarkMode: newMode, candidateDarkMode: newMode };
            }),

            setRole: (role) => set((state) => ({
                currentRole: role || 'CANDIDATE',
                isDarkMode: (role === 'RECRUITER' ? state.recruiterDarkMode : state.candidateDarkMode) || false
            })),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Map the persisted state to our new structure if it's old
            migrate: (persistedState, version) => {
                if (version === 0 && persistedState && typeof persistedState.isDarkMode === 'boolean') {
                    return {
                        ...persistedState,
                        candidateDarkMode: persistedState.isDarkMode,
                        recruiterDarkMode: false, // Default recruiters to light
                        currentRole: 'CANDIDATE'
                    };
                }
                return persistedState;
            },
            version: 1
        }
    )
);

