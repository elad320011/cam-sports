import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/Colors'

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4a90e2" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
