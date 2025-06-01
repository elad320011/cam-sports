import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Button, Alert, Modal, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { getFormation, createFormation, updateFormation, updatePlayerRole, Formation, getTeamPlayers, PlayerInfo, getUsedPlayerIds } from '@/services/formationService';
import { colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const Player = ({ number, positionName, initialX, initialY, playerInfo, formationId, formationData }: { 
    number: number; 
    positionName: string; 
    initialX: number; 
    initialY: number; 
    playerInfo: { name: string; instructions: string }; 
    formationId: string;
    formationData: Formation | null;
}) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedInstructions, setEditedInstructions] = useState('');
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [currentFormationData, setCurrentFormationData] = useState<Formation | null>(formationData);
  const { user } = useAuth();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleGesture = (event: any) => {
    translateX.value = withSpring(initialX + event.translationX);
    translateY.value = withSpring(initialY + event.translationY);
  };

  const fetchPlayers = async () => {
    try {
      if (!user?.team_id) {
        return;
      }
      const teamPlayers = await getTeamPlayers(user.team_id);
      setPlayers(teamPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchCurrentFormation = async () => {
    try {
      if (!formationId) return;
      const formation = await getFormation(formationId);
      setCurrentFormationData(formation);
    } catch (error) {
      console.error('Error fetching current formation:', error);
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchPlayers();
      fetchCurrentFormation();
    }
  }, [isEditing]);

  const handleEdit = () => {
    // Find the current player ID from the formation data
    const currentRoleKey = `role_${number}` as keyof Formation['roles'];
    const currentPlayerId = currentFormationData?.roles[currentRoleKey]?.player_id;
    
    // Set the initial values
    setEditedName(currentPlayerId || '');
    setEditedInstructions(playerInfo.instructions || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updatePlayerRole(formationId, number, editedName, editedInstructions);
      // Update the display name based on the selected player
      const selectedPlayer = players.find((player) => player.id === editedName);
      playerInfo.name = selectedPlayer?.fullName || 'Unassigned';
      playerInfo.instructions = editedInstructions;
      // Refresh formation data after update
      await fetchCurrentFormation();
      Alert.alert('Success', 'Player information updated successfully.');
      setIsEditing(false);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update player information.');
    }
  };

  // Get the list of players that are already assigned to other roles
  const usedPlayerIds = getUsedPlayerIds(currentFormationData);
  // Filter out the current role's player ID from the used list
  const currentRoleKey = `role_${number}` as keyof Formation['roles'];
  const currentPlayerId = currentFormationData?.roles[currentRoleKey]?.player_id;
  const otherUsedPlayerIds = usedPlayerIds.filter(id => id !== currentPlayerId);

  return (
    <>
      <PanGestureHandler onGestureEvent={handleGesture}>
        <Animated.View style={[styles.player, animatedStyle]}>
          <LinearGradient
            colors={[colors.cardBackground, colors.cardBackgroundLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playerCircle}
            onTouchEnd={() => setModalVisible(true)}
          >
            <View style={styles.playerTextContainer}>
              <Text style={styles.playerNumber}>{number}</Text>
              <Text style={styles.playerPosition}>{positionName}</Text>
            </View>
          </LinearGradient>
          <Text style={styles.playerName} numberOfLines={1}>
            {playerInfo.name}
          </Text>
        </Animated.View>
      </PanGestureHandler>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[colors.cardBackground, colors.cardBackgroundLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            {isEditing ? (
              <>
                <Text style={styles.modalSubtitle}>Select Player</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={editedName}
                    onValueChange={(itemValue) => setEditedName(itemValue)}
                    style={styles.picker}
                    dropdownIconColor={colors.textPrimary}
                  >
                    <Picker.Item 
                      label="Unassigned" 
                      value="" 
                      color={colors.textPrimary}
                    />
                    {players
                      .filter(player => player.fullName !== 'Unassigned') // Filter out any "Unassigned" players from the list
                      .map((player) => {
                        const isDisabled = otherUsedPlayerIds.includes(player.id);
                        return (
                          <Picker.Item 
                            key={player.id} 
                            label={isDisabled ? `${player.fullName} (Already Assigned)` : player.fullName} 
                            value={player.id}
                            enabled={!isDisabled}
                            color={isDisabled ? colors.textSecondary : colors.textPrimary}
                          />
                        );
                    })}
                  </Picker>
                </View>
                <Text style={styles.modalSubtitle}>Instructions</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={editedInstructions}
                  onChangeText={setEditedInstructions}
                  placeholder="Enter instructions"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <MaterialIcons name="save" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => { setModalVisible(false); setIsEditing(false); }}
                  >
                    <MaterialIcons name="close" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{playerInfo.name}</Text>
                <Text style={styles.modalInstructions}>{playerInfo.instructions}</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={handleEdit}
                  >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => { setModalVisible(false); setIsEditing(false); }}
                  >
                    <MaterialIcons name="close" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
};

const FormationsPage = () => {
  const { user } = useAuth();
  const { isNew, formationId } = useLocalSearchParams();
  const isNewFormation = isNew === 'true';
  const [formationName, setFormationName] = useState(isNewFormation ? '' : 'Default Formation');
  const [originalFormationName, setOriginalFormationName] = useState(formationName);
  const [isEditing, setIsEditing] = useState(isNewFormation);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formationData, setFormationData] = useState<Formation | null>(null);
  const [currentFormationId, setCurrentFormationId] = useState<string>(formationId as string);

  useEffect(() => {
    if (formationId && !isNewFormation) {
      const fetchFormation = async () => {
        try {
          const formation = await getFormation(formationId as string);
          setFormationName(formation.name);
          setOriginalFormationName(formation.name);
          setFormationData(formation);
          setCurrentFormationId(formationId as string);
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch formation details.');
        }
      };
      fetchFormation();
    }
  }, [formationId, isNewFormation]);

  const handleSave = async () => {
    if (formationName.trim() === '') {
      Alert.alert('Error', 'Formation name cannot be empty.');
      return;
    }

    if (isNewFormation) {
      try {
        const createdFormation = await createFormation(formationName, user?.team_id || '');
        setFormationData(createdFormation);
        setCurrentFormationId(createdFormation.id);
        setIsEditing(false);
        setHasUnsavedChanges(false);
        Alert.alert('Success', 'Formation created successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to create formation.');
      }
    } else {
      try {
        if (!formationData?.roles) {
          throw new Error('No formation data available');
        }
        await updateFormation(currentFormationId, formationName, formationData.roles);
        Alert.alert('Success', 'Formation updated successfully.');
        setIsEditing(false);
        setHasUnsavedChanges(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to update formation.');
      }
    }
  };

  const handleCancel = () => {
    setFormationName(originalFormationName); // Revert to the original name
    setIsEditing(false);
    setHasUnsavedChanges(false); // Reset unsaved changes
  };

  const handleChange = (newName: string) => {
    setFormationName(newName);
    setHasUnsavedChanges(true); // Mark as having unsaved changes
  };

  const positions = formationData
    ? [
        {
          number: 1,
          positionName: 'Setter',
          x: 100,
          y: 150,
          playerInfo: {
            name: formationData.roles.role_1?.name || 'Unassigned',
            instructions: formationData.roles.role_1?.instructions || '',
            player_id: formationData.roles.role_1?.player_id || null,
          },
        },
        {
          number: 2,
          positionName: 'Outside Hitter',
          x: 100,
          y: -50,
          playerInfo: {
            name: formationData.roles.role_2?.name || 'Unassigned',
            instructions: formationData.roles.role_2?.instructions || '',
            player_id: formationData.roles.role_2?.player_id || null,
          },
        },
        {
          number: 3,
          positionName: 'Middle Blocker',
          x: 0,
          y: -150,
          playerInfo: {
            name: formationData.roles.role_3?.name || 'Unassigned',
            instructions: formationData.roles.role_3?.instructions || '',
            player_id: formationData.roles.role_3?.player_id || null,
          },
        },
        {
          number: 4,
          positionName: 'Opposite',
          x: -100,
          y: -50,
          playerInfo: {
            name: formationData.roles.role_4?.name || 'Unassigned',
            instructions: formationData.roles.role_4?.instructions || '',
            player_id: formationData.roles.role_4?.player_id || null,
          },
        },
        {
          number: 5,
          positionName: 'Outside Hitter',
          x: -100,
          y: 150,
          playerInfo: {
            name: formationData.roles.role_5?.name || 'Unassigned',
            instructions: formationData.roles.role_5?.instructions || '',
            player_id: formationData.roles.role_5?.player_id || null,
          },
        },
        {
          number: 6,
          positionName: 'Libero',
          x: 0,
          y: 100,
          playerInfo: {
            name: formationData.roles.role_6?.name || 'Unassigned',
            instructions: formationData.roles.role_6?.instructions || '',
            player_id: formationData.roles.role_6?.player_id || null,
          },
        },
      ]
    : [];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: '',
        }}
      />
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.cardBackground, colors.cardBackgroundLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerContainer}
        >
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={formationName}
                onChangeText={handleChange}
                placeholder="Enter formation name"
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <MaterialIcons name="save" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <MaterialIcons name="cancel" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{formationName}</Text>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <MaterialIcons name="edit" size={20} color="#fff" />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </LinearGradient>
        <LinearGradient
          colors={[colors.cardBackground, colors.cardBackgroundLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.court}
        >
          {positions.map((pos) => (
            <Player
              key={pos.number}
              number={pos.number}
              positionName={pos.positionName}
              initialX={pos.x}
              initialY={pos.y}
              playerInfo={pos.playerInfo}
              formationId={currentFormationId}
              formationData={formationData}
            />
          ))}
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    padding: 16,
  },
  headerContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.cardBackgroundLight,
    color: colors.textPrimary,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
  editButton: {
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  court: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  player: {
    width: 70,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  playerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
    padding: 4,
  },
  playerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  playerNumber: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 1,
  },
  playerPosition: {
    color: colors.textPrimary,
    fontWeight: '500',
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    width: '100%',
    paddingHorizontal: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  modalInstructions: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.cardBackgroundLight,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 40,
    color: colors.textPrimary,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 4,
    gap: 8,
  },
});

export default FormationsPage;
