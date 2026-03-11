import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore'; // Will use directly if needed or pass token

const API_URL = 'http://192.168.0.233:5000/api/v1'; // Use 10.0.2.2 for Android Emulator, or 192.168.x.x for Physical Devices

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept requests to add token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept responses for global error handling (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // Depending on your refresh token implementation, you might want to call refresh here.
            // For now, if 401, we might consider logging the user out.
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default api;
