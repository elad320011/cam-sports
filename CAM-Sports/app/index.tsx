import React from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { useAuth } from '@/contexts/AuthContext';
import { Redirect, router } from 'expo-router';
import WelcomeHeader from '@/components/WelcomeHeader';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

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

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

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

      <ScrollView style={styles.scrollContainer}>
        <GameCalendar />
        <View style={{ margin: 10 }} />
        <GameStatistics />
        <View style={{ margin: 10 }} />
        <Training />
        <View style={{ margin: 10 }} />
        <Messages />
        <View style={{ margin: 10 }} />
        <Formations />
        <View style={{ margin: 10 }} />
        <Footage teamId={user?.team_id}/>
        <View style={{ margin: 10 }} />
        <Payments isManager={user?.user_type === 'management'} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/ai_advisor')}
      >
        <View style={styles.fabContent}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
          <Text style={styles.fabText}>AI Advisor</Text>
        </View>
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
  scrollContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabContent: {
    alignItems: 'center',
    gap: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
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
