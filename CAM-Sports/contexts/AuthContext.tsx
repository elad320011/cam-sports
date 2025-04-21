import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '@/utils/axios';
import axiosInstance from '@/utils/axios';

type User = {
  email: string;
  full_name: string;
  user_type: string;
  calendar_id: string;
  team_id: string;
};

type AuthData = {
  access_token: string;
  refresh_token: string;
  user: User;
};

type AuthContextType = {
  user: User | null;
  login: (data: AuthData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedUser, accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('refresh_token')
      ]);
      
      if (storedUser && accessToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setAuthToken(accessToken);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      // Clear any partially stored data on error
      await AsyncStorage.multiRemove(['user', 'access_token', 'refresh_token']);
      setUser(null);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: AuthData) => {
    try {
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthToken(data.access_token);
      setUser(data.user);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
      
      setAuthToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
