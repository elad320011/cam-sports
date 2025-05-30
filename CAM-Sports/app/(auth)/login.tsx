import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axios';
import { BACKEND_URL } from '@/globalVariables';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Google Auth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '223542901572-b48ip0f0766r7fsss60drs2tb02vqfvf.apps.googleusercontent.com', // Replace with your Expo client ID
    iosClientId: 'YOUR_IOS_CLIENT_ID', // Replace with your iOS client ID
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Replace with your Android client ID
    webClientId: '223542901572-b48ip0f0766r7fsss60drs2tb02vqfvf.apps.googleusercontent.com', // Replace with your Web client ID
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleLogin(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken: string) => {
    try {
      const response = await axiosInstance.post('/auth/google', {
        access_token: accessToken
      });

      if (response.data.needs_registration) {
        // User doesn't exist yet, redirect to complete profile
        router.push({
          pathname: '/complete-google-profile',
          params: {
            email: response.data.email,
            name: response.data.name,
            google_id: response.data.google_id
          }
        });
      } else {
        // User exists, log them in
        await login({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          user: response.data.user
        });
        router.replace('/');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Google login failed');
    }
  };

  const handleLogin = async () => {
    console.log('🚀 Login button pressed!');
    console.log('📧 Email:', email);
    console.log('🔒 Password length:', password.length);
    console.log('🌐 Backend URL:', BACKEND_URL);
    
    setIsLoading(true);
    try {
      if (!email || !password) {
        console.log('❌ Validation failed: Missing email or password');
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }

      console.log('📡 Making login request...');
      const response = await axiosInstance.post('/auth/login', {
        email: email.toLowerCase(),
        password
      });

      console.log('✅ Login response received:', response.status);
      console.log('📄 Response data:', response.data);

      await login({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        user: response.data.user
      });

      console.log('🎉 Login successful, redirecting...');
      router.replace('/');
    } catch (error: any) {
      console.log('❌ Login error:', error);
      console.log('📊 Error response:', error.response?.data);
      console.log('🔢 Error status:', error.response?.status);
      setError(error.response?.data?.message || `Login failed: ${BACKEND_URL}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.20)', 'rgba(255, 255, 255, 0)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0.5 }}
          style={styles.sunRays}
        />
        <Image
          source={require('@/assets/images/volleyball.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>CAM Sports</Text>
          </View>

          <View style={styles.formWrapper}>
            <LinearGradient
              colors={[colors.cardBackground, colors.cardBackgroundLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formContainer}
            >
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}

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
                  placeholderTextColor={colors.textSecondary}
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
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={() => promptAsync()}
                  disabled={!request}
                >
                  <Ionicons name="logo-google" size={20} color={colors.textPrimary} />
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => router.push('/register')}
                >
                  <Text style={styles.linkButtonText}>Don't have an account? Register</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sunRays: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  backgroundImage: {
    position: 'absolute',
    bottom: '-16%',
    left: '-90%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  formWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    overflow: 'hidden',
    zIndex: 10,
  },
  formContainer: {
    padding: 24,
    zIndex: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  buttonGroup: {
    gap: 16,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: colors.cardBackgroundMidLight,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  googleButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  linkButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
});
