// app/(tabs)/dashboard/@widgets/WidgetB.tsx
import React from "react";
import { Text, StyleSheet } from "react-native";
import { Collapsible } from "../Collapsible";

export default function Training() {
  return (
    <Collapsible title="Training Programs">
      <Text style={styles.text}>This will display all the training plans.</Text>
    </Collapsible>
);
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    textAlign: "center"
  },
});
