import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axios';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError('Email and password are required');
        return;
      }

      const response = await axiosInstance.post('/auth/login', {
        email: email.toLowerCase(),
        password
      });

      await login({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        user: response.data.user
      });
      
      router.replace('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Welcome Back</Text>
          
          <View style={styles.formContainer}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleLogin}
              >
                <Text style={styles.primaryButtonText}>Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.linkButton} 
                onPress={() => router.push('/register')}
              >
                <Text style={styles.linkButtonText}>Don't have an account? Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    minHeight: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 1.5,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
    padding: 10,
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
  },
  buttonGroup: {
    gap: 16,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '500',
  },
});
