import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeHeader() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Welcome to CAM Sports, {user ? user.full_name : 'Guest'}!
      </Text>
      {user?.team_id && (
        <Text style={styles.teamText}>
          You are a part of {user.team_id} team
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  teamText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 