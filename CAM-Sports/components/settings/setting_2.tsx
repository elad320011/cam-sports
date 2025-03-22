// app/(tabs)/dashboard/@widgets/WidgetB.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Messages() {
  return (
    <View style={styles.widget}>
      <Text style={styles.text}>Setting 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: "#d0d0d0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  text: { fontSize: 16 },
});
