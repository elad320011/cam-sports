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
      const response = await axios.post('http://127.0.0.1:5000/auth/register', {
        username,
        password,
        user_type: userType,
      });
      if (response.data.redirect) {
        router.push('/(auth)/login');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
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
      <Picker
        selectedValue={userType}
        style={styles.input}
        onValueChange={(itemValue) => setUserType(itemValue)}
      >
        <Picker.Item label="Player" value="player" />
        <Picker.Item label="Coach" value="coach" />
        <Picker.Item label="Staff" value="staff" />
      </Picker>
      <Button title="Register" onPress={handleRegister} />
      <View style={styles.loginContainer}>
        <Button 
          title="Login" 
          onPress={() => router.push('/(auth)/login')} 
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
  error: {
    color: 'red',
    marginBottom: 12,
  },
  loginContainer: {
    marginTop: 12,
  },
});
