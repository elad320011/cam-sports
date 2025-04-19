import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Formations = () => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('../formations');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleNavigate}>
      <Text style={styles.text}>Formations</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default Formations;
