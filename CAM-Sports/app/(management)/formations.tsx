import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Button, Alert, Modal } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/contexts/AuthContext';

const Player = ({ number, positionName, initialX, initialY, playerInfo }: { number: number; positionName: string; initialX: number; initialY: number; playerInfo: { name: string; instructions: string } }) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const [modalVisible, setModalVisible] = useState(false);

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
            <Text style={styles.modalTitle}>{playerInfo.name}</Text>
            <Text style={styles.modalInstructions}>{playerInfo.instructions}</Text>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
};

const FormationsPage = () => {
  const { user } = useAuth(); // Ensure useAuth is used within an AuthProvider
  const { isNew, formationId } = useLocalSearchParams(); // Retrieve query parameters
  const isNewFormation = isNew === 'true'; // Check if it's a new formation
  const [formationName, setFormationName] = useState(isNewFormation ? '' : 'Default Formation');
  const [originalFormationName, setOriginalFormationName] = useState(formationName); // Store the original name
  const [isEditing, setIsEditing] = useState(isNewFormation);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes
  interface FormationData {
    roles: {
      role_1?: { player_id?: string; instructions?: string };
      role_2?: { player_id?: string; instructions?: string };
      role_3?: { player_id?: string; instructions?: string };
      role_4?: { player_id?: string; instructions?: string };
      role_5?: { player_id?: string; instructions?: string };
      role_6?: { player_id?: string; instructions?: string };
    };
  }
  
  const [formationData, setFormationData] = useState<FormationData | null>(null); // State to store formation data

  useEffect(() => {
    if (formationId && !isNewFormation) {
      // Fetch the formation details using the formationId
      const fetchFormation = async () => {
        try {
          const response = await axiosInstance.get(`/formations/${formationId}`);
          const fetchedName = response.data.name || 'Unnamed Formation';
          setFormationName(fetchedName);
          setOriginalFormationName(fetchedName); // Store the original name
          setFormationData(response.data); // Store the retrieved formation data
        } catch (error) {
          console.error('Error fetching formation:', error);
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
        const response = await axiosInstance.post('/formations/create', {
          name: formationName,
          team_id: user?.team_id, // Send the team_id in the request body
        });
        if (response.status === 201) {
          Alert.alert('Success', 'Formation created successfully.');
          setIsEditing(false);
          setHasUnsavedChanges(false); // Reset unsaved changes
        }
      } catch (error) {
        console.error('Error creating formation:', error);
        Alert.alert('Error', 'Failed to create formation.');
      }
    } else {
      try {
        const response = await axiosInstance.put(`/formations/${formationId}/edit`, {
          name: formationName,
          roles: formationData?.roles, // Send updated roles
        });
        if (response.status === 200) {
          Alert.alert('Success', 'Formation updated successfully.');
          setIsEditing(false);
          setHasUnsavedChanges(false); // Reset unsaved changes
        }
      } catch (error) {
        console.error('Error updating formation:', error);
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
        { number: 1, positionName: 'RB', x: 100, y: 150, playerInfo: { name: formationData.roles.role_1?.player_id || 'Unassigned', instructions: formationData.roles.role_1?.instructions || 'No instructions' } },
        { number: 2, positionName: 'RF', x: 100, y: -50, playerInfo: { name: formationData.roles.role_2?.player_id || 'Unassigned', instructions: formationData.roles.role_2?.instructions || 'No instructions' } },
        { number: 3, positionName: 'CF', x: 0, y: -150, playerInfo: { name: formationData.roles.role_3?.player_id || 'Unassigned', instructions: formationData.roles.role_3?.instructions || 'No instructions' } },
        { number: 4, positionName: 'LF', x: -100, y: -50, playerInfo: { name: formationData.roles.role_4?.player_id || 'Unassigned', instructions: formationData.roles.role_4?.instructions || 'No instructions' } },
        { number: 5, positionName: 'LB', x: -100, y: 150, playerInfo: { name: formationData.roles.role_5?.player_id || 'Unassigned', instructions: formationData.roles.role_5?.instructions || 'No instructions' } },
        { number: 6, positionName: 'CB', x: 0, y: 100, playerInfo: { name: formationData.roles.role_6?.player_id || 'Unassigned', instructions: formationData.roles.role_6?.instructions || 'No instructions' } },
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
});

export default FormationsPage;
