import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { BACKEND_URL } from '@/globalVariables';

// Replace 192.168.1.X with your actual local IP address
const BASE_URL = __DEV__
  ? BACKEND_URL  // For development (Expo Go): https://test.terasky-devops.com
  // or 'http://10.0.2.2:5000' // For Android emulator
  // or 'http://YOUR_LOCAL_IP:5000' // For physical device (e.g., 192.168.1.100:5000)
  : 'https://test.terasky-devops.com';  // For production builds: use correct backend

const axiosInstance = axios.create({
  baseURL: BASE_URL
});

// Add this function to set auth header
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry token refresh for certain endpoints when getting 401
    // because 401 here means incorrect credentials, not expired token
    const isPasswordChangeEndpoint = originalRequest.url?.includes('/change-password');
    const isLoginEndpoint = originalRequest.url?.includes('/auth/login');
    const isRegisterEndpoint = originalRequest.url?.includes('/auth/register');
    const isGoogleAuthEndpoint = originalRequest.url?.includes('/auth/google');

    if (error.response?.status === 401 && !originalRequest._retry && 
        !isPasswordChangeEndpoint && !isLoginEndpoint && !isRegisterEndpoint && !isGoogleAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refresh_token = await AsyncStorage.getItem('refresh_token');
        if (!refresh_token) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refresh_token}` }
        });

        const { access_token, refresh_token: new_refresh_token } = response.data;

        await AsyncStorage.setItem('access_token', access_token);
        await AsyncStorage.setItem('refresh_token', new_refresh_token);

        setAuthToken(access_token);
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

        return axiosInstance(originalRequest);
      } catch (error) {
        // Clear stored tokens on refresh failure
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
