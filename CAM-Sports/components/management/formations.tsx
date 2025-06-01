import React, { useEffect, useState, useCallback } from "react";
import { View, TouchableOpacity, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl, ScrollView } from "react-native";
import { Collapsible } from "../Collapsible";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from "@/contexts/AuthContext";
import { getTeamFormations, deleteFormation } from "@/services/formationService";
import { colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

interface FormationsProps {
  isManager?: boolean;
}

export default function Formations({ isManager = true }: FormationsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [formations, setFormations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFormations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTeamFormations(user?.team_id || '');
      setFormations(response.formations || []);
    } catch (error) {
      console.error("Error fetching formations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.team_id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFormations();
  }, [fetchFormations]);

  const handleDeleteFormation = async (formationId: string) => {
    try {
      await deleteFormation(formationId);
      Alert.alert("Success", "Formation deleted successfully.");
      fetchFormations();
    } catch (error) {
      Alert.alert("Error", "Failed to delete formation.");
    }
  };

  useEffect(() => {
    if (isFocused && !refreshing) {
      fetchFormations();
    }
  }, [isFocused, fetchFormations]);

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
    <Collapsible 
      title="Formations"
      image={require('@/assets/images/formations-icon.png')}
      imageStyle={styles.image}
      titleContainerStyle={styles.imageWrapper}
    >
      <View style={styles.container}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            {isManager && (
              <TouchableOpacity
                style={styles.createItem}
                onPress={handleCreateFormation}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createContainer}
                >
                  <MaterialIcons name="add" size={24} color="#fff" />
                  <Text style={styles.createText}>Create Formation</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <ScrollView 
              style={[
                styles.scrollView,
                formations.length > 5 && styles.scrollViewActive
              ]}
            >
              <FlatList
                scrollEnabled={false}
                data={[...formations].sort((a, b) => b.id.localeCompare(a.id))}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.itemContainer}>
                    <TouchableOpacity
                      style={[styles.item, !isManager && styles.itemFullWidth]}
                      onPress={() => handleNavigate(item.id)}
                    >
                      <LinearGradient
                        colors={[colors.cardBackground, colors.cardBackgroundLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.itemGradient}
                      >
                        <Text style={styles.text}>{item.name}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    {isManager && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteFormation(item.id)}
                      >
                        <MaterialIcons name="delete" size={20} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              />
            </ScrollView>
          </>
        )}
      </View>
    </Collapsible>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 16,
  },
  scrollView: {
    maxHeight: 250,
  },
  scrollViewActive: {
    maxHeight: 250,
  },
  text: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  item: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  createItem: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  createText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  createContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: '100%',
    paddingHorizontal: 8,
    height: 56,
  },
  itemGradient: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  deleteButton: {
    backgroundColor: colors.error,
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  imageWrapper: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between'
  },
  image: { 
    tintColor: colors.textPrimary, 
    width: 52,
    height: 52 
  },
  itemFullWidth: {
    width: '100%',
  },
});
