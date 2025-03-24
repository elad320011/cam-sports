import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter, useSegments } from 'expo-router';
import { setAuthToken } from '@/utils/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check authentication and redirect accordingly
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, segments]);

  useEffect(() => {
    // Check for existing token on app start
    const initializeAuth = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        setAuthToken(token);
        setIsAuthenticated(true);
      }
    };
    initializeAuth();
  }, []);

  const login = async (tokens: { access_token: string; refresh_token: string }) => {
    await AsyncStorage.setItem('access_token', tokens.access_token);
    await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
    setAuthToken(tokens.access_token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    router.replace('/login');
  };

  const refreshTokens = async (): Promise<boolean> => {
    try {
      const refresh_token = await AsyncStorage.getItem('refresh_token');
      if (!refresh_token) return false;

      const response = await axios.post('http://127.0.0.1:5000/auth/refresh', {}, {
        headers: { Authorization: refresh_token }
      });

      await login(response.data);
      return true;
    } catch (error) {
      await logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, refreshTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 