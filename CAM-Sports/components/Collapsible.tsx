import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Dimensions, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>
      <ScrollView>
        {children}
      </ScrollView>
      </View>}
  </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: "#e0e0e0",
    padding: 16,
    borderRadius: 8,
    margin: 'auto',
    marginBottom: 16,
    width: '100%',
  },
  content: {
    margin: 'auto',
    width: '100%',
    justifyContent: 'center',
    padding: 16,
    minHeight: 200,
  },
  text: {
    fontSize: 16,
   },
});
