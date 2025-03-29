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
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar, DateData } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  createEvent,
  deleteEvent,
  listEvents,
  rsvpEvent,
  showAttendance,
  updateEvent,
} from '@/services/calendarService';
import { Collapsible } from "../Collapsible";

const { height: windowHeight } = Dimensions.get('window');

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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const teamCalendarId = userInfo?.calendar_id;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const fetchedEvents = await listEvents(teamCalendarId);
    setEvents(fetchedEvents);
    
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
    setOpenDropdownId(null);
  };

  const deleteEvents = async (eventId: string) => {
    await deleteEvent(teamCalendarId, eventId);
    
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    
    const updatedSelectedDayEvents = selectedDayEvents.filter(event => event.id !== eventId);
    setSelectedDayEvents(updatedSelectedDayEvents);
    
    setOpenDropdownId(null);
    fetchEvents();
  }

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

        {/* Event Details Modal */}
        <Modal visible={eventDetailsVisible} transparent animationType="fade">
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
                      
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle}>{event.summary}</Text>
                        {userInfo.user_type === 'management' && (
                          <TouchableOpacity
                            onPress={() =>
                              setOpenDropdownId(
                                openDropdownId === event.id ? null : event.id
                              )
                            }
                            style={styles.moreButton}
                          >
                            <Ionicons
                              name="ellipsis-horizontal-outline"
                              size={24}
                              color="#e88e61"
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      {openDropdownId === event.id && (
                        <View style={styles.dropdownContainer}>
                          <TouchableOpacity
                            onPress={() => {
                              setCurrentEvent(event);
                              setOpenDropdownId(null);
                              setEditEventVisible(true);
                              setEventForm({
                                summary: event.summary,
                                description: event.description || '',
                                startTime: new Date(
                                  event.start.dateTime ||
                                    event.start.date ||
                                    Date.now()
                                ),
                                endTime: new Date(
                                  event.end.dateTime ||
                                    event.end.date ||
                                    Date.now()
                                ),
                              });
                            }}
                            style={styles.dropdownItem}
                          >
                            <Ionicons
                              name="create-outline"
                              size={24}
                              color="#e88e61"
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => { deleteEvents(event.id) }}
                            style={styles.dropdownItem}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={24}
                              color="#FF3B30"
                            />
                          </TouchableOpacity>
                        </View>
                      )}

                      <Text style={styles.eventDate}>
                        {event.start.dateTime || event.start.date}
                      </Text>

                      <Text style={styles.eventDescription}>
                        {event.description || 'No description'}
                      </Text>

                      <View style={styles.actionButtons}>
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

        {/* Create/Edit Event Modal */}
        {(createEventVisible || editEventVisible) && (
          <Modal visible={true} transparent animationType="fade">
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
                  multiline
                />

                {/* Start Time Picker */}
                <View style={styles.timePickerRow}>
                  <Text style={styles.timePickerLabel}>Start Time:</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    style={styles.timePickerButton}
                  >
                    <Text style={styles.timePickerText}>
                      {eventForm.startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    style={styles.timePickerButton}
                  >
                    <Text style={styles.timePickerText}>
                      {eventForm.endTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
                    setOpenDropdownId(null);
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
    paddingBottom: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    height: windowHeight * 0.7,
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#e88e61',
  },
  dropdownContainer: {
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
    gap: 15,
    marginVertical: 4,
    position: 'absolute',
    right: 0,
    top: 40,
  },
  dropdownItem: {
    marginHorizontal: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: 'auto'
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
