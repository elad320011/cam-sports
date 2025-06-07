import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
  AppState
} from "react-native";
import { Collapsible } from "../Collapsible";
import { getTeamMessageBoard, addMessage, updateMessage, deleteMessage, Message, MessageBoard } from "../../services/messageBoardService";
import { registerPushToken } from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import { format } from 'date-fns';
import { colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axiosInstance from '@/utils/axios';

const { width } = Dimensions.get('window');

interface NotificationResponse {
  notification: {
    request: {
      content: {
        title: string;
        body: string;
        data: {
          messageId: string;
        };
      };
    };
  };
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('announcement');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();
  const isManagement = user?.user_type === 'management';
  const lastMessageTimestamp = useRef<string>('');
  const pollingInterval = useRef<NodeJS.Timeout>();
  const appState = useRef(AppState.currentState);
  const [expoPushToken, setExpoPushToken] = useState<string>('');

  useEffect(() => {
    registerForPushNotificationsAsync();
    setupNotificationListeners();
    fetchMessages();
    setupPolling();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        fetchMessages();
      }
      appState.current = nextAppState;
    });

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      subscription.remove();
    };
  }, []);

  const setupPolling = () => {
    // Poll for new messages every 10 seconds
    pollingInterval.current = setInterval(async () => {
      if (appState.current === 'active') {
        checkForNewMessages();
      }
    }, 10000);
  };

  const checkForNewMessages = async () => {
    try {
      const messageBoard = await getTeamMessageBoard(user?.team_id || '');
      const newMessages = messageBoard?.messages || [];

      if (newMessages.length > 0) {
        const latestMessage = newMessages[newMessages.length - 1];

        // Check if this is a new message
        if (latestMessage.created_at !== lastMessageTimestamp.current) {
          lastMessageTimestamp.current = latestMessage.created_at;
          setMessages(newMessages.reverse());

          // Send notification for the new message
          if (!isManagement) { // Only send notifications to players
            await sendImmediateNotification(latestMessage);
            if (latestMessage.type === 'reminder') {
              await scheduleNotification(latestMessage);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      Alert.alert('Must use physical device for Push Notifications');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }

      // Get the token that uniquely identifies this device
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      console.log('Using project ID:', projectId);

      if (!projectId) {
        console.error('No project ID found in app config');
        Alert.alert('Error', 'Push notifications are not properly configured. Please contact support.');
        return;
      }

      let token;
      try {
        token = await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        });
        console.log('Push token:', token.data);
        setExpoPushToken(token.data);
      } catch (error) {
        console.error('Error getting push token:', error);
        Alert.alert('Error', 'Failed to get push token. Please try again.');
        return;
      }

      // Register the token with our server
      if (user?.email) {
        try {
          console.log('Registering push token for user:', user.email);
          await registerPushToken(token.data, user.email);
          console.log('Successfully registered push token');
        } catch (error) {
          console.error('Error registering push token:', error);
          // Don't show alert here, just log the error
          // The token might still be valid even if registration fails
        }
      } else {
        console.error('No user email available for push token registration');
      }

      // Set up notification channels for Android
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            enableVibrate: true,
            enableLights: true,
          });
        } catch (error) {
          console.error('Error setting up Android notification channel:', error);
        }
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
      Alert.alert('Error', 'Failed to set up push notifications. Please try again.');
    }
  };

  const setupNotificationListeners = () => {
    // Handle notification when app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      console.log('Notification received in foreground:', notification);
      // Refresh messages when notification is received
      fetchMessages();
    });

    // Handle notification when app is in background and user taps it
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      console.log('Notification response:', response);
      // Refresh messages when notification is tapped
      fetchMessages();
    });

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  };

  const scheduleNotification = async (message: Message) => {
    if (message.type === 'reminder') {
      // Schedule reminder notification through the server
      await axiosInstance.post('/notifications/send', {
        to: user?.team_id,
        title: 'Reminder',
        body: message.content,
        data: {
          type: 'reminder',
          messageId: message.id,
          teamId: user?.team_id
        }
      });
    }
  };

  const sendImmediateNotification = async (message: Message) => {
    try {
      console.log('Sending immediate notification for message:', message);
      await axiosInstance.post('/notifications/send', {
        to: user?.team_id,
        title: message.type === 'announcement' ? 'New Announcement' : 'New Reminder',
        body: message.content,
        data: {
          type: 'message',
          messageType: message.type,
          messageId: message.id,
          teamId: user?.team_id
        }
      });
      console.log('Successfully sent immediate notification');
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messageBoard = await getTeamMessageBoard(user?.team_id || '');
      const newMessages = messageBoard?.messages || [];
      if (newMessages.length > 0) {
        lastMessageTimestamp.current = newMessages[newMessages.length - 1].created_at;
      }
      setMessages(newMessages.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    try {
      const updatedBoard = await addMessage(user?.team_id || '', newMessage, messageType, user?.email || '');
      const newMessages = (updatedBoard?.messages || []).reverse();
      setMessages(newMessages);

      // The server will handle sending push notifications to all team members
      setNewMessage('');
      setMessageType('announcement');
      setModalVisible(false);
      fetchMessages();
    } catch (error) {
      console.error('Error adding message:', error);
      Alert.alert('Error', 'Failed to add message');
    }
  };

  const handleUpdateMessage = async (index: number) => {
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    try {
      // Calculate the correct index from the end of the array
      const correctIndex = messages.length - 1 - index;
      const updatedBoard = await updateMessage(user?.team_id || '', correctIndex, newMessage, messageType);
      setMessages((updatedBoard?.messages || []).reverse());
      setNewMessage('');
      setEditingIndex(null);
      setModalVisible(false);
      fetchMessages();
    } catch (error) {
      console.error('Error updating message:', error);
      Alert.alert('Error', 'Failed to update message');
    }
  };

  const handleDeleteMessage = async (index: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Calculate the correct index from the end of the array
              const correctIndex = messages.length - 1 - index;
              await deleteMessage(user?.team_id || '', correctIndex);
              await fetchMessages();
            } catch (error) {
              console.error('Error in delete operation:', error);
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const startEditing = (message: Message, index: number) => {
    setNewMessage(message.content);
    setMessageType(message.type);
    setEditingIndex(index);
    setModalVisible(true);
  };

  const renderMessageModal = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setModalVisible(false);
        setNewMessage('');
        setEditingIndex(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingIndex !== null ? 'Edit Message' : 'New Message'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setNewMessage('');
                setEditingIndex(null);
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Write your message..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                messageType === 'announcement' && styles.selectedType
              ]}
              onPress={() => setMessageType('announcement')}
            >
              <Text style={[
                styles.typeButtonText,
                messageType === 'announcement' && styles.selectedTypeText
              ]}>Announcement</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                messageType === 'reminder' && styles.selectedType
              ]}
              onPress={() => setMessageType('reminder')}
            >
              <Text style={[
                styles.typeButtonText,
                messageType === 'reminder' && styles.selectedTypeText
              ]}>Reminder</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => editingIndex !== null ? handleUpdateMessage(editingIndex) : handleAddMessage()}
          >
            <Text style={styles.submitButtonText}>
              {editingIndex !== null ? 'Update' : 'Post'} Message
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <Collapsible
      title="Messages"
      image={require('@/assets/images/messages.png')}
      imageStyle={styles.image}
      titleContainerStyle={styles.imageWrapper}
    >
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.container}>
          <View style={styles.messagesContainer}>
            <ScrollView
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              scrollEnabled={true}
            >
              {messages.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubble-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No messages yet</Text>
                  {isManagement && (
                    <Text style={styles.emptySubText}>Tap the button below to create your first message</Text>
                  )}
                </View>
              ) : (
                messages.map((message, index) => (
                  <View key={index} style={styles.messageContainer}>
                    <View style={styles.messageHeader}>
                      <View style={styles.messageTypeContainer}>
                        <View style={[
                          styles.messageTypeIndicator,
                          { backgroundColor: message.type === 'announcement' ? colors.primary : colors.accentYellow }
                        ]} />
                        <Text style={styles.messageType}>{message.type}</Text>
                      </View>
                      <Text style={styles.messageDate}>
                        {format(new Date(message.created_at), 'MMM d, yyyy HH:mm')}
                      </Text>
                    </View>

                    <Text style={styles.messageContent}>{message.content}</Text>

                    <View style={styles.messageFooter}>
                      <Text style={styles.creatorEmail}>By: {message.creator_email}</Text>

                      {isManagement && (
                        <View style={styles.messageActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => startEditing(message, index)}
                          >
                            <Ionicons name="create-outline" size={20} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDeleteMessage(index)}
                          >
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          {isManagement && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color={colors.textOnPrimary} />
              <Text style={styles.createButtonText}>New Message</Text>
            </TouchableOpacity>
          )}

          {renderMessageModal()}
        </View>
      )}
    </Collapsible>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    minHeight: 400,
  },
  messagesContainer: {
    height: 400,
    marginBottom: 10,
    overflow: 'hidden',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 10,
    flexGrow: 1,
  },
  messageContainer: {
    backgroundColor: colors.cardBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  messageTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  messageType: {
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  messageDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  messageContent: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 10,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
    paddingTop: 10,
  },
  creatorEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  messageActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    margin: 10,
    gap: 8,
  },
  createButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 5,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 15,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderColor,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  selectedTypeText: {
    color: colors.textOnPrimary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  imageWrapper: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between'
  },
  image: {
    tintColor: colors.textPrimary,
    width: 52,
    height: 52
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
});
