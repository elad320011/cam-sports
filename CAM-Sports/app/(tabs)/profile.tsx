import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { Collapsible } from '@/components/Collapsible';
import axiosInstance from '@/utils/axios';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';

import { getTeamByCode } from '@/services/usersService'
import { shareCalendar } from '@/services/calendarService';

// Define types for our data structures
interface Teammate {
  full_name: string;
  email: string;
  role?: string;
  user_type?: 'player' | 'management' | 'unknown';
}

interface TeamInfo {
  _id: string;
  name: string;
  code: string;
  players: string[];
  management: string[];
  calendar_id?: string;
}

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  // User attributes states
  const [role, setRole] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teamCodeToJoin, setTeamCodeToJoin] = useState('');
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedTeam, setVerifiedTeam] = useState<TeamInfo | null>(null);
  
  // State for player details displayed at the top
  const [playerRole, setPlayerRole] = useState('');
  const [playerWeight, setPlayerWeight] = useState('');
  const [playerHeight, setPlayerHeight] = useState('');
  
  // State for the form inputs (editable)
  const [inputRole, setInputRole] = useState('');
  const [inputWeight, setInputWeight] = useState('');
  const [inputHeight, setInputHeight] = useState('');
  
  useEffect(() => {
    if (user?.team_id) {
      fetchTeamCode();
      fetchTeammates();
    }
    
    // Fetch player details if user is a player
    if (user?.user_type === 'player') {
      fetchPlayerDetails();
    }
  }, [user]);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }
  
  if (!user) {
    return <Redirect href="/login" />;
  }
  
  const fetchTeamCode = async () => {
    try {
      const response = await axiosInstance.get(`/team/get_by_name?team_name=${user.team_id}`);
      setTeamCode(response.data.code);
      setTeamInfo(response.data);
    } catch (error) {
      console.error('Error fetching team code:', error);
    }
  };
  
  const fetchTeammates = async () => {
    try {
      // Step 1: Get the team information with the list of player/management emails
      const teamResponse = await axiosInstance.get(`/team/get_by_name?team_name=${user.team_id}`);
      const team = teamResponse.data;
      
      console.log("Team data:", team);
      
      // For both player and management, show all team members
      let memberEmails: string[] = [];
      
      // Include all players
      if (team.players && team.players.length > 0) {
        memberEmails = [...memberEmails, ...team.players];
      }
      
      // Include all management
      if (team.management && team.management.length > 0) {
        memberEmails = [...memberEmails, ...team.management];
      }
      
      console.log("Member emails to fetch:", memberEmails);
      
      // Empty array to collect member details
      const memberDetails: Teammate[] = [];

      // Step 2: Fetch details for each member (including current user)
      for (const email of memberEmails) {
        let isCurrentUser = email === user.email;
        
        if (isCurrentUser) {
          // Add current user with (You) indicator
          memberDetails.push({
            email: user.email,
            full_name: `${user.full_name} (You)`,
            role: user.user_type === 'player' ? playerRole || 'Player' : 'Team Manager',
            user_type: user.user_type as 'player' | 'management' | 'unknown'
          });
          continue;
        }
        
        try {
          // Try to fetch as player first
          const playerResponse = await axiosInstance.get(`/player/details?email=${email}`);
          memberDetails.push({
            email: email,
            full_name: playerResponse.data.full_name,
            role: playerResponse.data.role || 'Player',
            user_type: 'player' as const
          });
        } catch (error) {
          // If not a player, try as management
          try {
            const managementResponse = await axiosInstance.get(`/management/details?email=${email}`);
            memberDetails.push({
              email: email,
              full_name: managementResponse.data.full_name,
              role: 'Team Manager',
              user_type: 'management' as const
            });
          } catch (innerError) {
            // If both fail, just add the email
            memberDetails.push({
              email: email,
              full_name: email,
              role: 'Unknown',
              user_type: 'unknown' as const
            });
          }
        }
      }
      
      console.log("Fetched member details:", memberDetails);
      setTeammates(memberDetails);
    } catch (error) {
      console.error('Error fetching teammates:', error);
      setTeammates([]);
    }
  };
  
  // Fetch player details from the backend
  const fetchPlayerDetails = async () => {
    try {
      const response = await axiosInstance.get(`/player/details?email=${user.email}`);
      if (response.data) {
        // Set the display values
        setPlayerRole(response.data.role || '');
        setPlayerWeight(response.data.weight?.toString() || '');
        setPlayerHeight(response.data.height?.toString() || '');
        
        // Initialize the form inputs with the same values
        setInputRole(response.data.role || '');
        setInputWeight(response.data.weight?.toString() || '');
        setInputHeight(response.data.height?.toString() || '');
      }
    } catch (error) {
      console.error('Error fetching player details:', error);
    }
  };
  
  // Input validation handlers
  const validateAndSetWeight = (text: string) => {
    // Only allow numeric input
    if (text === '' || /^\d+$/.test(text)) {
      const numValue = parseInt(text || '0', 10);
      // Ensure value is between 0-250
      if (text === '' || (numValue >= 0 && numValue <= 250)) {
        setInputWeight(text);
      }
    }
  };

  const validateAndSetHeight = (text: string) => {
    // Only allow numeric input
    if (text === '' || /^\d+$/.test(text)) {
      const numValue = parseInt(text || '0', 10);
      // Ensure value is between 0-250
      if (text === '' || (numValue >= 0 && numValue <= 250)) {
        setInputHeight(text);
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (user?.user_type !== 'player') return;
    
    // Validate weight and height before submitting
    if (inputWeight && (parseInt(inputWeight) < 0 || parseInt(inputWeight) > 250)) {
      setError('Weight must be between 0-250 kg');
      return;
    }
    
    if (inputHeight && (parseInt(inputHeight) < 0 || parseInt(inputHeight) > 250)) {
      setError('Height must be between 0-250 cm');
      return;
    }
    
    setIsUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const updateData: Record<string, string | number> = {
        email: user.email // Add email to identify the user
      };
      
      // Only include fields that have values and have changed
      if (inputRole !== playerRole) updateData.role = inputRole;
      // Only include weight/height if they're not empty AND have changed
      if (inputWeight !== playerWeight && inputWeight !== '') 
        updateData.weight = parseFloat(inputWeight);
      if (inputHeight !== playerHeight && inputHeight !== '') 
        updateData.height = parseFloat(inputHeight);
      
      // If nothing has changed, don't send the update
      if (Object.keys(updateData).length <= 1) { // Only email is in the data
        setSuccess('No changes to update');
        setIsUpdating(false);
        return;
      }
      
      console.log('Sending update with data:', updateData);
      
      const response = await axiosInstance.put('/player/update', updateData);
      setSuccess('Profile updated successfully');
      
      // Update the displayed values with the newly saved ones
      setPlayerRole(inputRole);
      setPlayerWeight(inputWeight);
      setPlayerHeight(inputHeight);
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data || error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setIsUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      // Use the dedicated password change endpoints we just created
      const endpoint = user?.user_type === 'management' 
        ? '/management/change-password' 
        : '/player/change-password';
      
      console.log(`Using password change endpoint: ${endpoint}`);
      
      const payload = {
        email: user.email,
        current_password: currentPassword,
        new_password: newPassword
      };
      
      const response = await axiosInstance.put(endpoint, payload);
      
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password change error:', error.response?.data || error.message || error);
      setError(error.response?.data?.error || error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const verifyTeamCode = async () => {
    if (!teamCodeToJoin) {
      setError('Please enter a team code');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      const response = await axiosInstance.get(`/team/get_by_code?team_code=${teamCodeToJoin}`);
      setVerifiedTeam(response.data);
      setIsVerifying(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid team code');
      setVerifiedTeam(null);
      setIsVerifying(false);
    }
  };
  
  const handleChangeTeam = async () => {
    if (!verifiedTeam) {
      setError('Please verify a team code first');
      return;
    }
    
    setIsUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      let teamUpdated = false;
      
      // Step 1: Remove from current team
      if (user.team_id && teamInfo) {
        try {
          // Get current team's players/management list
          const currentTeamList = [...teamInfo[user.user_type === 'player' ? 'players' : 'management']];
          
          // Filter out the current user's email
          const updatedList = currentTeamList.filter(email => email !== user.email);
          
          console.log('Current team list:', currentTeamList);
          console.log('Updated team list:', updatedList);
  
          // Update the team with the filtered list
          await axiosInstance.put('/team/update', {
            team_name: user.team_id,
            [user.user_type === 'player' ? 'players' : 'management']: updatedList
          });
        } catch (updateError: any) {
          console.error('Error removing from current team:', updateError);
          // Continue despite this error
        }
      }
      
      // Step 2: Add to new team
      try {
        // Fetch the latest team data to ensure we have the current member list
        const latestTeamResponse = await axiosInstance.get(`/team/get_by_name?team_name=${verifiedTeam.name}`);
        const latestTeam = latestTeamResponse.data;
        
        // Get current members and ensure the user isn't already in the list
        const currentMembers = latestTeam[user.user_type === 'player' ? 'players' : 'management'] || [];
        
        // Only add the user if they're not already in the list
        if (!currentMembers.includes(user.email)) {
          currentMembers.push(user.email);
        }
        
        console.log('New team members after adding user:', currentMembers);
        
        await axiosInstance.put('/team/update', {
          team_name: verifiedTeam.name,
          [user.user_type === 'player' ? 'players' : 'management']: currentMembers
        });
        teamUpdated = true;
      } catch (updateError: any) {
        console.error('Error adding to new team:', updateError);
        throw new Error('Failed to add you to the new team');
      }
      
      // Step 3: Update user profile with the correct endpoint for player/management
      try {
        // Use the appropriate endpoint based on user type
        const endpoint = user.user_type === 'player' ? '/player/update' : '/management/update';
        
        await axiosInstance.put(endpoint, {
          email: user.email,
          team_id: verifiedTeam._id
        });
        
        console.log('Profile updated successfully with new team ID:', verifiedTeam._id);
      } catch (profileError: any) {
        console.error('Error updating user profile:', profileError);
        console.error('Profile update payload:', { 
          email: user.email, 
          team_id: verifiedTeam._id 
        });
        
        // If this fails but team was updated, still consider it a success
        if (teamUpdated) {
          console.log('Team updated but profile update failed - consider success anyway');
          // Continue despite this error
        } else {
          throw profileError;
        }
      }

      // Step 4: Add player to calendar
      try {
        const result = await getTeamByCode(teamCodeToJoin);
        const teamCalendarId = result.calendar_id;
        await shareCalendar(teamCalendarId, user.email, user.user_type === "management" ? "writer" : "reader" )
      } catch (profileError: any) {
        throw profileError;  
      }
      
      // If we get here, the team change was at least partially successful
      setSuccess('Team changed successfully. Please log out and log back in to see changes.');
      setVerifiedTeam(null);
      setTeamCodeToJoin('');
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to change team');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Direct logout function - simple approach like in index.tsx
  const handleLogout = () => {
    // Just call logout directly, without any confirmation or navigation
    logout();
  };

  // Add a function to copy team code to clipboard
  const copyTeamCode = async () => {
    try {
      await Clipboard.setStringAsync(teamCode);
      setSuccess('Team code copied to clipboard!');
      // Clear the success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to copy team code:', error);
      setError('Failed to copy team code');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.userInfoContainer}>
          <Text style={styles.userNameText}>{user?.full_name}</Text>
          <Text style={styles.userEmailText}>{user?.email}</Text>
          <Text style={styles.userTypeText}>
            {user?.user_type === 'player' ? 'Player' : 'Team Manager'}
          </Text>
          <Text style={styles.teamText}>Team: {user?.team_id}</Text>
          
          {user?.user_type === 'player' && (
            <View style={styles.playerDetailsContainer}>
              {playerRole && <Text style={styles.playerDetailText}>Role: {playerRole}</Text>}
              {playerHeight && <Text style={styles.playerDetailText}>Height: {playerHeight} cm</Text>}
              {playerWeight && <Text style={styles.playerDetailText}>Weight: {playerWeight} kg</Text>}
            </View>
          )}
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}
        
        {user?.user_type === 'management' && (
          <Collapsible title="Team Code">
            <View style={styles.section}>
              <Text style={styles.sectionText}>
                Share this code with players or other managers to join your team:
              </Text>
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{teamCode}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={copyTeamCode}
                >
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Collapsible>
        )}
        
        <Collapsible title="Team Members">
          <View style={styles.section}>
            {teammates.length > 0 ? (
              teammates.map((member, index) => (
                <View key={index} style={styles.teammateContainer}>
                  <View>
                    <Text style={styles.teammateText}>{member.full_name}</Text>
                    <Text style={styles.teammateRoleText}>{member.email}</Text>
                    {member.role && member.user_type === 'player' && (
                      <Text style={styles.teammatePositionText}>Position: {member.role}</Text>
                    )}
                  </View>
                  <Text style={styles.teammateTypeText}>
                    {member.user_type === 'player' ? 'Player' : 'Manager'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No team members yet</Text>
            )}
          </View>
        </Collapsible>
        
        {user?.user_type === 'player' && (
          <Collapsible title="Edit Profile">
            <View style={styles.section}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={inputRole}
                    style={styles.picker}
                    onValueChange={(itemValue: string) => setInputRole(itemValue)}
                  >
                    <Picker.Item label="Select Position" value="" />
                    <Picker.Item label="Outside Hitter" value="Outside Hitter" />
                    <Picker.Item label="Middle Blocker" value="Middle Blocker" />
                    <Picker.Item label="Opposite Hitter" value="Opposite Hitter" />
                    <Picker.Item label="Setter" value="Setter" />
                    <Picker.Item label="Libero" value="Libero" />
                    <Picker.Item label="Defensive Specialist" value="Defensive Specialist" />
                  </Picker>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your weight in kg (0-250)"
                  value={inputWeight}
                  onChangeText={validateAndSetWeight}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your height in cm (0-250)"
                  value={inputHeight}
                  onChangeText={validateAndSetHeight}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              
              <TouchableOpacity
                style={styles.button}
                onPress={handleUpdateProfile}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Update Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          </Collapsible>
        )}
        
        <Collapsible title="Change Team">
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Team Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter team code"
                value={teamCodeToJoin}
                onChangeText={(text) => setTeamCodeToJoin(text.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={verifyTeamCode}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#4a90e2" />
              ) : (
                <Text style={styles.secondaryButtonText}>Verify Team Code</Text>
              )}
            </TouchableOpacity>
            
            {verifiedTeam && (
              <View style={styles.verifiedTeamContainer}>
                <Text style={styles.verifiedTeamText}>
                  Team: {verifiedTeam.name}
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleChangeTeam}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Confirm Change Team</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Collapsible>
        
        <Collapsible title="Change Password">
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleChangePassword}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </Collapsible>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 32,
    marginBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  userInfoContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  userNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userEmailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userTypeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  teamText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
  },
  successText: {
    color: '#28a745',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#e5ffe5',
    borderRadius: 8,
  },
  section: {
    padding: 8,
  },
  sectionText: {
    fontSize: 16,
    marginBottom: 16,
  },
  codeContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
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
  teammateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  teammateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  teammateRoleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  teammatePositionText: {
    fontSize: 14,
    color: '#4a90e2',
    fontStyle: 'italic',
    marginTop: 2,
  },
  teammateTypeText: {
    fontSize: 14,
    color: '#4a90e2',
    fontStyle: 'italic',
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a90e2',
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedTeamContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  verifiedTeamText: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    backgroundColor: 'transparent',
  },
  playerDetailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  playerDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
