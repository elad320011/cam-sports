import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '@/utils/axios';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('player');
  const [teamCode, setTeamCode] = useState('');  // For player/management registration
  const [registeredTeamCode, setRegisteredTeamCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [teamId, setTeamId] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      if (userType === 'team') {
        if (!teamId) {
          setErrorMessage('Team ID is required');
          return;
        }

        const response = await axiosInstance.post('/auth/register', {
          user_type: 'team',
          team_id: teamId
        });
        
        if (response.data.team_code) {
          setRegisteredTeamCode(response.data.team_code);
        }
      } else {
        // Handle player/management registration
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

        if (!teamCode) {
          setErrorMessage('Team code is required');
          return;
        }

        const response = await axiosInstance.post('/auth/register', {
          username,
          password,
          user_type: userType,
          team_code: teamCode
        });
        
        if (response.data.redirect) {
          router.push('/login');
        }
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Register as:</Text>
        <Picker
          selectedValue={userType}
          style={styles.picker}
          onValueChange={(itemValue: string) => setUserType(itemValue)}
        >
          <Picker.Item label="Player" value="player" />
          <Picker.Item label="Management" value="management" />
          <Picker.Item label="Team" value="team" />
        </Picker>
      </View>

      {userType === 'team' ? (
        <>
          <TextInput
            style={[styles.input, errorMessage ? styles.inputError : null]}
            placeholder="Enter Team ID"
            value={teamId}
            onChangeText={(text) => {
              setTeamId(text.toUpperCase());  // Convert to uppercase
              setErrorMessage('');
            }}
            autoCapitalize="characters"
            maxLength={10}  // Or whatever maximum length you want to allow
          />
          <Text style={styles.helperText}>
            This ID will be used as your team code for players and staff to join.
          </Text>
        </>
      ) : (
        <>
          <TextInput
            style={[styles.input, errorMessage ? styles.inputError : null]}
            placeholder="Username (min 3 characters)"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrorMessage('');
            }}
          />
          <TextInput
            style={[styles.input, errorMessage ? styles.inputError : null]}
            placeholder="Password (min 6 characters)"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrorMessage('');
            }}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Team Code"
            value={teamCode}
            onChangeText={(text) => {
              setTeamCode(text.toUpperCase());  // Automatically convert to uppercase
              setErrorMessage('');
            }}
            autoCapitalize="characters"  // Force uppercase input
            maxLength={6}  // Limit to 6 characters
          />
        </>
      )}

      {registeredTeamCode ? (
        <View style={styles.teamCodeContainer}>
          <Text style={styles.teamCodeLabel}>Your Team Code:</Text>
          <Text style={styles.teamCode}>{registeredTeamCode}</Text>
          <Text style={styles.teamCodeInstructions}>
            Share this code with your team members for registration.{'\n'}
            They will use this code to join your team.
          </Text>
          <View style={styles.buttonContainer}>
            <Button 
              title="Proceed to Login" 
              onPress={() => router.push('/login')} 
            />
          </View>
        </View>
      ) : (
        <>
          <Button title="Register" onPress={handleRegister} />
          <View style={styles.loginContainer}>
            <Button 
              title="Back to Login" 
              onPress={() => router.push('/login')} 
            />
          </View>
        </>
      )}
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
  },
  teamCodeContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e6ffe6',
    borderRadius: 8,
    alignItems: 'center',
  },
  teamCodeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  teamCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006600',
    marginBottom: 8,
  },
  teamCodeInstructions: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  teamInstructions: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
