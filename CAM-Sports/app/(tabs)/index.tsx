import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
import Payments from "@/components/management/payments";

export default function Management() {
  const { user, isLoading } = useAuth();

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
      </View>

      <ScrollView style={styles.scrollContainer}>
        <GameCalendar />
        {/* <GameStatistics /> */}
        <Training />
        <Messages />
        <Formations />
        <Footage teamId={user?.team_id}/>
        <Payments isManager={user?.user_type === 'management'} />
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
