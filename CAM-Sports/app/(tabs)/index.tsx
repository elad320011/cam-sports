import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

// Components
import Calander from "@/components/dashboard/calander"
import Messages from "@/components/dashboard/messages"
import Training from "@/components/dashboard/training"

export default function Dashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Management</Text>
      <Calander />
      <Training />
      <Messages />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
});
