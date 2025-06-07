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
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Google Auth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '223542901572-b48ip0f0766r7fsss60drs2tb02vqfvf.apps.googleusercontent.com', // Replace with your Expo client ID
    iosClientId: 'YOUR_IOS_CLIENT_ID', // Replace with your iOS client ID
    androidClientId: '223542901572-ltdj7a4hn9c1rvd0rlalkrjimntfia7b.apps.googleusercontent.com', // Replace with your Android client ID
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

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setError('');
    if (text.length > 0) {
      validatePassword(text);
    } else {
      setPasswordError('');
    }
  };

  const handleGoogleLogin = async (accessToken: string) => {
    try {
      const response = await axiosInstance.post('/auth/google', {
        access_token: accessToken
      });

      router.replace('/login'); // Redirect back

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
    setError('');
    setPasswordError('');
    
    try {
      if (!email || !password) {
        console.log('❌ Validation failed: Missing email or password');
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }

      // Validate email format
      if (!email.includes('@') || !email.includes('.')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Validate password length
      if (!validatePassword(password)) {
        setIsLoading(false);
        return;
      }

      console.log('📡 Making login request...');
      console.log('🔗 Login URL:', `${BACKEND_URL}/auth/login`);
      console.log('📦 Login payload:', { email: email.toLowerCase(), password: '***' });
      
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
      console.log('❌ Full error object:', JSON.stringify(error, null, 2));
      if (error.isAxiosError) {
        console.log('🔍 Axios error details:', error.toJSON ? error.toJSON() : error);
        console.log('🔗 Error config:', error.config);
        console.log('💬 Error message:', error.message);
      }
      console.log('📊 Error response:', error.response?.data);
      console.log('🔢 Error status:', error.response?.status);
      console.log('🏷️ Error code:', error.code);
      
      // Enhanced error handling for login
      let errorMessage = 'Login failed. Please try again.';
      
      // Check if we have a proper HTTP response with error data
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status) {
        // Handle specific HTTP status codes
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Invalid login credentials format';
            break;
          case 401:
            errorMessage = 'Incorrect email or password';
            break;
          case 404:
            errorMessage = 'No account found with this email address';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Login failed (Error ${error.response.status}). Please try again.`;
        }
      } else if (error.message) {
        // Handle axios/network errors
        if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else if (error.message.includes('No refresh token available')) {
          // This shouldn't happen anymore with our interceptor fix, but just in case
          errorMessage = 'Authentication error. Please try logging in again.';
        } else {
          errorMessage = `Connection error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
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
            <Text style={styles.title}>Welcome!</Text>
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
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {passwordError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                  <Text style={styles.error}>{passwordError}</Text>
                </View>
              )}

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
