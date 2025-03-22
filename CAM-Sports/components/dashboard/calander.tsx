// app/(tabs)/dashboard/@widgets/WidgetA.tsx
import React from "react";
import { Text, StyleSheet } from "react-native";
import { Collapsible } from "../Collapsible";

export default function Calander() {
  return (
    <Collapsible title="Calander">
      <Text style={styles.text}>This will contain the calander</Text>
    </Collapsible>
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
