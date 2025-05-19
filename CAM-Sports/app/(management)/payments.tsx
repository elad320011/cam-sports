import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

interface Reminder {
  id: string;
  date: Date;
  dateString: string;
}

export default function PaymentPage() {
  const { user } = useAuth();
  const [paymentLink, setPaymentLink] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderPickers, setShowReminderPickers] = useState<{ [key: string]: boolean }>({});

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setDueDate(selectedDate.toLocaleDateString());
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
          ? { ...reminder, date: selectedDate, dateString: selectedDate.toLocaleDateString() }
          : reminder
      ));
    } else {
      setReminders(prev => prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, date: new Date(), dateString: 'Select reminder date' }
          : reminder
      ));
    }
  };

  const addNewReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      date: new Date(),
      dateString: 'Select reminder date'
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
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // TODO: Implement payment creation logic
      Alert.alert('Success', 'Payment created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create payment');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Create Payment',
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
              value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                setDate(selectedDate);
                setDueDate(selectedDate.toLocaleDateString());
              }}
              min={new Date().toISOString().split('T')[0]}
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
                  type="date"
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
                  value={reminder.date.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value);
                    setReminders(prev => prev.map(r => 
                      r.id === reminder.id 
                        ? { ...r, date: selectedDate, dateString: selectedDate.toLocaleDateString() }
                        : r
                    ));
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  max={date.toISOString().split('T')[0]}
                />
              ) : (
                <>
                  <Pressable 
                    style={[styles.input, styles.dateInput]} 
                    onPress={() => setShowReminderPickers(prev => ({ ...prev, [reminder.id]: true }))}
                  >
                    <Text style={reminder.dateString !== 'Select reminder date' ? styles.dateText : styles.placeholderText}>
                      {reminder.dateString}
                    </Text>
                  </Pressable>

                  {showReminderPickers[reminder.id] && (
                    <DateTimePicker
                      testID={`reminderDateTimePicker-${reminder.id}`}
                      value={reminder.date}
                      mode="date"
                      is24Hour={true}
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
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Create Payment</Text>
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
});
