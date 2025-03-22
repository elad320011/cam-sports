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
  text: { fontSize: 16 },
});
