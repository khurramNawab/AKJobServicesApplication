import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';

/**
 * API CONFIGURATION
 *
 * ─── HOW TO FIND YOUR PC's IP ─────────────────────────────────────────────
 * Windows: open CMD → type  ipconfig  → look for "IPv4 Address" under your
 *           active Wi-Fi adapter (e.g. 192.168.1.5)
 * Mac/Linux: open Terminal → type  ifconfig  → look for "inet" on en0/wlan0
 *
 * ─── RULES ────────────────────────────────────────────────────────────────
 * Android Emulator : use  10.0.2.2        (emulator alias for localhost)
 * iOS Simulator    : use  localhost
 * Physical device  : use your PC's Wi-Fi IP (e.g. 192.168.x.x)
 *                    ⚠️  Phone and PC MUST be on the SAME Wi-Fi network!
 * ──────────────────────────────────────────────────────────────────────────
 */

// ✏️  SET THIS to your PC's Wi-Fi IP address when testing on a physical device
const DEV_IP = '192.168.0.233'; // ✅ confirmed from Metro: exp://192.168.0.233:8081

const BASE_URL =
    Platform.OS === 'android'
        ? `http://${DEV_IP}:5050/api/v1`   // physical Android OR emulator (change DEV_IP accordingly)
        : `http://${DEV_IP}:5050/api/v1`;  // physical iOS  (use DEV_IP, NOT localhost, on real device)

const api = axios.create({
    baseURL: BASE_URL,
    // Note: Do NOT set a global Content-Type here. 
    // Axios will automatically set 'application/json' for objects 
    // and correctly handle 'multipart/form-data' for FormData.
    headers: {
        'Accept': 'application/json',
    },
    // 60 seconds — needed for multipart file uploads to Cloudinary
    timeout: 60000,
});

// Intercept requests to add token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (e) {
            console.error('Error fetching token from storage', e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercept responses for global error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Global logout on unauthorized (token expired/invalid)
            useAuthStore.getState().logout();
        }
        
        // Log detailed error for debugging
        if (__DEV__) {
            console.warn(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;
