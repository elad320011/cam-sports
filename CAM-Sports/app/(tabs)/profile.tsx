import { Image, StyleSheet, Platform, Text, View } from 'react-native';
import { ThemeProvider, createTheme } from '@rneui/themed';

export default function ProfileScreen() {
  return (
      <Text style={styles.text}>profile</Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: 'black',
  },
});
