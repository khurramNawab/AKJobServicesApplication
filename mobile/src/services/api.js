import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
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
const DEV_IP = '10.0.2.2'; // ✅ updated to 10.0.2.2 for Android Emulator

const PROD_URL = 'https://akjobservices.com/api/v1';
const DEV_URL = `http://${DEV_IP}:5001/api/v1`;

// Automatically switch BASE_URL based on environment variables or dev status
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? DEV_URL : PROD_URL);

const api = axios.create({
    baseURL: BASE_URL,
    // Note: Do NOT set a global Content-Type here. 
    // Axios will automatically set 'application/json' for objects 
    // and correctly handle 'multipart/form-data' for FormData.
    headers: {
        'Accept': 'application/json',
        'x-client-type': 'mobile'
    },
    // 60 seconds — needed for multipart file uploads to Cloudinary
    timeout: 60000,
});

// Intercept requests to add token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
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

// Intercept responses for global error handling and automatic token refreshing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Never retry auth endpoints — avoids infinite loops
            if (
                originalRequest.url?.includes('/auth/refresh-token') ||
                originalRequest.url?.includes('/auth/login')
            ) {
                // Only logout if the refresh token endpoint itself failed
                if (originalRequest.url?.includes('/auth/refresh-token')) {
                    await useAuthStore.getState().logout();
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');

                // ⚠️  No refresh token stored = old session or guest — don't logout,
                //     just let the request fail gracefully so the UI can handle it.
                if (!storedRefreshToken) {
                    isRefreshing = false;
                    processQueue(null, null);
                    return Promise.reject(error);
                }

                // Use a plain axios call (not the intercepted `api`) to avoid recursion
                const response = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh-token`,
                    { refreshToken: storedRefreshToken },
                    {
                        headers: {
                            'x-client-type': 'mobile',
                            'Accept': 'application/json'
                        }
                    }
                );

                if (response.data?.success) {
                    const { accessToken, refreshToken, user } = response.data;
                    await useAuthStore.getState().setCredentials(user, accessToken, refreshToken);

                    processQueue(null, accessToken);

                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } else {
                    throw new Error('Token refresh response unsuccessful');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Only force logout if the refresh token was sent but rejected by server
                const storedToken = await SecureStore.getItemAsync('refreshToken').catch(() => null);
                if (storedToken) {
                    await useAuthStore.getState().logout();
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Log detailed error for debugging (non-auth errors)
        if (__DEV__) {
            console.warn(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
