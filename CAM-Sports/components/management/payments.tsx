import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView } from "react-native";
import { Collapsible } from "../Collapsible";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from "@/contexts/AuthContext";
import { getPayments, deletePayment, Payment } from "@/services/paymentService";
import { colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

interface PaymentsProps {
  isManager?: boolean;
}

export default function Payments({ isManager = true }: PaymentsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await getPayments(user?.team_id || '') as Payment[];
      setPayments(response || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePayment(paymentId);
      Alert.alert("Success", "Payment deleted successfully.");
      fetchPayments();
    } catch (error) {
      Alert.alert("Error", "Failed to delete payment.");
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchPayments();
    }
  }, [isFocused]);

  const handleNavigate = (paymentId: string) => {
    router.push({
      pathname: `../payments`,
      params: { paymentId },
    });
  };

  const handleCreatePayment = () => {
    router.push({
      pathname: "/(management)/payments",
      params: { isNew: "true" },
    });
  };

  return (
    <Collapsible title="Payments">
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            {isManager && (
              <TouchableOpacity
                style={styles.createItem}
                onPress={handleCreatePayment}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createContainer}
                >
                  <MaterialIcons name="add" size={24} color="#fff" />
                  <Text style={styles.createText}>Create Payment</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <ScrollView 
              style={[
                styles.scrollView,
                payments.length > 5 && styles.scrollViewActive
              ]}
            >
              <FlatList
                scrollEnabled={false}
                data={payments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View key={item.id} style={styles.itemContainer}>
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
                        <View style={styles.paymentInfo}>
                          <Text style={styles.amount}>₪{item.amount}</Text>
                          <Text style={styles.dueDate}>Due: {formatDate(item.due_date)}</Text>
                          <Text style={styles.description}>{item.description}</Text>
                          {'reminders' in item && item.reminders && item.reminders.length > 0 && (
                            <View key={`reminders-${item.id}`} style={styles.remindersList}>
                              <Text style={styles.remindersTitle}>Reminders:</Text>
                              {item.reminders.map((reminder, index) => (
                                <View key={`${reminder.id}-${index}`} style={styles.reminderItem}>
                                  <MaterialIcons name="notifications" size={16} color={colors.primary} />
                                  <Text style={styles.reminderDate}>
                                    {formatDate(reminder.date)}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                    {isManager && (
                      <View key={`actions-${item.id}`} style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => handleNavigate(item.id)}
                        >
                          <MaterialIcons name="edit" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDeletePayment(item.id)}
                        >
                          <MaterialIcons name="delete" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
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
    minHeight: 56,
  },
  itemGradient: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  paymentInfo: {
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dueDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  remindersList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
  },
  remindersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  reminderDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemFullWidth: {
    width: '100%',
  },
});
