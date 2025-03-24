import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Platform, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '@/utils/axios';
import { useRouter } from 'expo-router';

const DateTimePickerComponent = Platform.OS === 'web' ? null : DateTimePicker;

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('player');
  const [teamCode, setTeamCode] = useState('');  // For player/management registration
  const [registeredTeamCode, setRegisteredTeamCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [teamId, setTeamId] = useState('');
  const [role, setRole] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');
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
      } else if (userType === 'player') {
        // Validate all required fields
        if (!username || !password || !role || !birthDate || !weight || !height || !email) {
          setErrorMessage('All fields are required');
          return;
        }

        // Add basic email validation
        if (!email.includes('@') || !email.includes('.')) {
          setErrorMessage('Please enter a valid email address');
          return;
        }

        const response = await axiosInstance.post('/auth/register', {
          username,
          password,
          email,
          user_type: userType,
          team_code: teamCode,
          role,
          birth_date: birthDate,
          weight: parseFloat(weight),
          height: parseFloat(height)
        });
        
        if (response.data.redirect) {
          router.push('/login');
        }
      } else if (userType === 'management') {
        // Update management validation
        if (!username || !password || !email) {
          setErrorMessage('Username, password and email are required');
          return;
        }

        if (!email.includes('@') || !email.includes('.')) {
          setErrorMessage('Please enter a valid email address');
          return;
        }

        const response = await axiosInstance.post('/auth/register', {
          username,
          password,
          email,
          user_type: userType,
          team_code: teamCode
        });
        
        if (response.data.redirect) {
          router.push('/login');
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false); // Hide the picker after selection
    setDate(currentDate);
    // Format date as YYYY-MM-DD
    const formattedDate = currentDate.toISOString().split('T')[0];
    setBirthDate(formattedDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
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
              setTeamId(text.toUpperCase());
              setErrorMessage('');
            }}
            autoCapitalize="characters"
            maxLength={10}
          />
          <Text style={styles.helperText}>
            This ID will be used as your team code for players and staff to join.
          </Text>
        </>
      ) : userType === 'player' ? (
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
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
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
              setTeamCode(text.toUpperCase());
              setErrorMessage('');
            }}
            autoCapitalize="characters"
            maxLength={6}
          />
          <Picker
            selectedValue={role}
            style={styles.picker}
            onValueChange={(itemValue: string) => setRole(itemValue)}
          >
            <Picker.Item label="Select Position" value="" />
            <Picker.Item label="Outside Hitter" value="Outside Hitter" />
            <Picker.Item label="Middle Blocker" value="Middle Blocker" />
            <Picker.Item label="Opposite Hitter" value="Opposite Hitter" />
            <Picker.Item label="Setter" value="Setter" />
            <Picker.Item label="Libero" value="Libero" />
            <Picker.Item label="Defensive Specialist" value="Defensive Specialist" />
          </Picker>

          <Text style={styles.inputLabel}>Birth Date:</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 12,
                paddingHorizontal: 8,
                width: '100%'
              }}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
            />
          ) : (
            <>
              <Pressable 
                style={[styles.input, styles.dateInput]} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={birthDate ? styles.dateText : styles.placeholderText}>
                  {birthDate || 'Select Birth Date'}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
        </>
      ) : userType === 'management' ? (
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
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
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
              setTeamCode(text.toUpperCase());
              setErrorMessage('');
            }}
            autoCapitalize="characters"
            maxLength={6}
          />
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
              setTeamCode(text.toUpperCase());
              setErrorMessage('');
            }}
            autoCapitalize="characters"
            maxLength={6}
          />
        </>
      )}

      {!registeredTeamCode && (
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
      ) : null}
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
    height: 40,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
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
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    color: '#000',
    fontSize: 16,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
});
