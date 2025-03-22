// app/(tabs)/dashboard/@widgets/WidgetA.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Calander() {
  return (
    <View style={styles.widget}>
      <Text style={styles.text}>Widget A Content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: "#e0e0e0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  text: { fontSize: 16 },
});
