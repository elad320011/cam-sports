import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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
        <Text style={styles.title}>Volleyball Formation</Text>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
