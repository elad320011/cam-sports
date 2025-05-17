import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Button, Alert, Modal } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { getFormation, createFormation, updateFormation, updatePlayerRole, Formation, getTeamPlayers, PlayerInfo } from '@/services/formationService';

const Player = ({ number, positionName, initialX, initialY, playerInfo, formationId }: { number: number; positionName: string; initialX: number; initialY: number; playerInfo: { name: string; instructions: string }; formationId: string }) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playerInfo.name);
  const [editedInstructions, setEditedInstructions] = useState(playerInfo.instructions);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
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

  useEffect(() => {
    if (isEditing) {
      fetchPlayers(); // Fetch players when entering edit mode
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      await updatePlayerRole(formationId, number, editedName, editedInstructions);
      playerInfo.name = players.find((player) => player.id === editedName)?.fullName || 'Unassigned';
      playerInfo.instructions = editedInstructions;
      Alert.alert('Success', 'Player information updated successfully.');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update player information.');
    }
  };

  const handleEdit = () => {
    // Initialize editedName with the correct player ID if it exists
    const matchingPlayer = players.find((player) => player.fullName === playerInfo.name);
    if (matchingPlayer) {
      setEditedName(matchingPlayer.id); // Set to the matching player's ID
    } else if (players.length > 0) {
      setEditedName(players[0].id); // Default to the first player's ID
    } else {
      setEditedName(''); // Fallback to an empty string if no players exist
    }

    // Initialize editedInstructions with the current instructions or an empty string
    setEditedInstructions(playerInfo.instructions || '');
    setIsEditing(true);
  };

  return (
    <>
      <PanGestureHandler onGestureEvent={handleGesture}>
        <Animated.View style={[styles.player, animatedStyle]}>
          <Text style={styles.playerText} onPress={() => setModalVisible(true)}>
            {`${number} (${positionName})`}
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
          <View style={styles.modalContent}>
            {isEditing ? (
              <>
                <Picker
                  selectedValue={editedName}
                  onValueChange={(itemValue) => setEditedName(itemValue)} // Ensure editedName is updated on selection
                  style={styles.picker}
                >
                  {players.map((player) => (
                    <Picker.Item key={player.id} label={player.fullName} value={player.id} />
                  ))}
                </Picker>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={editedInstructions}
                  onChangeText={setEditedInstructions}
                  placeholder="Enter instructions"
                  multiline
                />
                <Button title="Save" onPress={handleSave} />
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{playerInfo.name}</Text>
                <Text style={styles.modalInstructions}>{playerInfo.instructions}</Text>
                <Button title="Edit" onPress={handleEdit} />
              </>
            )}
            <Button title="Close" onPress={() => { setModalVisible(false); setIsEditing(false); }} />
          </View>
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
        // Update the URL with the new formation ID
        window.history.replaceState(
          {},
          '',
          `/formations?id=${createdFormation.id}&isNew=false`
        );
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
          positionName: 'RB',
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
          positionName: 'RF',
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
          positionName: 'CF',
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
          positionName: 'LF',
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
          positionName: 'LB',
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
          positionName: 'CB',
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
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={formationName}
              onChangeText={handleChange}
              placeholder="Enter formation name"
            />
            <Button title="Save" onPress={handleSave} />
            <Button title="Cancel" onPress={handleCancel} color="red" />
          </View>
        ) : (
          <View style={styles.nameContainer}>
            <Text style={styles.title}>{formationName}</Text>
            <Button title="Edit" onPress={() => setIsEditing(true)} />
          </View>
        )}
        <View style={styles.court}>
          {positions.map((pos) => (
            <Player
              key={pos.number}
              number={pos.number}
              positionName={pos.positionName}
              initialX={pos.x}
              initialY={pos.y}
              playerInfo={pos.playerInfo}
              formationId={currentFormationId}
            />
          ))}
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    width: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#333',
  },
  court: {
    width: '90%',
    height: '70%',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  player: {
    width: 70,
    height: 70,
    backgroundColor: '#4caf50',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  playerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalInstructions: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    marginBottom: 16,
  },
});

export default FormationsPage;
