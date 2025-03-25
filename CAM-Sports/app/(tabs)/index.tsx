import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// Components
import GameCalendar from "@/components/management/calendar"
import Messages from "@/components/management/messages"
import Training from "@/components/management/training"
import GameStatistics from "@/components/management/statistics"

export default function Management() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Management</Text>
      <ScrollView style={styles.container}>
        <GameCalendar />
        <GameStatistics />
        {/* <Training /> */} 
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
});
