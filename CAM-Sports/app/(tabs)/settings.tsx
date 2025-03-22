import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

// Components
import Calander from "@/components/settings/setting_1"
import Messages from "@/components/settings/setting_2"

export default function Settings() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Calander />
      <Messages />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});
