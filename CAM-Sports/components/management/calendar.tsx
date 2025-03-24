import React, { useEffect, useState } from 'react';

// Components
import { View, Text, Button, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';

// Services
import { getCalendarByID, listCalendars, createEvent, getEvent, listEvents, updateEvent, deleteEvent,
  rsvpEvent,
  showAttendance as backendShowAttendance,
  removeRSVP
 } from '@/services/calendarService';

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
  end: {
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

  const DEFAULT_CALENDAR_ID = "f422d1217677325f1e4c2db7d77dc8b43b5cafcdd30601d32855d180ba95acdd@group.calendar.google.com";
  // const DEFAULT_CALENDAR_ID = "eda5ca030ebe4c24d4121a5401fd709cbc615a00fb4381899f0bdcf621ba8fb1@group.calendar.google.com";

  useEffect(() => {
    (async () => {
      console.log(await listCalendars());
      console.log(await getCalendarByID(DEFAULT_CALENDAR_ID));
    })();

    // Fetch all events
    fetchEvents();
  }, []);


  // Fetch events for the selected day
  const fetchEvents = async () => {
    try {
      // For now, always use the default calendar
      const fetchedEvents = await listEvents(DEFAULT_CALENDAR_ID);
      
      console.log('Fetched events: ', fetchedEvents);
      setEvents(fetchedEvents);

    } catch (error) {
      console.log('Failed to fetch events: ', error);
    }
  };

  // Create an event using the backend
  const handleCreateEvent = async (): Promise<void> => {
    try {
      // Create a test event: summary "Test Event", starting now and ending in 1 hour.
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      const eventData = {
        calendar_id: DEFAULT_CALENDAR_ID,
        summary: "Test Event",
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        description: "This is a test event."
      };

      const newEvent = await createEvent(eventData);
      
      Alert.alert("Success", "Event created with id: " + newEvent.id);
      fetchEvents(); // Refresh the event list
    
    } catch (error) {
      Alert.alert("Error", "Failed to create event.");
    }
  };
  
  // Delete an event using the backend
  const handleDeleteEvent = async (): Promise<void> => {
    try {
      if (events.length === 0) {
        Alert.alert("No Event", "No event available to delete.");
        return;
      }
      
      // For demonstration, delete the first event in the list.
      const eventToDelete = events[0];
      await deleteEvent(DEFAULT_CALENDAR_ID, eventToDelete.id);
      
      Alert.alert("Success", "Event deleted.");
      fetchEvents(); // Refresh the event list

    } catch (error) {
      Alert.alert("Error", "Failed to delete event.");
    }
  };

  // Edit an event using the backend
  const handleEditEvent = async (): Promise<void> => {
    try {
      if (events.length === 0) {
        Alert.alert("No Event", "No event available to edit.");
        return;
      }
      // For demonstration, update the first event's summary.
      const eventToEdit = events[0];
      const updatedData = {
        calendar_id: DEFAULT_CALENDAR_ID,
        event_id: eventToEdit.id,
        summary: eventToEdit.summary + " (Updated)",
        // Check each field independently to support both dateTime and date formats.
        start: eventToEdit.start.dateTime ? eventToEdit.start.dateTime : eventToEdit.start.date,
        end: eventToEdit.end.dateTime ? eventToEdit.end.dateTime : eventToEdit.end.date
      };
  
      const updatedEvent = await updateEvent(updatedData);
      Alert.alert("Success", "Event updated with id: " + updatedEvent.id);
      fetchEvents(); // Refresh the event list
    } catch (error) {
      Alert.alert("Error", "Failed to update event.");
    }
  };
  
  
  // RSVP for an event using the backend.
  const handleRSVP = async (eventId: string): Promise<void> => {
    try {
      const userEmail = "haimovshlomi@gmail.com"; // Replace with the actual user email.
      const response = await rsvpEvent(DEFAULT_CALENDAR_ID, eventId, userEmail);

      if (response && response.status === 'success') {
        Alert.alert("RSVP Success", "Your RSVP has been recorded.");
        fetchEvents(); // Refresh the event list.
      } else {
        Alert.alert("RSVP Error", "Failed to record RSVP.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while sending RSVP.");
    }
  };
  
  // Show attendance by calling the backend and updating the modal.
  const handleShowAttendance = async (eventId: string): Promise<void> => {
    try {
      const response = await backendShowAttendance(DEFAULT_CALENDAR_ID, eventId);
      if (response && response.status === 'success') {
        setCurrentAttendees(response.attendees);
        setAttendanceModalVisible(true);
      } else {
        Alert.alert("Error", "Failed to fetch attendance.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching attendance.");
    }
  };

  // Handle calendar day selection
  const onDayPress = (day: { dateString: string }): void => {
    setSelectedDate(day.dateString);
    fetchEvents();
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
  
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
            <Button title="RSVP" onPress={() => handleRSVP(item.id)} />
            <Button title="View Attendance" onPress={() => handleShowAttendance(item.id)} />
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
