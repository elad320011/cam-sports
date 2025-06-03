import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Platform, Pressable, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '@/utils/axios';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services
import { createCalendar, shareCalendar } from '@/services/calendarService';
import { customizeAIAdvisor } from '@/services/aiAdvisorService';
import { getTeamByCode, updateTeam } from '@/services/usersService';

// First, add this type definition at the top of the file, after the imports
type Message = {
  text: string;
  type: 'success' | 'error';
};

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('player');
  const [teamCode, setTeamCode] = useState('');  // For player/management registration
  const [registeredTeamCode, setRegisteredTeamCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<Message | null>(null);
  const [teamId, setTeamId] = useState('');
  const [role, setRole] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();
  const [showUserTypeDropdown, setShowUserTypeDropdown] = useState(false);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);

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
          setErrorMessage({
            text: 'Team name is required',
            type: 'error'
          });
          return;
        }

        const response = await axiosInstance.post('/auth/register', {
          user_type: 'team',
          team_id: teamId  // This will be used as the team name now
        });

        if (response.data.team_code) {
          setRegisteredTeamCode(response.data.team_code);
          setUpProfile();
        }
      } else if (userType === 'player') {
        if (!fullName || !password || !role || !birthDate || !weight || !height || !email) {
          setErrorMessage({
            text: 'All fields are required',
            type: 'error'
          });
          return;
        }

        if (!email.includes('@') || !email.includes('.')) {
          setErrorMessage({
            text: 'Please enter a valid email address',
            type: 'error'
          });
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
          setErrorMessage({
            text: 'Full name, password and email are required',
            type: 'error'
          });
          return;
        }

        if (!email.includes('@') || !email.includes('.')) {
          setErrorMessage({
            text: 'Please enter a valid email address',
            type: 'error'
          });
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
          setErrorMessage({
            text: 'Full name and password are required',
            type: 'error'
          });
          return;
        }

        if (fullName.length < 3) {
          setErrorMessage({
            text: 'Full name must be at least 3 characters long',
            type: 'error'
          });
          return;
        }

        if (password.length < 6) {
          setErrorMessage({
            text: 'Password must be at least 6 characters long',
            type: 'error'
          });
          return;
        }

        if (!teamCode) {
          setErrorMessage({
            text: 'Team code is required',
            type: 'error'
          });
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
          router.push('/login');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.isAxiosError) {
        console.error('🔍 Axios error details:', error.toJSON ? error.toJSON() : error);
        console.error('🔗 Error config:', error.config);
        console.error('💬 Error message:', error.message);
      }
      setErrorMessage({
        text: error.response?.data?.message || 'Registration failed',
        type: 'error'
      });
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

    const createCalendarForTeam = async () => {
      try {
        const calendarData = {
          "summary": `A Calendar for team ${teamId}`,
        }

        // Create the calendar
        const result = await createCalendar(calendarData);

        const updatedTeamData = {
          team_name: teamId,
          calendar_id: result.id
        }

        if(result) {
          // Update the team with the new calendar
          await updateTeam(updatedTeamData);
        }
      
      }
      catch (error) {
        console.error('Error sharing calendar with user:', error);
      }

    }

    const shareCalendarWithUser = async () => {
      try {
        const result = await getTeamByCode(teamCode);
        const teamCalendarId = result.calendar_id;
        await shareCalendar(teamCalendarId, email, userType === "player" ? "reader" : "writer" )
      }
      catch (error) {
        console.error('Error sharing calendar with user:', error);
      }

    }

    if (userType === 'player') {
      const custom_message = `My name is ${fullName}, I'm a player in team ${teamId}. My position is ${role}, I'm ${height}cm tall, and I weigh ${weight}kg.`
      customizeAIAdvisorProfile(custom_message);
      shareCalendarWithUser();
    }
    else if (userType === 'management') {
      const custom_message = `My name is ${fullName}, I'm a management member of team ${teamId}.`;
      customizeAIAdvisorProfile(custom_message);
      shareCalendarWithUser();
    }
    else {
      createCalendarForTeam();
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
    setErrorMessage(null);
    await AsyncStorage.removeItem('registerFormData');
  };

  const copyTeamCode = async () => {
    try {
      await Clipboard.setStringAsync(registeredTeamCode);
      setErrorMessage({
        text: 'Team code copied to clipboard!',
        type: 'success'
      });
      // Reset the message after 3 seconds
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error) {
      console.error('Failed to copy team code:', error);
      setErrorMessage({
        text: 'Failed to copy team code',
        type: 'error'
      });
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join CAM Sports</Text>
          </View>

          {errorMessage && (
            <View style={[styles.messageContainer, errorMessage.type === 'success' ? styles.successContainer : styles.errorContainer]}>
              <Ionicons 
                name={errorMessage.type === 'success' ? "checkmark-circle" : "alert-circle"} 
                size={20} 
                color={errorMessage.type === 'success' ? colors.success : colors.error} 
              />
              <Text style={errorMessage.type === 'success' ? styles.success : styles.error}>
                {errorMessage.text}
              </Text>
            </View>
          )}

          <View style={styles.formWrapper}>
            <LinearGradient
              colors={[colors.cardBackground, colors.cardBackgroundLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formContainer}
            >
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Register as:</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowUserTypeDropdown(!showUserTypeDropdown)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {userType === 'player' ? 'Player' : 
                     userType === 'management' ? 'Management' : 
                     userType === 'team' ? 'Team' : 'Select Type'}
                  </Text>
                  <Ionicons 
                    name={showUserTypeDropdown ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.textPrimary} 
                  />
                </TouchableOpacity>
                
                {showUserTypeDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity 
                      style={styles.dropdownItem}
                      onPress={() => {
                        setUserType('player');
                        setShowUserTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Player</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.dropdownItem}
                      onPress={() => {
                        setUserType('management');
                        setShowUserTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Management</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.dropdownItem}
                      onPress={() => {
                        setUserType('team');
                        setShowUserTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Team</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {userType === 'team' ? (
                <>
                  <TextInput
                    style={[styles.input, errorMessage ? styles.inputError : null]}
                    placeholder="Enter Team Name"
                    value={teamId}
                    onChangeText={(text) => {
                      setTeamId(text.toUpperCase());
                      setErrorMessage(null);
                    }}
                    autoCapitalize="characters"
                    maxLength={10}
                    placeholderTextColor={colors.textSecondary}
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
                      setErrorMessage(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, errorMessage ? styles.inputError : null]}
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      setErrorMessage(null);
                    }}
                    autoComplete="name"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, errorMessage ? styles.inputError : null]}
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrorMessage(null);
                    }}
                    secureTextEntry
                    placeholderTextColor={colors.textSecondary}
                  />
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
                    placeholderTextColor={colors.textSecondary}
                  />
                  <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Position:</Text>
                    <TouchableOpacity 
                      style={styles.dropdownButton}
                      onPress={() => setShowPositionDropdown(!showPositionDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {role || 'Select Position'}
                      </Text>
                      <Ionicons 
                        name={showPositionDropdown ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.textPrimary} 
                      />
                    </TouchableOpacity>
                    
                    {showPositionDropdown && (
                      <View style={styles.dropdownList}>
                        {['Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Setter', 'Libero', 'Defensive Specialist'].map((position) => (
                          <TouchableOpacity 
                            key={position}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setRole(position);
                              setShowPositionDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{position}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <Text style={styles.inputLabel}>Birth Date:</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="date"
                      style={{
                        height: 50,
                        borderColor: colors.borderColor,
                        borderWidth: 1,
                        borderRadius: 8,
                        marginBottom: 16,
                        width: '100%',
                        backgroundColor: colors.background,
                        color: colors.textPrimary,
                        padding: '0 16px',
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
                    placeholderTextColor={colors.textSecondary}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Height (cm)"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
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
                      setErrorMessage(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, errorMessage ? styles.inputError : null]}
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      setErrorMessage(null);
                    }}
                    autoComplete="name"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, errorMessage ? styles.inputError : null]}
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrorMessage(null);
                    }}
                    secureTextEntry
                    placeholderTextColor={colors.textSecondary}
                  />
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
                    placeholderTextColor={colors.textSecondary}
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
                      setErrorMessage(null);
                    }}
                    autoComplete="name"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, errorMessage ? styles.inputError : null]}
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrorMessage(null);
                    }}
                    secureTextEntry
                    placeholderTextColor={colors.textSecondary}
                  />
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
                    placeholderTextColor={colors.textSecondary}
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
                  <View style={styles.teamCodeWrapper}>
                    <Text style={styles.teamCode}>{registeredTeamCode}</Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={copyTeamCode}
                    >
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.teamCodeInstructions}>
                    Share this code with your team members for registration.{'\n'}
                    They will use this code to join your team.
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      setUserType('management');
                      setRegisteredTeamCode('');
                      setTeamCode(registeredTeamCode);
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Register as Management</Text>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successContainer: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: colors.success,
  },
  errorContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: colors.error,
  },
  formWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    overflow: 'hidden',
    zIndex: 10,
  },
  formContainer: {
    padding: 20,
    zIndex: 10,
  },
  input: {
    height: 50,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: colors.cardBackgroundMidLight,
    marginBottom: 16,
    zIndex: 1,
  },
  picker: {
    height: 50,
    backgroundColor: 'transparent',
    color: colors.textPrimary,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
    fontWeight: '500',
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  success: {
    color: colors.success,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 8,
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
  secondaryButton: {
    backgroundColor: colors.cardBackgroundMidLight,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
    zIndex: 10,
  },
  secondaryButtonText: {
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
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  teamCodeContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success,
  },
  teamCodeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
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
    color: colors.success,
    marginBottom: 12,
    letterSpacing: 2,
  },
  teamCodeInstructions: {
    textAlign: 'center',
    marginBottom: 20,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  dateInput: {
    height: 50,
    justifyContent: 'center',
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  copyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownButton: {
    height: 50,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackgroundMidLight,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderColor,
    marginTop: -16,
    marginBottom: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
});
