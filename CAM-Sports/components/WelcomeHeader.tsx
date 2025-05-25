import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';

export default function WelcomeHeader() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  
  const handleMenuPress = () => {
    if (isMenuOpen) {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleOptionPress = (route: '/profile' | '/ai_advisor') => {
    handleMenuPress();
    router.push(route);
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>
          CAM Sports <Text style={styles.teamText}>- {user?.team_id} team</Text>
        </Text>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={handleMenuPress}
        >
          <Ionicons name="menu" size={32} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {isMenuOpen && (
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleMenuPress}
        >
          <Animated.View 
            style={[
              styles.menuContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Cam Sports</Text>
              <Text style={styles.menuSubTitle}>Hello, {user?.full_name?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}!</Text>
            </View>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleOptionPress('/profile')}
            >
              <Ionicons name="person-circle-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleOptionPress('/ai_advisor')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.menuItemText}>AI Advisor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    paddingBlock: 20,
    fontWeight: "bold",
  },
  teamText: {
    fontSize: 16,
    color: colors.textOnPrimary,
  },
  menuButton: {
    padding: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: colors.cardBackground,
    borderRightWidth: 1,
    borderRightColor: colors.borderColor,
  },
  menuHeader: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingInline: 16,
    marginTop: 40,
    paddingBlock: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  menuTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  menuSubTitle: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '500',
    paddingHorizontal: 1,
    marginTop: 7,
    marginBottom: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 600,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: 10,
    width: '70%',
    margin: 'auto',
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 