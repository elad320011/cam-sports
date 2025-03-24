import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Add client-side validation
      if (!username || !password) {
        alert('Username and password are required');
        return;
      }

      const response = await axios.post('http://127.0.0.1:5000/auth/login', {
        username,
        password,
      });
      if (response.data.message === "Login successful") {
        router.push('/');  // Redirect to home page on successful login
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      // Show the error message from the server if available
      const errorMessage = error.response?.data?.message || 'Login failed';
      alert(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <View style={styles.registerContainer}>
        <Button 
          title="Register" 
          onPress={() => router.push('/(auth)/register')} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  registerContainer: {
    marginTop: 12,
  },
});
