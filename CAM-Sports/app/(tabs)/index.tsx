import { Image, StyleSheet, Platform, Text, View } from 'react-native';
import { ThemeProvider, createTheme } from '@rneui/themed';

export default function HomeScreen() {
  return (
      <Text style={styles.text}></Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: 'black',
  },
});
