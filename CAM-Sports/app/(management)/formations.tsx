import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Button, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/contexts/AuthContext';

const Player = ({ number, positionName, initialX, initialY }: { number: number; positionName: string; initialX: number; initialY: number }) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);

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
    <PanGestureHandler onGestureEvent={handleGesture}>
      <Animated.View style={[styles.player, animatedStyle]}>
        <Text style={styles.playerText}>{`${number} (${positionName})`}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

const FormationsPage = () => {
  const { user } = useAuth(); // Ensure useAuth is used within an AuthProvider
  const { isNew, formationId } = useLocalSearchParams(); // Retrieve query parameters
  const isNewFormation = isNew === 'true'; // Check if it's a new formation
  const [formationName, setFormationName] = useState(isNewFormation ? '' : 'Default Formation');
  const [isEditing, setIsEditing] = useState(isNewFormation);

  useEffect(() => {
    if (formationId && !isNewFormation) {
      // Fetch the formation details using the formationId
      const fetchFormation = async () => {
        try {
          const response = await axiosInstance.get(`/formations/${formationId}`);
          setFormationName(response.data.name || 'Unnamed Formation');
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
        console.log("Request payload:", { name: formationName, team_id: user?.team_id }); // Log the payload for debugging
        if (response.status === 201) {
          Alert.alert('Success', 'Formation created successfully.');
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Error creating formation:', error);
        Alert.alert('Error', 'Failed to create formation.');
      }
    } else {
      setIsEditing(false);
      Alert.alert('Success', 'Formation name saved.');
    }
  };

  const positions = [
    { number: 1, positionName: 'RB', x: 100, y: 150 }, // Right Back
    { number: 2, positionName: 'RF', x: 100, y: -50 }, // Right Front
    { number: 3, positionName: 'CF', x: 0, y: -150 },  // Center Front
    { number: 4, positionName: 'LF', x: -100, y: -50 }, // Left Front
    { number: 5, positionName: 'LB', x: -100, y: 150 }, // Left Back
    { number: 6, positionName: 'CB', x: 0, y: 100 },    // Center Back
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: '' }} />
      <View style={styles.container}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={formationName}
              onChangeText={setFormationName}
              placeholder="Enter formation name"
            />
            <Button title="Save" onPress={handleSave} />
          </View>
        ) : (
          <View style={styles.nameContainer}>
            <Text style={styles.title}>{formationName}</Text>
            <Button title="Edit" onPress={() => setIsEditing(true)} />
          </View>
        )}
        <View style={styles.court}>
          {positions.map((pos) => (
            <Player key={pos.number} number={pos.number} positionName={pos.positionName} initialX={pos.x} initialY={pos.y} />
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
});

export default FormationsPage;
