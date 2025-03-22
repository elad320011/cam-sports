// app/(tabs)/dashboard/@widgets/WidgetB.tsx
import React from "react";
import { Text, StyleSheet } from "react-native";
import { Collapsible } from "../Collapsible";

export default function Messages() {
  return (
    <Collapsible title="Messages">
      <Text style={styles.text}>This will display all the messages</Text>
    </Collapsible>
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
