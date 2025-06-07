import React, { useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground, FlatList } from "react-native";
import { useAuth } from '@/contexts/AuthContext';
import { Redirect, router } from 'expo-router';
import WelcomeHeader from '@/components/WelcomeHeader';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates'; 

// Components
import GameCalendar from "@/components/management/calendar";
import Messages from "@/components/management/messages";
import Training from "@/components/management/training";
import GameStatistics from "@/components/management/statistics";
import Formations from "@/components/management/formations";
import Footage from "@/components/management/footage";
import Payments from "@/components/management/payments";

export default function Management() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
      // Reload the app to apply direction changes
      Updates.reloadAsync();
    }
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const components = [
    { id: 'messages', component: <Messages /> },
    { id: 'calendar', component: <GameCalendar /> },
    { id: 'statistics', component: <GameStatistics /> },
    { id: 'training', component: <Training /> },
    { id: 'formations', component: <Formations isManager={user?.user_type === 'management'} /> },
    { id: 'footage', component: <Footage /> },
    { id: 'payments', component: <Payments isManager={user?.user_type === 'management'} /> },
  ];

  const renderItem = ({ item }: { item: { id: string; component: React.ReactNode } }) => (
    <View>
      {item.component}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.20)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.sunRays}
      />
      <Image
        source={require('@/assets/images/volleyball.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <WelcomeHeader />

      <FlatList
        data={components}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        removeClippedSubviews={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/ai_advisor')}
      >
        <ImageBackground
          source={require('@/assets/images/volleyball-2.png')}
          resizeMode="cover"
          style={styles.fabBackground}
        >
          <View style={styles.fabContent}>
            <Ionicons name="chatbubble-ellipses" size={24} color={colors.textPrimary} />
            <Text style={styles.fabText}>AI Advisor</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingInline: 16,
    paddingBlock: 25,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    paddingBlock: 20,
    fontWeight: "bold",
  },
  listContainer: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 15,
    right: 5,
    height: 95,
    width: 85,
    borderRadius: 45,
    elevation: 20,
    shadowColor: 'white',
    shadowOffset: { width: 20, height: 20 },
    shadowRadius: 25,
    shadowOpacity: 0.9,
  },
  fabBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 45,
    overflow: 'hidden',
  },
  fabContent: {
    alignItems: 'center',
    textAlign: 'center',
    gap: 4,
    shadowColor: 'black',
    shadowOffset: { width: 25, height: 25 },
    padding: 5,
    shadowRadius: 30,
    borderRadius: 50,
    elevation: 5,
  },
  fabText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    margin: 'auto',
  },
  backgroundImage: {
    position: 'absolute',
    bottom: '-16%',
    left: '-90%',
  },
  sunRays: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
});
