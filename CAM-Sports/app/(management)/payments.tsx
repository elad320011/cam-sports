import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, Pressable, ScrollView, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { createPayment, getPayments, updatePayment, Payment } from '@/services/paymentService';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Reminder {
  id: string;
  date: Date;
  dateString: string;
}

export default function PaymentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditMode = params.paymentId !== undefined;
  const [paymentLink, setPaymentLink] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderDatePickers, setShowReminderDatePickers] = useState<{ [key: string]: boolean }>({});
  const [showReminderTimePickers, setShowReminderTimePickers] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    if (isEditMode && params.paymentId) {
      fetchPaymentData(params.paymentId as string);
    }
  }, [isEditMode, params.paymentId]);

  const fetchPaymentData = async (paymentId: string) => {
    try {
      const response = await getPayments(user?.team_id || '');
      const payment = response.find(p => p.id === paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }
      setPaymentLink(payment.link);
      setAmount(payment.amount.toString());
      setDescription(payment.description || '');
      const dueDate = new Date(payment.due_date);
      setDate(dueDate);
      setDueDate(dueDate.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' }));
      setReminders(payment.reminders.map(reminder => ({
        id: reminder.id,
        date: new Date(reminder.date),
        dateString: new Date(reminder.date).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
      })));
    } catch (error) {
      console.error('Error fetching payment:', error);
      Alert.alert('Error', 'Failed to load payment data');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'Asia/Jerusalem'
    });
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateTimeForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setDueDate(currentDate.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' }));
  };

  const handleDueDatePress = () => {
    setShowDatePicker(prev => !prev);
  };

  const onReminderDateChange = (reminderId: string, event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowReminderDatePickers(prev => ({ ...prev, [reminderId]: false }));
      if (event.type === 'set' && selectedDate) {
        setReminders(prev => prev.map(reminder => 
          reminder.id === reminderId 
            ? { 
                ...reminder, 
                date: new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate(),
                  reminder.date.getHours(),
                  reminder.date.getMinutes()
                ),
                dateString: reminder.dateString
              }
            : reminder
        ));
        // Show time picker after date is selected
        setShowReminderTimePickers(prev => ({ ...prev, [reminderId]: true }));
      }
    } else {
      // For iOS, handle both date and time in one picker
      if (selectedDate) {
        // Ensure the selected date is not after the due date
        const maxDate = new Date(date);
        const finalDate = selectedDate > maxDate ? maxDate : selectedDate;
        
        setReminders(prev => prev.map(reminder => 
          reminder.id === reminderId 
            ? { 
                ...reminder, 
                date: finalDate, 
                dateString: finalDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) 
              }
            : reminder
        ));
      }
      // Do not automatically close the picker on iOS; let the user dismiss it manually
    }
  };

  const onReminderTimeChange = (reminderId: string, event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowReminderTimePickers(prev => ({ ...prev, [reminderId]: false }));
      if (event.type === 'set' && selectedTime) {
        setReminders(prev => prev.map(reminder => {
          if (reminder.id === reminderId) {
            const newDate = new Date(reminder.date);
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            return {
              ...reminder,
              date: newDate,
              dateString: newDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
            };
          }
          return reminder;
        }));
      }
    }
  };

  const handlePickerPress = (reminderId: string) => {
    if (Platform.OS === 'android') {
      if (showReminderDatePickers[reminderId]) {
        setShowReminderDatePickers(prev => ({ ...prev, [reminderId]: false }));
      } else if (showReminderTimePickers[reminderId]) {
        setShowReminderTimePickers(prev => ({ ...prev, [reminderId]: false }));
      } else {
        setShowReminderDatePickers(prev => ({ ...prev, [reminderId]: true }));
      }
    } else {
      setShowReminderDatePickers(prev => ({ ...prev, [reminderId]: !prev[reminderId] }));
    }
  };

  const addNewReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      date: new Date(),
      dateString: 'Select date'
    };
    setReminders([...reminders, newReminder]);
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
    setShowReminderDatePickers(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    setShowReminderTimePickers(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const handleSubmit = async () => {
    if (!paymentLink || !amount || !dueDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const paymentData = {
        link: paymentLink,
        amount: parseFloat(amount),
        description: description,
        due_date: date.toISOString(),
        team_id: user?.team_id || '',
        reminders: reminders.map(reminder => ({
          id: reminder.id,
          date: reminder.date.toISOString(),
          dateString: reminder.dateString
        }))
      };

      if (isEditMode && params.paymentId) {
        await updatePayment(params.paymentId as string, paymentData);
        router.replace('/');
        Alert.alert('Success', 'Payment updated successfully');
      } else {
        await createPayment(paymentData);
        router.replace('/');
        Alert.alert('Success', 'Payment created successfully');
      }
      
    } catch (error) {
      console.error('Error saving payment:', error);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} payment. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: isEditMode ? 'Edit Payment' : 'Create Payment',
        }}
      />

      <LinearGradient
        colors={['rgba(255, 255, 255, 0.20)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.sunRays}
      />
      <Image
        source={require('@/assets/images/volleyball.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formWrapper}>
          <LinearGradient
            colors={[colors.cardBackground, colors.cardBackgroundLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formContainer}
          >
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Payment Link</Text>
                <TextInput
                  style={styles.input}
                  value={paymentLink}
                  onChangeText={setPaymentLink}
                  placeholder="Enter payment link"
                  autoCapitalize="none"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Enter amount"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter payment description"
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Due Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{dueDate || 'Select due date'}</Text>
                  <MaterialIcons name="calendar-today" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}

              <View style={styles.remindersContainer}>
                <Text style={styles.remindersTitle}>Reminders</Text>
                {reminders.map((reminder) => (
                  <View key={`reminder-${reminder.id}`} style={styles.reminderItem}>
                    <View style={styles.reminderRow}>
                      <View style={styles.reminderDateContainer}>
                        <TouchableOpacity
                          style={styles.reminderDateButton}
                          onPress={() => handlePickerPress(reminder.id)}
                        >
                          <Text
                            style={styles.reminderDateText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {reminder.dateString}
                          </Text>
                          <MaterialIcons name="calendar-today" size={20} color={colors.textPrimary} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={styles.removeReminderButton}
                        onPress={() => removeReminder(reminder.id)}
                      >
                        <MaterialIcons name="close" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>

                    {/* Android pickers remain inline below row */}
                    {Platform.OS === 'android' && showReminderDatePickers[reminder.id] && (
                      <DateTimePicker
                        value={reminder.date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => onReminderDateChange(reminder.id, event, selectedDate)}
                        minimumDate={currentDate}
                      />
                    )}
                    {Platform.OS === 'android' && showReminderTimePickers[reminder.id] && (
                      <DateTimePicker
                        value={reminder.date}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => onReminderTimeChange(reminder.id, event, selectedTime)}
                        minimumDate={currentDate}
                      />
                    )}

                    {/* iOS inline DateTimePicker below row */}
                    {Platform.OS === 'ios' && showReminderDatePickers[reminder.id] && (
                      <View style={styles.inlineDatePicker}>
                        <DateTimePicker
                          value={reminder.date}
                          mode="datetime"
                          display="spinner"
                          onChange={(event, selectedDate) => onReminderDateChange(reminder.id, event, selectedDate)}
                          minimumDate={currentDate}
                          maximumDate={date}
                        />
                      </View>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addReminderButton}
                  onPress={addNewReminder}
                >
                  <MaterialIcons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addReminderText}>Add Reminder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Payment' : 'Create Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sunRays: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  backgroundImage: {
    position: 'absolute',
    bottom: '-16%',
    left: '-90%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
  },
  formWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    overflow: 'visible',
    zIndex: 10,
  },
  formContainer: {
    padding: 20,
    zIndex: 10,
  },
  form: {
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 48,
    color: colors.textPrimary,
  },
  dateInput: {
    height: 50,
    justifyContent: 'center',
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  remindersContainer: {
    marginBottom: 20,
  },
  remindersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.textPrimary,
  },
  reminderItem: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: 12,
    gap: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderDateContainer: {
    flex: 1,
  },
  dateTimePickerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 100,
  },
  reminderDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  reminderDateText: {
    fontSize: 16,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  removeReminderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addReminderButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addReminderText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  iosPickerContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderColor: colors.borderColor,
    borderWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    backgroundColor: colors.background,
  },
  iosPickerButton: {
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.textPrimary,
  },
  iosPickerButtonDone: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  iosPicker: {
    backgroundColor: colors.background,
    height: 200,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  datePickerContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: colors.background,
    borderRadius: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inlineDatePicker: {
    marginTop: 8,
  },
});
