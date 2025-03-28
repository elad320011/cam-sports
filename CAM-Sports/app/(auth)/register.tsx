import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Platform, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '@/utils/axios';
import { useRouter, Stack } from 'expo-router';
import { customizeAIAdvisor } from '@/services/aiAdvisorService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DateTimePickerComponent = Platform.OS === 'web' ? null : DateTimePicker;

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
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

  // Load saved data on component mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Save data when relevant fields change
  useEffect(() => {
    saveFormData();
  }, [fullName, userType, teamCode, teamId, role, birthDate, weight, height, email]);

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('registerFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFullName(parsedData.fullName || '');
        setUserType(parsedData.userType || 'player');
        setTeamCode(parsedData.teamCode || '');
        setTeamId(parsedData.teamId || '');
        setRole(parsedData.role || '');
        setBirthDate(parsedData.birthDate || '');
        setWeight(parsedData.weight || '');
        setHeight(parsedData.height || '');
        setEmail(parsedData.email || '');
        
        // If there's a birthDate, also set the date state for the date picker
        if (parsedData.birthDate) {
          setDate(new Date(parsedData.birthDate));
        }
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  };

  const saveFormData = async () => {
    try {
      const formData = {
        fullName,
        userType,
        teamCode,
        teamId,
        role,
        birthDate,
        weight,
        height,
        email
      };
      await AsyncStorage.setItem('registerFormData', JSON.stringify(formData));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  const handleRegister = async () => {
    try {
      if (userType === 'team') {
        if (!teamId) {
          setErrorMessage('Team name is required');
          return;
        }

        const response = await axiosInstance.post('/auth/register', {
          user_type: 'team',
          team_id: teamId  // This will be used as the team name now
        });
        
        if (response.data.team_code) {
          setRegisteredTeamCode(response.data.team_code);
        }
      } else if (userType === 'player') {
        if (!fullName || !password || !role || !birthDate || !weight || !height || !email) {
          setErrorMessage('All fields are required');
          return;
        }

        if (!email.includes('@') || !email.includes('.')) {
          setErrorMessage('Please enter a valid email address');
          return;
        }

        const response = await axiosInstance.post('/auth/register', {
          email: email.toLowerCase(),
          full_name: fullName,
          password,
          user_type: userType,
          team_code: teamCode,
          role,
          birth_date: birthDate,
          weight: parseFloat(weight),
          height: parseFloat(height)
        });
        
        if (response.data.redirect || response.data.team_code) {
          // Clear saved form data after successful registration
          await AsyncStorage.removeItem('registerFormData');
          
          if (response.data.team_code) {
            setRegisteredTeamCode(response.data.team_code);
          }
          if (response.data.redirect) {
            setUpProfile();
            router.push('/login');
          }
        }
      } else if (userType === 'management') {
        if (!fullName || !password || !email) {
          setErrorMessage('Full name, password and email are required');
          return;
        }

        if (!email.includes('@') || !email.includes('.')) {
          setErrorMessage('Please enter a valid email address');
          return;
        }

        const response = await axiosInstance.post('/auth/register', {
          email: email.toLowerCase(),
          full_name: fullName,
          password,
          user_type: userType,
          team_code: teamCode
        });
        
        if (response.data.redirect) {
          setUpProfile();
          router.push('/login');
        }
      } else {
        if (!fullName || !password) {
          setErrorMessage('Full name and password are required');
          return;
        }

        if (fullName.length < 3) {
          setErrorMessage('Full name must be at least 3 characters long');
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
          email: email.toLowerCase(),
          full_name: fullName,
          password,
          user_type: userType,
          team_code: teamCode
        });
        
        if (response.data.redirect) {
          setUpProfile();
          router.push('/login');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error.response?.data);
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

  const setUpProfile = () => {
    const customizeAIAdvisorProfile = async (custom_message: string) => {
      try {
        const data = {
          email: email,
          user_type: userType,
          custom_info: custom_message
        };
        
        await customizeAIAdvisor(data);
      
      }
      catch (error) {
        console.error('Error setting up profile:', error);
      }
      
    }

    if (userType === 'player') {
      const custom_message = `My name is ${fullName}, I'm a player in team ${teamId}. My position is ${role}, I'm ${height}cm tall, and I weigh ${weight}kg.`
      customizeAIAdvisorProfile(custom_message);
    }
    else if (userType === 'management') {
      const custom_message = `My name is ${fullName}, I'm a management member of team ${teamId}.`;
      customizeAIAdvisorProfile(custom_message);
    }
    else {

    }
  };

  // Add a reset form function
  const resetForm = async () => {
    setFullName('');
    setPassword('');
    setUserType('player');
    setTeamCode('');
    setTeamId('');
    setRole('');
    setBirthDate('');
    setWeight('');
    setHeight('');
    setEmail('');
    setDate(new Date());
    setErrorMessage('');
    await AsyncStorage.removeItem('registerFormData');
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
          <Text style={styles.title}>Create Account</Text>
          
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          
          <View style={styles.formContainer}>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Register as:</Text>
              <View style={styles.pickerWrapper}>
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
            </View>

            {userType === 'team' ? (
              <>
                <TextInput
                  style={[styles.input, errorMessage ? styles.inputError : null]}
                  placeholder="Enter Team Name"
                  value={teamId}
                  onChangeText={(text) => {
                    setTeamId(text.toUpperCase());
                    setErrorMessage('');
                  }}
                  autoCapitalize="characters"
                  maxLength={10}
                  placeholderTextColor="#666"
                />
                <Text style={styles.helperText}>
                  This name will be used as your team's unique identifier and cannot be changed later.
                </Text>
              </>
            ) : userType === 'player' ? (
              <>
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
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={[styles.input, errorMessage ? styles.inputError : null]}
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setErrorMessage('');
                  }}
                  autoComplete="name"
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
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setErrorMessage('');
                  }}
                  autoComplete="name"
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
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setErrorMessage('');
                  }}
                  autoComplete="name"
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
              <View style={styles.buttonGroup}>
                <TouchableOpacity 
                  style={styles.primaryButton} 
                  onPress={handleRegister}
                >
                  <Text style={styles.primaryButtonText}>Register</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={resetForm}
                >
                  <Text style={styles.secondaryButtonText}>Reset Form</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.linkButton} 
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.linkButtonText}>Already have an account? Login</Text>
                </TouchableOpacity>
              </View>
            )}

            {registeredTeamCode && (
              <View style={styles.teamCodeContainer}>
                <Text style={styles.teamCodeLabel}>Your Team Code:</Text>
                <Text style={styles.teamCode}>{registeredTeamCode}</Text>
                <Text style={styles.teamCodeInstructions}>
                  Share this code with your team members for registration.{'\n'}
                  They will use this code to join your team.
                </Text>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.primaryButtonText}>Proceed to Login</Text>
                </TouchableOpacity>
              </View>
            )}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 1.5,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    padding: 10,
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 8,
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
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
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
  helperText: {
    fontSize: 13,
    color: '#666',
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  teamCodeContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    alignItems: 'center',
  },
  teamCodeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
  },
  teamCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 12,
    letterSpacing: 2,
  },
  teamCodeInstructions: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
    lineHeight: 20,
  },
  dateInput: {
    height: 50,
    justifyContent: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
