import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from "@/contexts/AuthContext";

export default function Payments() {
  const { user } = useAuth();
  const router = useRouter();

  const handleNavigate = () => {
    router.push({
      pathname: `../payments`,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        onPress={handleNavigate}
      >
        <View style={styles.createContainer}>
          <MaterialIcons name="payment" size={24} color="#fff" />
          <Text style={[styles.text, styles.createText]}>Payments</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  text: { 
    fontSize: 16,
    marginLeft: 8,
  },
  item: {
    backgroundColor: "#87ceeb",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  createText: {
    color: "#fff",
    fontWeight: "bold",
  },
  createContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
