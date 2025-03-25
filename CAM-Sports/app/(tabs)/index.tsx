import React from "react";
import { ScrollView, StyleSheet, Text, View, Button } from "react-native";
import { useAuth } from '@/contexts/AuthContext';

// Components
import GameCalendar from "@/components/management/calendar"
import Messages from "@/components/management/messages"
import Training from "@/components/management/training"
import GameStatistics from "@/components/management/statistics"

export default function Management() {
  const { logout, userInfo } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Management</Text>
        <Button 
          title="Logout" 
          onPress={logout}
          color="#ff4444"  // Red color for logout button
        />
      </View>
      
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          Welcome to CAM Sports, {userInfo?.full_name} ({userInfo?.user_type})!
        </Text>
        {userInfo?.team_id && (
          <Text style={styles.teamText}>
            You are a part of {userInfo.team_id} team
          </Text>
        )}
      </View>

      <ScrollView style={styles.scrollContainer}>
        <GameCalendar />
        <GameStatistics />
        <Training />
        <Messages />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 32,
    marginBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  welcomeContainer: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,  // Added margin to separate the two text lines
  },
  teamText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scrollContainer: {
    flex: 1,
  },
});
