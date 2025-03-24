import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Picker } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('player');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      // Client-side validation
      if (!username || !password) {
        setErrorMessage('Username and password are required');
        return;
      }

      if (username.length < 3) {
        setErrorMessage('Username must be at least 3 characters long');
        return;
      }

      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        return;
      }

      const response = await axios.post('http://127.0.0.1:5000/auth/register', {
        username,
        password,
        user_type: userType,
      });
      
      if (response.data.redirect) {
        router.push('/login');
      }
    } catch (error: any) { // Type assertion to handle AxiosError
      setErrorMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TextInput
        style={[styles.input, errorMessage ? styles.inputError : null]}
        placeholder="Username (min 3 characters)"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setErrorMessage(''); // Clear error when user types
        }}
      />
      <TextInput
        style={[styles.input, errorMessage ? styles.inputError : null]}
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrorMessage(''); // Clear error when user types
        }}
        secureTextEntry
      />
      <Picker
        selectedValue={userType}
        style={styles.input}
        onValueChange={(itemValue: string) => setUserType(itemValue)}
      >
        <Picker.Item label="Player" value="player" />
        <Picker.Item label="Coach" value="coach" />
        <Picker.Item label="Staff" value="staff" />
      </Picker>
      <Button title="Register" onPress={handleRegister} />
      <View style={styles.loginContainer}>
        <Button 
          title="Back to Login" 
          onPress={() => router.push('/login')} 
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
  inputError: {
    borderColor: 'red',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginContainer: {
    marginTop: 12,
  },
});
