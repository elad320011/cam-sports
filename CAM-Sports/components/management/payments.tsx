import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView, Image, Linking } from "react-native";
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

  const getPaymentStatus = (item: Payment) => {
    const now = new Date();
    const dueDate = new Date(item.due_date);
    
    // Set both dates to start of day for accurate comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const paymentDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    if (item.status === 'paid') return 'paid';
    if (today > paymentDueDate) return 'expired';
    return 'pending';
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
      // Alert.alert("Success", "Payment deleted successfully.");
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
    if (!isManager) return; // Prevent navigation for players
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
    <Collapsible 
      title="Payments"
      image={require('@/assets/images/payments.png')}
      imageStyle={styles.image}
      titleContainerStyle={styles.imageWrapper}
    >
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
              nestedScrollEnabled={true}
              removeClippedSubviews={false}
            >
              <FlatList
                scrollEnabled={false}
                data={payments}
                keyExtractor={(item) => `payment-${item.id}`}
                renderItem={({ item }) => {
                  const status = getPaymentStatus(item);
                  return (
                    <View key={`payment-item-${item.id}`} style={styles.itemContainer}>
                      <View
                        style={[styles.item, !isManager && styles.itemFullWidth]}
                      >
                        <LinearGradient
                          colors={[colors.cardBackground, colors.cardBackgroundLight]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.itemGradient}
                        >
                          <View style={styles.paymentInfo}>
                            <View style={styles.amountContainer}>
                              <Text style={styles.amount}>₪{item.amount}</Text>
                              <Text style={styles.dueDate}>Due: {formatDate(item.due_date)}</Text>
                            </View>
                            <Text style={styles.description}>{item.description}</Text>
                            {!isManager && item.link && (
                              <TouchableOpacity 
                                style={styles.paymentLink}
                                onPress={() => Linking.openURL(item.link)}
                              >
                                <MaterialIcons name="payment" size={20} color={colors.primary} />
                                <Text style={styles.paymentLinkText}>Pay Now</Text>
                              </TouchableOpacity>
                            )}
                            {isManager && item.link && (
                              <View style={styles.paymentLinkContainer}>
                                <Text style={styles.paymentLinkLabel}>Payment Link:</Text>
                                <TouchableOpacity 
                                  style={styles.paymentLink}
                                  onPress={() => Linking.openURL(item.link)}
                                >
                                  <MaterialIcons name="link" size={20} color={colors.primary} />
                                  <Text style={styles.paymentLinkText}>Open Link</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                            {'reminders' in item && item.reminders && item.reminders.length > 0 && (
                              <View key={`reminders-${item.id}`} style={styles.remindersList}>
                                <Text style={styles.remindersTitle}>Reminders:</Text>
                                {item.reminders.map((reminder, index) => (
                                  <View key={`reminder-${reminder.id}-${index}`} style={styles.reminderItem}>
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
                      </View>
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
                  );
                }}
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
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dueDate: {
    fontSize: 14,
    color: colors.textSecondary,
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
  imageWrapper: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between'
  },
  image: { 
    tintColor: '#fff',
    width: 52,
    height: 52 
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusPaid: {
    backgroundColor: colors.success + '20',
  },
  statusPending: {
    backgroundColor: colors.warning + '20',
  },
  statusExpired: {
    backgroundColor: colors.error + '20',
  },
  statusTextPaid: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.warning,
  },
  statusTextExpired: {
    color: colors.error,
  },
  paymentLinkContainer: {
    marginTop: 12,
  },
  paymentLinkLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  paymentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  paymentLinkText: {
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
});
