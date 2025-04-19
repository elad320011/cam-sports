import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const Player = ({ number, initialX, initialY }: { number: number; initialX: number; initialY: number }) => {
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
        <Text style={styles.playerText}>{number}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

const FormationsPage = () => {
  const positions = [
    { number: 1, x: 100, y: 150 },
    { number: 2, x: 100, y: -50 },
    { number: 3, x: 0, y: -150 },
    { number: 4, x: -100, y: -50 },
    { number: 5, x: -100, y: 150 },
    { number: 6, x: 0, y: 50 },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: '' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Volleyball Formation</Text>
        <View style={styles.court}>
          {positions.map((pos) => (
            <Player key={pos.number} number={pos.number} initialX={pos.x} initialY={pos.y} />
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
    width: 50,
    height: 50,
    backgroundColor: '#4caf50',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  playerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FormationsPage;
