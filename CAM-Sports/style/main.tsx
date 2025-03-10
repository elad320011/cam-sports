import { StyleSheet } from 'react-native';
import { ThemeProvider, createTheme } from '@rneui/themed';

export const theme = createTheme({
  lightColors: {
    primary: '#e7e7e8',
  },
  darkColors: {
    primary: '#000',
  },
  mode: 'dark',
});

export const styles = StyleSheet.create({
  text: {
    color: 'black',
  },
});
