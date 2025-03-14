import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Picker } from 'react-native';
import axios from 'axios';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('player');
  const [teamName, setTeamName] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/register', {
        username,
        password,
        user_type: userType,
        team_name: userType === 'team_owner' ? teamName : undefined,
      });
      alert(response.data.message);
    } catch (error) {
      alert('Registration failed');
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
      <Picker
        selectedValue={userType}
        style={styles.input}
        onValueChange={(itemValue) => setUserType(itemValue)}
      >
        <Picker.Item label="Player" value="player" />
        <Picker.Item label="Coach" value="coach" />
        <Picker.Item label="Staff" value="staff" />
        <Picker.Item label="Team Owner" value="team_owner" />
      </Picker>
      {userType === 'team_owner' && (
        <TextInput
          style={styles.input}
          placeholder="Team Name"
          value={teamName}
          onChangeText={setTeamName}
        />
      )}
      <Button title="Register" onPress={handleRegister} />
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
});
