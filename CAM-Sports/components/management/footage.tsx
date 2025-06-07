import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, Image } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible } from "../Collapsible";
import { Ionicons } from '@expo/vector-icons';
import { Card, Divider } from 'react-native-paper';
import { ButtonGroupWrapper } from '../ButtonGroupWrapper';
import { AddFootage } from './footageComponents/addFootage';

export function Footage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [videos, setVideos] = useState<{ id: string; title: string; url: string, tags: string[], user_id: string }[]>([]);
  const { logout, user } = useAuth();
  const [tags, setTags] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showPlayer, setShowPlayer] = useState(true);
  const [filteredVideos, setFilteredVideos] = useState<{ id: string; title: string; url: string, tags: string[], user_id: string }[]>([]);
  const [refreshVideos, setRefreshVideos] = useState(false);
  const [reveresed, setReveresed] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  const backButton = () => {
    if (filteredVideos.length === 0) return;
    if (currentIndex === 0) {
        setCurrentIndex(filteredVideos.length - 1);
    }
    else {
        setCurrentIndex(currentIndex - 1)
    }
  }

  const forwardButton = () => {
    if (filteredVideos.length === 0) return;
    if (currentIndex === filteredVideos.length - 1) {
        setCurrentIndex(0);
    }
    else {
        setCurrentIndex(currentIndex + 1)
    }
  }

  const handleAddTag = () => {
    const trimmedTag = currentTagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTagInput('');
    } else if (trimmedTag && tags.includes(trimmedTag)) {
        setCurrentTagInput('');
    } else {
        setCurrentTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axiosInstance.get(`/footage/get_footage_by_team?team_id=${user?.team_id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.footage) {
          setVideos(response.data.footage);
        }
        else {
          throw new Error("Could not fetch footage.")
        }
      } catch (error) {
      }
    };
    fetchVideos()
  }, [refreshVideos, user?.team_id]);

  useEffect(() => {
    const filterFootage = () => {
      const tempFilteredVideos = videos.filter(video => {
        if (tags.length === 0) {
          return true;
        }
        return tags.every(tag => video.tags.includes(tag));
      });

      reveresed ? setFilteredVideos(tempFilteredVideos.reverse()) : setFilteredVideos(tempFilteredVideos);
      if (currentIndex >= tempFilteredVideos.length) {
        setCurrentIndex(0);
      } else if (tempFilteredVideos.length > 0 && currentIndex === 0 && filteredVideos.length === 0) {
        setCurrentIndex(0);
      }
    }
    filterFootage();
  }, [tags, videos, refreshVideos, filteredVideos.length, reveresed]);

  const currentVideo = filteredVideos[currentIndex];

  const deleteFootage = async (videoId: string) => {
    Alert.alert(
      "Delete Video",
      "Are you sure you want to delete this video?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.delete(`/footage/delete?footage_id=${videoId}`, {
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              setRefreshVideos(!refreshVideos);
            } catch (error) {
                console.error("Error deleting video:", error);
                Alert.alert("Error", "Failed to delete video. Please try again later.");
            }
          },
        },
      ]
    );
  }

  return (
    <Collapsible
      title="Footage"
      image={require('@/assets/images/footage.png')}
      imageStyle={styles.image}
      titleContainerStyle={styles.imageWrapper}
    >
      <View style={styles.container}>
        <AddFootage visible={showAddVideoModal} setVisible={setShowAddVideoModal} teamId={user?.team_id} userId={user?.email} />
        <View style={styles.filterControlsContainer}>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="filter-sharp"
              size={24}
              color="#cdd1ce"
              style={styles.iconButton}
            />
          </TouchableOpacity>
          {showFilters == false && (
            <TouchableOpacity
              onPress={() => setShowAddVideoModal(true)}
            >
              <Ionicons
                name='add-circle-sharp'
                size={24}
                color='#cdd1ce'
                style={styles.iconButton}
              />
            </TouchableOpacity>
          )}
          {showFilters && (
            <View style={styles.filterOptionsRow}>
              <TouchableOpacity
                onPress={() => {
                  setReveresed(false);
                  setCurrentIndex(0);
                }}
              >
                <Ionicons
                  name='arrow-up'
                  size={24}
                  color='#cdd1ce'
                  style={styles.iconButton}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setReveresed(true);
                  setCurrentIndex(0);
                }}
              >
                <Ionicons
                  name='arrow-down'
                  size={24}
                  color='#cdd1ce'
                  style={styles.iconButton}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setRefreshVideos(!refreshVideos)
                }}
              >
                <Ionicons
                  name='refresh-outline'
                  size={24}
                  color='#cdd1ce'
                  style={styles.iconButton}
                />
              </TouchableOpacity>

              {!showSearch ? (
                <TouchableOpacity
                  onPress={() => {
                    setShowSearch(true);
                  }}
                >
                  <Ionicons
                    name="search-sharp"
                    size={24}
                    color='#cdd1ce'
                    style={styles.iconButton}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.tagInputContainer}>
                  {tags.map((tag, index) => (
                    <View key={index} style={styles.tagChip}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => handleRemoveTag(tag)} style={styles.removeTagButton}>
                        <Trash2 size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TextInput
                    style={styles.tagTextInput}
                    placeholderTextColor="#a0a0a0"
                    placeholder='Filter tags...'
                    value={currentTagInput}
                    onChangeText={setCurrentTagInput}
                    onSubmitEditing={handleAddTag}
                    returnKeyType="done"
                  />
                </View>
              )}
              {showSearch && (
                <TouchableOpacity
                  onPress={() => {
                    setShowSearch(false);
                    setTags([]);
                    setCurrentTagInput('');
                  }}
                >
                  <Ionicons
                    name="close-sharp"
                    size={24}
                    color='#cdd1ce'
                    style={styles.iconButton}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.videoPlayerWrapper}>
          <Card style={styles.videoCard}>
            <Card.Content>
                {currentVideo && (
                  <View style={styles.videoDetailsContainer}>
                    <Text style={styles.videoTitle}>{currentVideo.title}</Text>
                    <Text style={styles.videoTags}>{currentVideo.tags.join(', ')}</Text>
                  </View>
                )}
                {currentVideo && filteredVideos.length > 0 && (user?.email === currentVideo.user_id || user?.user_type == 'management')&& (
                  <TouchableOpacity
                      style={{ position: 'absolute', top: 15, right: 15 }}
                      onPress={() => {
                          deleteFootage(currentVideo.id);
                      }}
                  >
                      <Ionicons name="trash-outline" size={24} color="#e88e61" />
                  </TouchableOpacity>
                )}
                {filteredVideos.length > 0 && currentVideo ? (
                    <YoutubePlayer
                        height={180}
                        play={playing}
                        videoId={currentVideo.url.split('v=')[1]?.split("&")[0]}
                        onChangeState={onStateChange}
                        onError={(error) => {setShowPlayer(false); console.error("Youtube Player Error:", error)}}
                        onReady={() => setShowPlayer(true)}
                    />
                ) : (
                  <Text style={styles.noVideosText}>No videos found with the selected filters.</Text>
                )}

                <Divider style={styles.divider} />

                <ButtonGroupWrapper
                    buttons={["<", playing ? "pause" : "play", ">"]}
                    onPress={(index) => {
                        if (index === 0) {
                            backButton()
                        }
                        else if (index === 2) {
                            forwardButton()
                        }
                        else {
                            togglePlaying();
                        }
                    }}
                    containerStyle={styles.buttonGroupContainer}
                    buttonStyle={styles.buttonGroupButton}
                    selectedButtonStyle={styles.buttonGroupSelectedButton}
                    textStyle={styles.buttonGroupText}
                    selectedTextStyle={styles.buttonGroupSelectedText}
                />
            </Card.Content>
        </Card>
        </View>
      </View>
    </Collapsible>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10,
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 10,
  },
  filterControlsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
    marginTop: 5,
  },
  iconButton: {
    padding: 5,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
  },
  tagInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a5a6a',
    borderRadius: 2,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flex: 1,
    marginTop: 10,
    marginRight: 10,
    backgroundColor: '#1a2a3a',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a3a4a',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    color: 'white',
    marginRight: 5,
    fontSize: 13,
  },
  removeTagButton: {
    marginLeft: 5,
  },
  tagTextInput: {
    color: 'white',
    flex: 1,
    minWidth: 80,
    paddingVertical: 0,
    maxHeight: 50,
    fontSize: 15,
  },
  videoPlayerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  videoCard: {
    backgroundColor: 'transparent',
    width: '90%',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    padding: 10,
  },
  videoDetailsContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  videoTags: {
    fontSize: 15,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 25,
    backgroundColor: '#4a5a6a',
  },
  buttonGroupContainer: {
    marginBottom: 10,
    backgroundColor: 'transparent',
    borderColor: '#4a5a6a',
    borderRadius: 2,
    height: 45,
  },
  buttonGroupButton: {
    borderRadius: 2,
  },
  buttonGroupSelectedButton: {
    backgroundColor: '#007bff',
  },
  buttonGroupText: {
    color: '#cdd1ce',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonGroupSelectedText: {
    color: 'white',
  },
  noVideosText: {
    color: '#cdd1ce',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    paddingVertical: 50,
  },
  imageWrapper: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between'
  },
  image: {
    tintColor: '#fff',
    width: 52,
    height: 52
  },
});

export default Footage;
