import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { createPayment, getPayments, updatePayment, Payment } from '@/services/paymentService';

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
  const [showReminderPickers, setShowReminderPickers] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setDueDate(selectedDate.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' }));
    } else {
      setDate(new Date());
      setDueDate('');
    }
  };

  const onReminderDateChange = (reminderId: string, event: any, selectedDate?: Date) => {
    setShowReminderPickers(prev => ({ ...prev, [reminderId]: false }));
    if (selectedDate) {
      setReminders(prev => prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, date: selectedDate, dateString: selectedDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) }
          : reminder
      ));
    } else {
      setReminders(prev => prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, date: new Date(), dateString: 'Select reminder date and time' }
          : reminder
      ));
    }
  };

  const addNewReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      date: new Date(),
      dateString: 'Select reminder date and time'
    };
    setReminders([...reminders, newReminder]);
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
    setShowReminderPickers(prev => {
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
        router.replace('/(tabs)');
        Alert.alert('Success', 'Payment updated successfully');
      } else {
        await createPayment(paymentData);
        router.replace('/(tabs)');
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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: isEditMode ? 'Edit Payment' : 'Create Payment',
        }}
      />
      
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Payment Link</Text>
          <TextInput
            style={styles.input}
            value={paymentLink}
            onChangeText={setPaymentLink}
            placeholder="Enter payment link"
            autoCapitalize="none"
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
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Due Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              style={{
                height: 30,
                borderColor: '#ddd',
                borderWidth: 1,
                marginBottom: 12,
                width: '100%',
                borderRadius: 8,
                padding: 8,
                fontSize: 16,
                backgroundColor: '#fff',
              }}
              value={formatDateForInput(date)}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                setDate(selectedDate);
                setDueDate(selectedDate.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' }));
              }}
              min={formatDateForInput(new Date())}
            />
          ) : (
            <>
              <Pressable 
                style={[styles.input, styles.dateInput]} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={dueDate ? styles.dateText : styles.placeholderText}>
                  {dueDate || 'Select Due Date'}
                </Text>
              </Pressable>

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
            </>
          )}
        </View>

        <View style={styles.remindersContainer}>
          <View style={styles.remindersHeader}>
            <Text style={styles.label}>Reminders</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addNewReminder}
            >
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderItem}>
              {Platform.OS === 'web' ? (
                <input
                  type="datetime-local"
                  style={{
                    height: 48,
                    borderColor: '#ddd',
                    borderWidth: 1,
                    width: '100%',
                    borderRadius: 8,
                    padding: 8,
                    fontSize: 16,
                    backgroundColor: '#fff',
                  }}
                  value={formatDateTimeForInput(reminder.date)}
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value);
                    setReminders(prev => prev.map(r => 
                      r.id === reminder.id 
                        ? { ...r, date: selectedDate, dateString: selectedDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) }
                        : r
                    ));
                  }}
                  min={formatDateTimeForInput(new Date())}
                  max={formatDateTimeForInput(date)}
                />
              ) : (
                <>
                  <Pressable 
                    style={[styles.input, styles.dateInput]} 
                    onPress={() => setShowReminderPickers(prev => ({ ...prev, [reminder.id]: true }))}
                  >
                    <Text style={reminder.dateString !== 'Select reminder date and time' ? styles.dateText : styles.placeholderText}>
                      {reminder.dateString}
                    </Text>
                  </Pressable>

                  {showReminderPickers[reminder.id] && (
                    <DateTimePicker
                      testID={`reminderDateTimePicker-${reminder.id}`}
                      value={reminder.date}
                      mode="datetime"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, date) => onReminderDateChange(reminder.id, event, date)}
                      minimumDate={new Date()}
                      maximumDate={date}
                    />
                  )}
                </>
              )}
              <TouchableOpacity
                onPress={() => removeReminder(reminder.id)}
                style={styles.removeButton}
              >
                <MaterialIcons name="close" size={20} color="#ff4d4d" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
    marginRight: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 48,
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  remindersContainer: {
    marginBottom: 20,
  },
  remindersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#87ceeb',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  reminderText: {
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#87ceeb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
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
});
