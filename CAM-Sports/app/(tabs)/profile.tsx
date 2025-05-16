import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { Collapsible } from '@/components/Collapsible';
import axiosInstance from '@/utils/axios';
import { useRouter } from 'expo-router';

// Define types for our data structures
interface Teammate {
  full_name: string;
  email: string;
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
  
  useEffect(() => {
    if (user?.team_id) {
      fetchTeamCode();
      fetchTeammates();
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
      const response = await axiosInstance.get(`/team/get_players?team_name=${user.team_id}`);
      if (response.data && response.data.players) {
        setTeammates(response.data.players);
      }
    } catch (error) {
      console.error('Error fetching teammates:', error);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (user?.user_type !== 'player') return;
    
    setIsUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const updateData: Record<string, string | number> = {};
      if (role) updateData.role = role;
      if (weight) updateData.weight = parseFloat(weight);
      if (height) updateData.height = parseFloat(height);
      
      const response = await axiosInstance.put('/player/update', updateData);
      setSuccess('Profile updated successfully');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
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
      const response = await axiosInstance.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to change password');
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
  
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.userInfoContainer}>
          <Text style={styles.userNameText}>{user?.full_name}</Text>
          <Text style={styles.userEmailText}>{user?.email}</Text>
          <Text style={styles.userTypeText}>
            {user?.user_type === 'player' ? 'Player' : 'Team Manager'}
          </Text>
          <Text style={styles.teamText}>Team: {user?.team_id}</Text>
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
              </View>
            </View>
          </Collapsible>
        )}
        
        {user?.user_type === 'management' && (
          <Collapsible title="Team Members">
            <View style={styles.section}>
              {teammates.length > 0 ? (
                teammates.map((player, index) => (
                  <View key={index} style={styles.teammateContainer}>
                    <Text style={styles.teammateText}>{player.full_name}</Text>
                    <Text style={styles.teammateRoleText}>{player.email}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No team members yet</Text>
              )}
            </View>
          </Collapsible>
        )}
        
        {user?.user_type === 'player' && (
          <Collapsible title="Edit Profile">
            <View style={styles.section}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your position/role"
                  value={role}
                  onChangeText={setRole}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your weight in kg"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your height in cm"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
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
                onChangeText={setTeamCodeToJoin}
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#4a90e2',
    fontSize: 16,
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
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  teammateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  teammateText: {
    fontSize: 16,
  },
  teammateRoleText: {
    fontSize: 14,
    color: '#666',
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
  }
});
