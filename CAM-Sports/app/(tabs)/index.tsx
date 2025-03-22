import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

// Components
import Calander from "@/components/management/calander"
import Messages from "@/components/management/messages"
import Training from "@/components/management/training"

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
