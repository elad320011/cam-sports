import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { Collapsible } from "../Collapsible";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native"; // Import useIsFocused
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons for the "+" icon
import { useAuth } from "@/contexts/AuthContext";
import { getTeamFormations, deleteFormation } from "@/services/formationService";

export default function Formations() {
  const { user } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused(); // Hook to detect if the tab is focused
  const [formations, setFormations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFormations = async () => {
    setLoading(true);
    try {
      const response = await getTeamFormations(user?.team_id || '');
      setFormations(response.formations || []);
    } catch (error) {
      console.error("Error fetching formations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFormation = async (formationId: string) => {
    try {
      await deleteFormation(formationId);
      Alert.alert("Success", "Formation deleted successfully.");
      fetchFormations(); // Refresh the list after deletion
    } catch (error) {
      Alert.alert("Error", "Failed to delete formation.");
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchFormations(); // Fetch formations when the tab is focused
    }
  }, [isFocused]); // Dependency array includes isFocused

  const handleNavigate = (formationId: string) => {
    router.push({
      pathname: `../formations`,
      params: { formationId },
    });
  };

  const handleCreateFormation = () => {
    router.push({
      pathname: "../formations",
      params: { isNew: "true" },
    });
  };

  return (
    <Collapsible title="Formations">
      <View>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={[{ id: "create", name: "Create Formation" }, ...formations]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <TouchableOpacity
                  style={[
                    styles.item,
                    item.id === "create" && styles.createItem, // Apply different style for "Create Formation"
                  ]}
                  onPress={() =>
                    item.id === "create" ? handleCreateFormation() : handleNavigate(item.id)
                  }
                >
                  {item.id === "create" ? (
                    <View style={styles.createContainer}>
                      <MaterialIcons name="add" size={24} color="#fff" /> {/* Add "+" icon */}
                      <Text style={[styles.text, styles.createText]}>{item.name}</Text>
                    </View>
                  ) : (
                    <Text style={styles.text}>{item.name}</Text>
                  )}
                </TouchableOpacity>
                {item.id !== "create" && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteFormation(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}
      </View>
    </Collapsible>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 16 },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  createItem: {
    backgroundColor: "#87ceeb",
  },
  createText: {
    color: "#fff",
    fontWeight: "bold",
  },
  createContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
