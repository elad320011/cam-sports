import React from "react";
import { ScrollView, StyleSheet, Text, View, Button } from "react-native";
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import WelcomeHeader from '@/components/WelcomeHeader';

// Components
import GameCalendar from "@/components/management/calendar";
import Messages from "@/components/management/messages";
import Training from "@/components/management/training";
import GameStatistics from "@/components/management/statistics";
import Formations from "@/components/management/formations";
import Footage from "@/components/management/footage";

export default function Management() {
  const { logout, user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <WelcomeHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Management</Text>
        <Button
          title="Logout"
          onPress={logout}
          color="#ff4444"  // Red color for logout button
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <GameCalendar />
        {/* <GameStatistics /> */}
        <Training />
        <Messages />
        <Formations /> {/* Add Formations component */}
        <Footage teamId={user?.team_id}/>
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
  scrollContainer: {
    flex: 1,
  },
});
