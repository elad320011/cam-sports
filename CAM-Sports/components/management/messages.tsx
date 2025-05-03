import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Collapsible } from "../Collapsible";
import { getTeamMessageBoard, addMessage, updateMessage, deleteMessage, Message, MessageBoard } from "../../services/messageBoardService";
import { useAuth } from "../../contexts/AuthContext";
import { format } from 'date-fns';

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('announcement');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { user } = useAuth();
  const isManagement = user?.user_type === 'management';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messageBoard = await getTeamMessageBoard(user?.team_id || '');
      console.log('Message board response:', messageBoard);
      setMessages(messageBoard?.messages || []);
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
      console.log('Add message response:', updatedBoard);
      setMessages(updatedBoard?.messages || []);
      setNewMessage('');
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
      const updatedBoard = await updateMessage(user?.team_id || '', index, newMessage, messageType);
      console.log('Update message response:', updatedBoard);
      setMessages(updatedBoard?.messages || []);
      setNewMessage('');
      setEditingIndex(null);
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
              await deleteMessage(user?.team_id || '', index);
              console.log('Delete successful, refreshing messages');
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
  };

  return (
    <Collapsible title="Messages">
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.container}>
          {messages.map((message, index) => (
            <View key={index} style={styles.messageContainer}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageType}>{message.type}</Text>
                <Text style={styles.messageDate}>
                  {format(new Date(message.created_at), 'MMM d, yyyy HH:mm')}
                </Text>
              </View>
              <Text style={styles.messageContent}>{message.content}</Text>
              <Text style={styles.creatorEmail}>By: {message.creator_email}</Text>
              
              {isManagement && (
                <View style={styles.messageActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      console.log('Edit button pressed');
                      startEditing(message, index);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      console.log('Delete button pressed for index:', index);
                      handleDeleteMessage(index);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {isManagement && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder={editingIndex !== null ? "Edit message..." : "Add new message..."}
                multiline
              />
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    messageType === 'announcement' && styles.selectedType
                  ]}
                  onPress={() => {
                    console.log('Announcement type selected');
                    setMessageType('announcement');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.typeButtonText}>Announcement</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    messageType === 'reminder' && styles.selectedType
                  ]}
                  onPress={() => {
                    console.log('Reminder type selected');
                    setMessageType('reminder');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.typeButtonText}>Reminder</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  console.log('Submit button pressed');
                  editingIndex !== null ? handleUpdateMessage(editingIndex) : handleAddMessage();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>
                  {editingIndex !== null ? 'Update' : 'Add'} Message
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </Collapsible>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  messageContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  messageType: {
    fontWeight: 'bold',
    color: '#666',
  },
  messageDate: {
    color: '#666',
    fontSize: 12,
  },
  messageContent: {
    fontSize: 16,
    marginBottom: 5,
  },
  creatorEmail: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
  },
  inputContainer: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  typeButton: {
    padding: 8,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedType: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
