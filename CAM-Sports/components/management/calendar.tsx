import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import {
  createEvent,
  deleteEvent,
  listEvents,
  rsvpEvent,
  showAttendance,
  updateEvent,
} from '@/services/calendarService';
import { Collapsible } from "../Collapsible";
import DateTimePicker from '@react-native-community/datetimepicker';

interface Attendee {
  email: string;
  responseStatus: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  attendees?: Attendee[];
}

interface MarkedDates {
  [key: string]: { marked?: boolean; dotColor?: string; selected?: boolean };
}

// Custom button component to mimic Apple style
const AppButton = ({
  title,
  onPress,
  containerStyle,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  containerStyle?: any;
  textStyle?: any;
}) => (
  <TouchableOpacity onPress={onPress} style={[styles.appButton, containerStyle]}>
    <Text style={[styles.appButtonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const GameCalendar = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);
  const [eventForm, setEventForm] = useState({
    summary: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
  });
  const [createEventVisible, setCreateEventVisible] = useState(false);
  const [editEventVisible, setEditEventVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const [attendanceList, setAttendanceList] = useState<Attendee[]>([]);
  const [attendanceVisible, setAttendanceVisible] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const teamCalendarId = userInfo?.calendar_id;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const fetchedEvents = await listEvents(teamCalendarId);
    setEvents(fetchedEvents);
    console.log(fetchedEvents);
    const newMarkedDates: MarkedDates = {};
    fetchedEvents.forEach((event: CalendarEvent) => {
      const date = event.start.dateTime?.split('T')[0] || event.start.date;
      if (date) newMarkedDates[date] = { marked: true, dotColor: '#e88e61' };
    });
    setMarkedDates(newMarkedDates);
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    const dayEvents = events.filter(
      (event) =>
        event.start.dateTime?.includes(day.dateString) ||
        event.start.date === day.dateString
    );
    setSelectedDayEvents(dayEvents);
    setEventDetailsVisible(true);
  };

  const handleRSVP = async (eventId: string) => {
    await rsvpEvent(teamCalendarId, eventId, userInfo.email);
    Alert.alert('Success', 'RSVP successful.');
    fetchEvents();
  };

  const handleViewAttendance = async (eventId: string) => {
    const response = await showAttendance(teamCalendarId, eventId);
    setAttendanceList(response.attendees);
    setAttendanceVisible(true);
  };

  const submitEventForm = async () => {
    let fullStart, fullEnd;
    if (selectedDate && selectedDate.split('-').length === 3) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      fullStart = new Date(eventForm.startTime);
      fullStart.setFullYear(year, month - 1, day);
      fullEnd = new Date(eventForm.endTime);
      fullEnd.setFullYear(year, month - 1, day);
    } else {
      fullStart = new Date(eventForm.startTime);
      fullEnd = new Date(eventForm.endTime);
    }

    if (currentEvent) {
      await updateEvent({
        calendar_id: teamCalendarId,
        event_id: currentEvent.id,
        summary: eventForm.summary,
        description: eventForm.description,
        start: fullStart.toISOString(),
        end: fullEnd.toISOString(),
      });
    } else {
      await createEvent({
        calendar_id: teamCalendarId,
        summary: eventForm.summary,
        description: eventForm.description,
        start: fullStart.toISOString(),
        end: fullEnd.toISOString(),
      });
    }
    setCreateEventVisible(false);
    setEditEventVisible(false);
    fetchEvents();
    setEventDetailsVisible(false);
  };

  return (
    <Collapsible title="Calendar">
      <View style={styles.container}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              selected: true,
              selectedColor: '#e88e61',
              ...(markedDates[selectedDate] || {}),
            },
          }}
          theme={{
            todayTextColor: '#e88e61',
            arrowColor: '#e88e61',
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            selectedDayBackgroundColor: '#e88e61',
            selectedDayTextColor: '#ffffff',
            selectedDotColor: '#e88e61',
            dotColor: '#e88e61',
          }}
        />

        {/* Event Details Modal as an overlay */}
        <Modal visible={eventDetailsVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView>
                {selectedDayEvents.length === 0 ? (
                  <Text style={styles.noEventText}>
                    No events scheduled for this day.
                  </Text>
                ) : (
                  selectedDayEvents.map((event) => (
                    <View key={event.id} style={styles.eventItem}>
                      <Text style={styles.eventTitle}>{event.summary}</Text>
                      <Text style={styles.eventDate}>
                        {event.start.dateTime || event.start.date}
                      </Text>
                      <Text style={styles.eventDescription}>
                        {event.description || 'No description'}
                      </Text>
                      {userInfo.user_type === 'management' && (
                        <View style={styles.managementButtons}>
                          <AppButton
                            title="Edit"
                            onPress={() => {
                              setCurrentEvent(event);
                              setEventForm({
                                summary: event.summary,
                                description: event.description || '',
                                startTime: new Date(event.start.dateTime || event.start.date || Date.now()),
                                endTime: new Date(event.end.dateTime || event.end.date || Date.now()),
                              });
                              setEditEventVisible(true);
                            }}
                            containerStyle={styles.smallButton}
                          />
                          <AppButton
                            title="Delete"
                            onPress={() => {
                              deleteEvent(teamCalendarId, event.id);
                              fetchEvents();
                            }}
                            containerStyle={styles.smallButton}
                          />
                        </View>
                      )}
                      <AppButton
                        title="RSVP"
                        onPress={() => handleRSVP(event.id)}
                        containerStyle={styles.smallButton}
                      />
                      <AppButton
                        title="Attendance"
                        onPress={() => handleViewAttendance(event.id)}
                        containerStyle={styles.smallButton}
                      />
                    </View>
                  ))
                )}
                <AppButton
                  title="Close"
                  onPress={() => setEventDetailsVisible(false)}
                  containerStyle={styles.closeButton}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Create/Edit Event Modal as an overlay */}
        {(createEventVisible || editEventVisible) && (
          <Modal visible={true} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <TextInput
                  placeholder="Event Summary"
                  value={eventForm.summary}
                  onChangeText={(text) =>
                    setEventForm({ ...eventForm, summary: text })
                  }
                  style={styles.input}
                  placeholderTextColor="#888"
                />
                <TextInput
                  placeholder="Description"
                  value={eventForm.description}
                  onChangeText={(text) =>
                    setEventForm({ ...eventForm, description: text })
                  }
                  style={[styles.input, { height: 80 }]}
                  placeholderTextColor="#888"
                  multiline={true}
                />
                {/* Start Time Picker */}
                <View style={styles.timePickerRow}>
                  <Text style={styles.timePickerLabel}>Start Time:</Text>
                  <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.timePickerButton}>
                    <Text style={styles.timePickerText}>
                      {eventForm.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>
                {showStartPicker && (
                  <DateTimePicker
                    value={eventForm.startTime}
                    mode="time"
                    display="default"
                    onChange={(event, date) => {
                      if (event.type === 'dismissed') {
                        setShowStartPicker(false);
                        return;
                      }
                      setShowStartPicker(false);
                      if (date) {
                        setEventForm({ ...eventForm, startTime: date });
                      }
                    }}
                  />
                )}

                {/* End Time Picker */}
                <View style={styles.timePickerRow}>
                  <Text style={styles.timePickerLabel}>End Time:</Text>
                  <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.timePickerButton}>
                    <Text style={styles.timePickerText}>
                      {eventForm.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>
                {showEndPicker && (
                  <DateTimePicker
                    value={eventForm.endTime}
                    mode="time"
                    display="default"
                    onChange={(event, date) => {
                      if (event.type === 'dismissed') {
                        setShowEndPicker(false);
                        return;
                      }
                      setShowEndPicker(false);
                      if (date) {
                        setEventForm({ ...eventForm, endTime: date });
                      }
                    }}
                  />
                )}

                <AppButton
                  title="Save"
                  onPress={submitEventForm}
                  containerStyle={styles.modalButton}
                />
                <AppButton
                  title="Cancel"
                  onPress={() => {
                    setCreateEventVisible(false);
                    setEditEventVisible(false);
                  }}
                  containerStyle={styles.modalButton}
                />
              </View>
            </View>
          </Modal>
        )}

        {userInfo.user_type === 'management' && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setCreateEventVisible(true)}
          >
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        )}
      </View>
    </Collapsible>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 10,
    paddingBottom: 80, // Extra space to prevent the button from overlapping the calendar
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  managementButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  appButton: {
    backgroundColor: '#e88e61',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
  },
  appButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  smallButton: {
    backgroundColor: '#e88e61',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    marginVertical: 4,
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: '#e88e61',
    marginTop: 10,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#e88e61',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noEventText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  timePickerLabel: {
    fontSize: 16,
    color: '#333',
    width: 90,
  },
  timePickerButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  timePickerText: {
    fontSize: 16,
    color: '#333',
  },
});

export default GameCalendar;


// import React, { useEffect, useState } from 'react';

// // Components
// import { View, Text, Button, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
// import { Calendar } from 'react-native-calendars';

// // Services
// import { getCalendarByID, listCalendars, shareCalendar, createEvent, getEvent, listEvents, updateEvent, deleteEvent,
//   rsvpEvent,
//   showAttendance as backendShowAttendance,
//   removeRSVP
//  } from '@/services/calendarService';

// // Define types for Calendar Events and Attendees
// interface Attendee {
//   email: string;
//   responseStatus: string;
//   self?: boolean;
// }

// interface CalendarEvent {
//   id: string;
//   summary: string;
//   start: {
//     dateTime?: string;
//     date?: string;
//   };
//   end: {
//     dateTime?: string;
//     date?: string;
//   };
//   attendees?: Attendee[];
// }

// export default function GameCalendar(): JSX.Element {

//   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
//   const [events, setEvents] = useState<CalendarEvent[]>([]);
//   const [attendanceModalVisible, setAttendanceModalVisible] = useState<boolean>(false);
//   const [currentAttendees, setCurrentAttendees] = useState<Attendee[]>([]);

//   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}'); // Change ME
//   // const { userInfo } = useAuth();

//   const team_calendar_id = userInfo?.calendar_id

//   useEffect(() => {
//     (async () => {
//       console.log(await listCalendars());
//       console.log(await getCalendarByID(team_calendar_id));
//     })();

//     // Fetch all events
//     fetchEvents();
//   }, []);


//   // Fetch events for the selected day
//   const fetchEvents = async () => {
//     try {
//       // For now, always use the default calendar
//       const fetchedEvents = await listEvents(team_calendar_id);
      
//       console.log('Fetched events: ', fetchedEvents);
//       setEvents(fetchedEvents);

//     } catch (error) {
//       console.log('Failed to fetch events: ', error);
//     }
//   };

//   // Create an event using the backend
//   const handleCreateEvent = async (): Promise<void> => {
//     try {
//       // Create a test event: summary "Test Event", starting now and ending in 1 hour.
//       const startTime = new Date();
//       const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
//       const eventData = {
//         calendar_id: team_calendar_id,
//         summary: "Test Event",
//         start: startTime.toISOString(),
//         end: endTime.toISOString(),
//         description: "This is a test event."
//       };

//       const newEvent = await createEvent(eventData);
      
//       Alert.alert("Success", "Event created with id: " + newEvent.id);
//       fetchEvents(); // Refresh the event list
    
//     } catch (error) {
//       Alert.alert("Error", "Failed to create event.");
//     }
//   };
  
//   // Delete an event using the backend
//   const handleDeleteEvent = async (): Promise<void> => {
//     try {
//       if (events.length === 0) {
//         Alert.alert("No Event", "No event available to delete.");
//         return;
//       }
      
//       // For demonstration, delete the first event in the list.
//       const eventToDelete = events[0];
//       await deleteEvent(team_calendar_id, eventToDelete.id);
      
//       Alert.alert("Success", "Event deleted.");
//       fetchEvents(); // Refresh the event list

//     } catch (error) {
//       Alert.alert("Error", "Failed to delete event.");
//     }
//   };

//   // Edit an event using the backend
//   const handleEditEvent = async (): Promise<void> => {
//     try {
//       if (events.length === 0) {
//         Alert.alert("No Event", "No event available to edit.");
//         return;
//       }
//       // For demonstration, update the first event's summary.
//       const eventToEdit = events[0];
//       const updatedData = {
//         calendar_id: team_calendar_id,
//         event_id: eventToEdit.id,
//         summary: eventToEdit.summary + " (Updated)",
//         // Check each field independently to support both dateTime and date formats.
//         start: eventToEdit.start.dateTime ? eventToEdit.start.dateTime : eventToEdit.start.date,
//         end: eventToEdit.end.dateTime ? eventToEdit.end.dateTime : eventToEdit.end.date
//       };
  
//       const updatedEvent = await updateEvent(updatedData);
//       Alert.alert("Success", "Event updated with id: " + updatedEvent.id);
//       fetchEvents(); // Refresh the event list
//     } catch (error) {
//       Alert.alert("Error", "Failed to update event.");
//     }
//   };
  
  
//   // RSVP for an event using the backend.
//   const handleRSVP = async (eventId: string): Promise<void> => {
//     // try {
//     //   const userEmail = DEFAULT_EMAIL_ID; // Replace with the actual user email.
//     //   const response = await rsvpEvent(team_calendar_id, eventId, userEmail);

//     //   if (response && response.status === 'success') {
//     //     Alert.alert("RSVP Success", "Your RSVP has been recorded.");
//     //     fetchEvents(); // Refresh the event list.
//     //   } else {
//     //     Alert.alert("RSVP Error", "Failed to record RSVP.");
//     //   }
//     // } catch (error) {
//     //   Alert.alert("Error", "An error occurred while sending RSVP.");
//     // }
//   };
  
//   // Show attendance by calling the backend and updating the modal.
//   const handleShowAttendance = async (eventId: string): Promise<void> => {
//     try {
//       const response = await backendShowAttendance(team_calendar_id, eventId);
//       if (response && response.status === 'success') {
//         setCurrentAttendees(response.attendees);
//         setAttendanceModalVisible(true);
//       } else {
//         Alert.alert("Error", "Failed to fetch attendance.");
//       }
//     } catch (error) {
//       Alert.alert("Error", "An error occurred while fetching attendance.");
//     }
//   };

//   // Handle calendar day selection
//   const onDayPress = (day: { dateString: string }): void => {
//     setSelectedDate(day.dateString);
//     fetchEvents();
//   };

//   return (
//     <View style={{ flex: 1, padding: 10 }}>
  
//       <Calendar 
//         onDayPress={onDayPress} 
//         markedDates={{ [selectedDate]: { selected: true } }} 
//         style={{ marginVertical: 10 }}
//       />

//       <FlatList
//         data={events}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={{ paddingVertical: 10, borderBottomWidth: 1 }}>
//             <Text style={{ fontWeight: 'bold' }}>{item.summary}</Text>
//             <Text>{item.start.dateTime || item.start.date}</Text>
//             <Button title="RSVP" onPress={() => handleRSVP(item.id)} />
//             <Button title="View Attendance" onPress={() => handleShowAttendance(item.id)} />
//           </View>
//         )}
//       />

//       <Button title="Create Event" onPress={handleCreateEvent} />
//       <Button title="Edit Event" onPress={handleEditEvent} />
//       <Button title="Delete Event" onPress={handleDeleteEvent} />

//       {/* Modal for Attendance List */}
//       <Modal visible={attendanceModalVisible} animationType="slide">
//         <View style={{ flex: 1, padding: 20 }}>
//           <Text style={{ fontSize: 18, marginBottom: 10 }}>Attendance List</Text>
//           <FlatList
//             data={currentAttendees}
//             keyExtractor={(item, index) => item.email + index.toString()}
//             renderItem={({ item }) => (
//               <Text>{item.email} - {item.responseStatus}</Text>
//             )}
//           />
//           <Button title="Close" onPress={() => setAttendanceModalVisible(false)} />
//         </View>
//       </Modal>
//     </View>
//   );
// }
