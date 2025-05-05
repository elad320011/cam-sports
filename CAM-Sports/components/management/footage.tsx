import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Dimensions } from 'react-native';
import { Card, Button } from 'react-native-elements';
import { PlusCircle, Trash2 } from 'lucide-react-native'; // Import Trash2
import YoutubePlayer from 'react-native-youtube-iframe';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible } from "../Collapsible";

const Footage = ({ teamId }: { teamId: string }) => {
  const [mode, setMode] = useState<'add' | 'view'>('view');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [footageList, setFootageList] = useState<{ id: string; title: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { logout, user } = useAuth();
  const [playingStates, setPlayingStates] = useState<{ [key: string]: boolean }>({});

  const onStateChange = useCallback((state: string, videoId: string) => {
    if (state === "ended") {
      setPlayingStates(prevStates => ({ ...prevStates, [videoId]: false }));
    }
  }, []);

  const togglePlaying = useCallback((videoId: string) => {
    setPlayingStates(prevStates => ({
      ...prevStates,
      [videoId]: !prevStates[videoId],
    }));
  }, []);

  const fetchFootage = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/footage/get_footage_by_team?team_id=${teamId}`);
      setFootageList(response.data.footage);
      const initialPlayingStates: { [key: string]: boolean } = {};
      response.data.footage.forEach((item: { id: string }) => {
        initialPlayingStates[item.id] = false;
      });
      setPlayingStates(initialPlayingStates);
    } catch (error: any) {
      console.error('Error fetching footage:', error);
      Alert.alert('Error', 'Failed to fetch footage.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch footage from the backend
  useEffect(() => {
    if (mode === 'view') {
      fetchFootage();
    }
  }, [mode, teamId]);

  // Handle adding new footage
  const handleAddFootage = async () => {
    if (!title || !url) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/footage/create', { title, url, team_id: teamId, user_id: user?.email });
      Alert.alert('Success', 'Footage added successfully.');
      setMode('view');
      setTitle('');
      setUrl('');
      fetchFootage();
    } catch (error: any) {
      console.error('Error adding footage:', error);
      Alert.alert('Error', 'Failed to add footage.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting footage
  const handleDeleteFootage = async (id: string) => {
    try {
      await axiosInstance.delete(`/footage/delete?footage_id=${id}`);
      Alert.alert('Success', 'Footage deleted successfully.');
      fetchFootage();
    } catch (error: any) {
      console.error('Error deleting footage:', error);
      Alert.alert('Error', 'Failed to delete footage.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Collapsible title="Footage">
      <View style={styles.container}>
        {mode === 'add' ? (
          <View>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.label}>YouTube URL</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="Enter YouTube URL"
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.buttonContainer}>
              <Button
                title="Add"
                onPress={handleAddFootage}
                buttonStyle={styles.addButton}
                titleStyle={styles.buttonText}
                loading={loading}
              />
              <Button
                title="Cancel"
                onPress={() => setMode('view')}
                buttonStyle={styles.cancelButton}
                titleStyle={styles.buttonText}
              />
            </View>
          </View>
        ) : (
          <View>
            <Button
              title="Add New Footage"
              onPress={() => setMode('add')}
              buttonStyle={styles.addNewButton}
              titleStyle={styles.buttonText}
              icon={<PlusCircle size={20} color="white" style={{ marginRight: 8 }} />}
            />
            {loading ? (
              <Text style={styles.loadingText}>Loading footage...</Text>
            ) : (
              <FlatList
                data={footageList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const videoId = item.url.split('v=')[1].split("&t")[0];
                  return (
                    <Card containerStyle={styles.card}>
                      <TouchableOpacity
                        style={styles.deleteIconContainer}
                        onPress={() => handleDeleteFootage(item.id)}
                      >
                        <Trash2 size={24} color="#ef4444" />
                      </TouchableOpacity>
                      <View style={styles.footageItem}>
                        <View style={styles.infoContainer}>
                          <Text style={styles.title}>{item.title}</Text>
                          <YoutubePlayer
                            height={100}
                            play={playingStates[item.id] || false}
                            videoId={videoId}
                            onChangeState={(state) => onStateChange(state, item.id)}
                          />
                        </View>
                      </View>
                    </Card>
                  );
                }}
              />
            )}
          </View>
        )}
      </View>
    </Collapsible>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  label: {
    fontSize: 16,
    fontWeight: 'medium',
    marginBottom: 8,
    color: '#4b5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#1f2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'medium',
  },
  addNewButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  card: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    borderWidth: 0,
    position: 'relative', // Make card position relative for absolute positioning of the icon
  },
  footageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'semibold',
    color: '#1e293b',
    marginBottom: 4,
  },
  url: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'underline',
    textDecorationColor: '#9ca3af',
    flex: 1,
    marginRight: 8,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 16,
  },
  thumbnail: {
    width: 120,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#d1d5db',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.3
  },
  infoContainer: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 16,
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 12, // Optional: make the touch area rounder
    zIndex: 1, // Ensure the icon is above the card content
  },
});

export default Footage;
