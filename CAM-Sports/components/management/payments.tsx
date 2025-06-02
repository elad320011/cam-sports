import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { Collapsible } from "../Collapsible";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from "@/contexts/AuthContext";
import { getPayments, deletePayment, Payment } from "@/services/paymentService";

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

  const renderPaymentItem = ({ item }: { item: Payment | { id: string; amount: number; description: string; due_date: string } }) => {
    if (item.id === "create" && isManager) {
      return (
        <View key={item.id} style={styles.itemContainer}>
          <TouchableOpacity
            style={[styles.item, styles.createItem]}
            onPress={handleCreatePayment}
          >
            <View style={styles.createContainer}>
              <MaterialIcons name="add" size={24} color="#fff" />
              <Text style={[styles.text, styles.createText]}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={item.id} style={styles.itemContainer}>
        <View style={[styles.item, !isManager && styles.playerItem]}>
          <View style={styles.paymentInfo}>
            <Text style={styles.amount}>₪{item.amount}</Text>
            <Text style={styles.dueDate}>Due: {formatDate(item.due_date)}</Text>
            <Text style={styles.description}>{item.description}</Text>
            {'reminders' in item && item.reminders && item.reminders.length > 0 && (
              <View key={`reminders-${item.id}`} style={styles.remindersList}>
                <Text style={styles.remindersTitle}>Reminders:</Text>
                {item.reminders.map((reminder) => (
                  <View key={`${item.id}-${reminder.id}`} style={styles.reminderItem}>
                    <MaterialIcons name="notifications" size={16} color="#87ceeb" />
                    <Text style={styles.reminderDate}>
                      {formatDate(reminder.date)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        {isManager && item.id !== "create" && (
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
    );
  };

  return (
    <Collapsible 
      title="Payments"
    >
      <View>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={isManager ? [{ id: "create", amount: 0, description: "Create Payment", due_date: "" }, ...payments] : payments}
            keyExtractor={(item) => item.id}
            renderItem={renderPaymentItem}
          />
        )}
      </View>
    </Collapsible>
  );
}

const styles = StyleSheet.create({
  text: { 
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
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
    marginLeft: 8,
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
  paymentInfo: {
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: "#87ceeb",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
  },
  remindersList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  remindersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  reminderDate: {
    fontSize: 13,
    color: '#666',
  },
  playerItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
