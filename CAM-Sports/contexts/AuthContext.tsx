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

const STORAGE_KEYS = {
  USER: 'user',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const validateUser = (user: any): user is User => {
  return (
    user &&
    typeof user === 'object' &&
    typeof user.email === 'string' &&
    typeof user.full_name === 'string' &&
    typeof user.user_type === 'string' &&
    typeof user.calendar_id === 'string' &&
    typeof user.team_id === 'string'
  );
};

const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedUser, accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      ]);
      
      if (!storedUser || !accessToken) {
        await clearAuthData();
        setUser(null);
        setAuthToken(null);
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        if (!validateUser(userData)) {
          throw new Error('Invalid user data format');
        }
        setUser(userData);
        setAuthToken(accessToken);
      } catch (parseError) {
        console.error('Error parsing stored user data:', parseError);
        await clearAuthData();
        setUser(null);
        setAuthToken(null);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      await clearAuthData();
      setUser(null);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: AuthData) => {
    try {
      if (!validateUser(data.user)) {
        throw new Error('Invalid user data format');
      }

      // Store data in parallel
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
      ]);
      
      setAuthToken(data.access_token);
      setUser(data.user);
    } catch (error) {
      console.error('Error storing auth data:', error);
      await clearAuthData();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearAuthData();
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
