import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axios';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';

// Services
import { createCalendar, shareCalendar } from '@/services/calendarService';
import { customizeAIAdvisor } from '@/services/aiAdvisorService';
import { getTeamByCode, updateTeam } from '@/services/usersService';

type Message = {
  text: string;
  type: 'success' | 'error';
};

export default function CompleteGoogleProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  
  // Pre-filled from Google Auth
  const [email, setEmail] = useState(params.email as string || '');
  const [fullName, setFullName] = useState(params.name as string || '');
  const [googleId] = useState(params.google_id as string || '');
  
  // Additional required fields
  const [userType, setUserType] = useState('player');
  const [teamCode, setTeamCode] = useState('');
  const [role, setRole] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState<Message | null>(null);

  const handleRegister = async () => {
    try {
      if (userType === 'player') {
        if (!role || !birthDate || !weight || !height || !teamCode) {
          setErrorMessage({
            text: 'All fields are required',
            type: 'error'
          });
          return;
        }

        const response = await axiosInstance.post('/auth/google/complete', {
          email,
          full_name: fullName,
          google_id: googleId,
          user_type: userType,
          team_code: teamCode,
          role,
          birth_date: birthDate,
          weight: parseFloat(weight),
          height: parseFloat(height)
        });
        
        if (response.data.redirect) {
          setUpProfile();
          // Login directly after registration
          await login({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            user: response.data.user
          });
          router.replace('/');
        }
      } else if (userType === 'management') {
        if (!teamCode) {
          setErrorMessage({
            text: 'Team code is required',
            type: 'error'
          });
          return;
        }

        const response = await axiosInstance.post('/auth/google/complete', {
          email,
          full_name: fullName,
          google_id: googleId,
          user_type: userType,
          team_code: teamCode
        });
        
        if (response.data.redirect) {
          setUpProfile();
          // Login directly after registration
          await login({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            user: response.data.user
          });
          router.replace('/');
        }
      }
    } catch (error: any) {
      setErrorMessage({
        text: error.response?.data?.message || 'Registration failed',
        type: 'error'
      });
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
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

    const shareCalendarWithUser = async () => {
      try {
        const result = await getTeamByCode(teamCode);
        const teamCalendarId = result.calendar_id;
        const teamName = result.name;
        await shareCalendar(teamCalendarId, email, userType === "player" ? "reader" : "writer")
        
        if (userType === 'player') {
          const custom_message = `My name is ${fullName}, I'm a player in team ${teamName}. My position is ${role}, I'm ${height}cm tall, and I weigh ${weight}kg.`
          customizeAIAdvisorProfile(custom_message);
        }
        else if (userType === 'management') {
          const custom_message = `My name is ${fullName}, I'm a management member of team ${teamName}.`;
          customizeAIAdvisorProfile(custom_message);
        }
      }
      catch (error) {
        console.error('Error sharing calendar with user:', error);
      }
    }
    
    shareCalendarWithUser();
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
          <Text style={styles.title}>Complete Your Profile</Text>
          
          {errorMessage && (
            <Text style={errorMessage.type === 'success' ? styles.success : styles.error}>
              {errorMessage.text}
            </Text>
          )}
          
          <View style={styles.formContainer}>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Welcome {fullName}! We need a few more details to complete your registration.
              </Text>
            </View>
            
            <View style={styles.prefilledField}>
              <Text style={styles.prefilledLabel}>Email:</Text>
              <Text style={styles.prefilledValue}>{email}</Text>
            </View>
            
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
                </Picker>
              </View>
            </View>

            {userType === 'player' ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Team Code"
                  value={teamCode}
                  onChangeText={(text) => {
                    setTeamCode(text.toUpperCase());
                    setErrorMessage(null);
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
                    <TouchableOpacity
                      style={[styles.input, styles.dateInput]} 
                      onPress={showDatepicker}
                    >
                      <Text style={birthDate ? styles.dateText : styles.placeholderText}>
                        {birthDate || 'Select Birth Date'}
                      </Text>
                    </TouchableOpacity>

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
                  style={styles.input}
                  placeholder="Enter Team Code"
                  value={teamCode}
                  onChangeText={(text) => {
                    setTeamCode(text.toUpperCase());
                    setErrorMessage(null);
                  }}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </>
            ) : null}

            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleRegister}
              >
                <Text style={styles.primaryButtonText}>Complete Registration</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.linkButton} 
                onPress={() => router.push('/login')}
              >
                <Text style={styles.linkButtonText}>Cancel</Text>
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
  infoContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4a90e2',
    textAlign: 'center',
  },
  prefilledField: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  prefilledLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  prefilledValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
  success: {
    color: '#2e7d32',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    padding: 10,
    backgroundColor: '#e8f5e9',
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
  teamCodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  copyButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 