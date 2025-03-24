import React, { useEffect, useState } from 'react';

// Components
import { View, Text, Button, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';

// Services
import { getCalendarByID } from '@/services/calendarService';

// Define types for Calendar Events and Attendees
interface Attendee {
  email: string;
  responseStatus: string;
  self?: boolean;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Attendee[];
}

export default function GameCalendar(): JSX.Element {

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState<boolean>(false);
  const [currentAttendees, setCurrentAttendees] = useState<Attendee[]>([]);

  useEffect(() => {
    // Fetch events for the selected day
    fetchEvents();
  }, []);



  

  // Fetch events for the selected day
  const fetchEvents = (): void => {
    console.log('get all events for this calander id: <GET CALENDAR ID FROM USER METADATA>')
  };


  // Button handler for Approve Arrival (no logic implemented)
  const handleRSPV = (eventId: string): void => {
    Alert.alert("Not implemented", "Approve arrival logic is handled from the backend.");
  };

  // Button handler for Create Event (no logic implemented)
  const handleCreateEvent = (): void => {
    Alert.alert("Not implemented", "Create event logic is handled from the backend.");
  };

  // Button handler for Delete Event (no logic implemented)
  const handleDeleteEvent = (): void => {
    Alert.alert("Not implemented", "Delete event logic is handled from the backend.");
  };

    // Button handler for Edit Event (no logic implemented)
  const handleEditEvent = (): void => {
    Alert.alert("Not implemented", "Edit event logic is handled from the backend.");
  };
  

  // Display attendance list in a modal
  const showAttendance = (attendees?: Attendee[]): void => {
    if (!attendees || attendees.length === 0) {
      Alert.alert('Attendance', 'No attendees.');
    } else {
      setCurrentAttendees(attendees);
      setAttendanceModalVisible(true);
    }
  };

  // Handle calendar day selection
  const onDayPress = (day: { dateString: string }): void => {
    setSelectedDate(day.dateString);
    fetchEvents();
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Calendar Module Example</Text>
  
      <Calendar 
        onDayPress={onDayPress} 
        markedDates={{ [selectedDate]: { selected: true } }} 
        style={{ marginVertical: 10 }}
      />

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.summary}</Text>
            <Text>{item.start.dateTime || item.start.date}</Text>
            <Button title="Approve Arrival" onPress={() => handleRSPV(item.id)} />
            <Button title="View Attendance" onPress={() => showAttendance(item.attendees)} />
          </View>
        )}
      />

      <Button title="Create Event" onPress={handleCreateEvent} />
      <Button title="Edit Event" onPress={handleEditEvent} />
      <Button title="Delete Event" onPress={handleDeleteEvent} />

      {/* Modal for Attendance List */}
      <Modal visible={attendanceModalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Attendance List</Text>
          <FlatList
            data={currentAttendees}
            keyExtractor={(item, index) => item.email + index.toString()}
            renderItem={({ item }) => (
              <Text>{item.email} - {item.responseStatus}</Text>
            )}
          />
          <Button title="Close" onPress={() => setAttendanceModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}
