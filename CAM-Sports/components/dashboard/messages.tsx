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
  text: { fontSize: 16 },
});
