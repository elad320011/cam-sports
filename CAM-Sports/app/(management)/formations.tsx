import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TextInput, Alert, TouchableOpacity, ScrollView, Dimensions, FlatList, Modal, Platform } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { getFormation, createFormation, updateFormation, updatePlayerRole, Formation, getTeamPlayers, PlayerInfo, getUsedPlayerIds } from '@/services/formationService';
import { colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import ModalDropdown from 'react-native-modal-dropdown';

const Player = ({ 
  number, 
  positionName, 
  initialX, 
  initialY, 
  playerInfo, 
  formationId, 
  formationData, 
  isManager = true 
}: { 
  number: number; 
  positionName: string; 
  initialX: number; 
  initialY: number; 
  playerInfo: { name: string; instructions: string }; 
  formationId: string;
  formationData: Formation | null;
  isManager?: boolean;
}) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const [modalVisible, setModalVisible] = useState(false);
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedInstructions, setEditedInstructions] = useState('');
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [currentFormationData, setCurrentFormationData] = useState<Formation | null>(formationData);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const { user } = useAuth();
  const formationDropdownRef = useRef<ModalDropdown>(null);

  // Update currentFormationData when formationData prop changes
  useEffect(() => {
    setCurrentFormationData(formationData);
  }, [formationData]);

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

  const fetchPlayers = async () => {
    try {
      if (!user?.team_id) {
        console.log('No team_id available');
        return;
      }
      console.log('Fetching players for team:', user.team_id);
      const teamPlayers = await getTeamPlayers(user.team_id);
      console.log('Received players:', teamPlayers);
      if (Array.isArray(teamPlayers)) {
        setPlayers(teamPlayers);
      } else {
        console.error('Invalid players data received:', teamPlayers);
        setPlayers([]);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers([]);
    }
  };

  const fetchCurrentFormation = async () => {
    try {
      if (!formationId) return;
      const formation = await getFormation(formationId);
      setCurrentFormationData(formation);
    } catch (error) {
      console.error('Error fetching current formation:', error);
    }
  };

  useEffect(() => {
    if (modalVisible && isManager) {
      console.log('Modal opened, fetching players...');
      fetchPlayers();
      fetchCurrentFormation(); // Also fetch current formation when modal opens
    }
  }, [modalVisible, isManager]);

  const handleEdit = () => {
    // Find the current player ID from the formation data
    const currentRoleKey = `role_${number}` as keyof Formation['roles'];
    const currentPlayerId = currentFormationData?.roles[currentRoleKey]?.player_id;
    
    // Set the initial values
    setEditedName(currentPlayerId || '');
    setEditedInstructions(playerInfo.instructions || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updatePlayerRole(formationId, number, editedName, editedInstructions);
      // Update the display name based on the selected player
      const selectedPlayer = players.find((player) => player.id === editedName);
      playerInfo.name = selectedPlayer?.fullName || 'Unassigned';
      playerInfo.instructions = editedInstructions;
      // Refresh formation data after update
      await fetchCurrentFormation();
      Alert.alert('Success', 'Player information updated successfully.');
      setIsEditing(false);
      hideModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to update player information.');
    }
  };

  // Get the list of players that are already assigned to other roles
  const usedPlayerIds = getUsedPlayerIds(currentFormationData);
  // Filter out the current role's player ID from the used list
  const currentRoleKey = `role_${number}` as keyof Formation['roles'];
  const currentPlayerId = currentFormationData?.roles[currentRoleKey]?.player_id;
  const otherUsedPlayerIds = usedPlayerIds.filter(id => id !== currentPlayerId);

  const handlePlayerSelect = (playerId: string, playerName: string) => {
    setEditedName(playerId);
    setShowPlayerList(false);
  };

  const showModal = () => {
    setModalVisible(true);
    modalOpacity.value = withTiming(1, { duration: 200 });
    modalScale.value = withSpring(1);
  };

  const hideModal = () => {
    modalOpacity.value = withTiming(0, { duration: 200 });
    modalScale.value = withSpring(0.8);
    // Use setTimeout to ensure the animation completes before hiding
    setTimeout(() => {
      setModalVisible(false);
    }, 200);
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  return (
    <>
      <PanGestureHandler onGestureEvent={handleGesture}>
        <Animated.View style={[styles.player, animatedStyle]}>
          <LinearGradient
            colors={[colors.cardBackground, colors.cardBackgroundLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playerCircle}
            onTouchEnd={() => {
              showModal();
              if (isManager) {
                fetchPlayers();
              }
            }}
          >
            <View style={styles.playerTextContainer}>
              <Text style={styles.playerNumber}>{number}</Text>
              <Text style={styles.playerPosition}>{positionName}</Text>
            </View>
          </LinearGradient>
          <Text style={styles.playerName} numberOfLines={1}>
            {playerInfo.name}
          </Text>
        </Animated.View>
      </PanGestureHandler>

      {modalVisible && (
        <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
          <LinearGradient
            colors={[colors.cardBackground, colors.cardBackgroundLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            {isEditing ? (
              <>
                <Text style={styles.modalTitle}>Edit Player</Text>
                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabel}>Select Player</Text>
                  {/* @ts-ignore */}
                  <ModalDropdown
                    style={styles.dropdownButton}
                    options={['Unassigned', ...players
                      .filter(player => player.id !== '')
                      .map(player => {
                        const isAssigned = otherUsedPlayerIds.includes(player.id);
                        return isAssigned ? `${player.fullName} (Assigned)` : player.fullName;
                      })
                    ]}
                    onSelect={(index: string, value: string) => {
                      const numericIndex = parseInt(index, 10);
                      if (String(value).includes('(Assigned)')) {
                        return false; // Prevent selection and keep dropdown open
                      }
                      if (value === 'Unassigned') {
                        setEditedName('');
                      } else {
                        const selectedPlayer = players.find(p => p.fullName === String(value));
                        if (selectedPlayer) {
                          setEditedName(selectedPlayer.id);
                        }
                      }
                    }}
                    dropdownStyle={styles.dropdownList}
                    adjustFrame={style => {
                      const screenWidth = Dimensions.get('window').width;
                      const dropdownWidth = style.width || 300;

                      // Center horizontally
                      style.left = (screenWidth - dropdownWidth) / 2;
                      
                      // Position top edge at button's bottom with small padding
                      if (style.top) {
                        style.top += Platform.OS === 'ios' ? 45 : 5;
                      }

                      return style;
                    }}
                    renderRow={(option: string, index: string, isSelected: boolean) => (
                      <View style={styles.dropdownItem}>
                        <Text style={[
                          styles.dropdownItemText,
                          String(option).includes('(Assigned)') && styles.dropdownItemTextDisabled
                        ]}>
                          {option}
                        </Text>
                      </View>
                    )}
                    renderSeparator={() => <View style={styles.dropdownSeparator} />}
                  >
                    <View style={styles.dropdownButtonContent}>
                      <Text style={styles.dropdownButtonText}>
                        {players.find(p => p.id === editedName)?.fullName || 'Unassigned'}
                      </Text>
                      <MaterialIcons
                        name="keyboard-arrow-down"
                        size={24}
                        color={colors.textPrimary}
                      />
                    </View>
                  </ModalDropdown>
                </View>
                <TextInput
                  style={styles.instructionsInput}
                  value={editedInstructions}
                  onChangeText={setEditedInstructions}
                  placeholder="Enter instructions"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <MaterialIcons name="save" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setIsEditing(false);
                      hideModal();
                    }}
                  >
                    <MaterialIcons name="close" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{playerInfo.name}</Text>
                <Text style={styles.modalInstructions}>{playerInfo.instructions}</Text>
                <View style={styles.buttonRow}>
                  {isManager && (
                    <TouchableOpacity
                      style={[styles.button, styles.editButton]}
                      onPress={handleEdit}
                    >
                      <MaterialIcons name="edit" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.button, styles.closeButton]}
                    onPress={hideModal}
                  >
                    <MaterialIcons name="close" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </LinearGradient>
        </Animated.View>
      )}
    </>
  );
};

const FormationsPage = () => {
  const { user } = useAuth();
  const { isNew, formationId } = useLocalSearchParams();
  const isNewFormation = isNew === 'true';
  const [formationName, setFormationName] = useState(isNewFormation ? '' : 'Default Formation');
  const [originalFormationName, setOriginalFormationName] = useState(formationName);
  const [isEditing, setIsEditing] = useState(isNewFormation);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formationData, setFormationData] = useState<Formation | null>(null);
  const [currentFormationId, setCurrentFormationId] = useState<string>(formationId as string);
  const isManager = user?.user_type === 'management';
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth > 768;

  // Calculate position multipliers based on screen size
  const getPositionMultiplier = () => {
    if (isSmallScreen) return 0.7;
    if (isLargeScreen) return 1.3;
    return 1;
  };

  const positionMultiplier = getPositionMultiplier();

  useEffect(() => {
    if (formationId && !isNewFormation) {
      const fetchFormation = async () => {
        try {
          const formation = await getFormation(formationId as string);
          setFormationName(formation.name);
          setOriginalFormationName(formation.name);
          setFormationData(formation);
          setCurrentFormationId(formationId as string);
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch formation details.');
        }
      };
      fetchFormation();
    }
  }, [formationId, isNewFormation]);

  const handleSave = async () => {
    if (formationName.trim() === '') {
      Alert.alert('Error', 'Formation name cannot be empty.');
      return;
    }

    if (isNewFormation) {
      try {
        const createdFormation = await createFormation(formationName, user?.team_id || '');
        setFormationData(createdFormation);
        setCurrentFormationId(createdFormation.id);
        setIsEditing(false);
        setHasUnsavedChanges(false);
        Alert.alert('Success', 'Formation created successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to create formation.');
      }
    } else {
      try {
        if (!formationData?.roles) {
          throw new Error('No formation data available');
        }
        await updateFormation(currentFormationId, formationName, formationData.roles);
        Alert.alert('Success', 'Formation updated successfully.');
        setIsEditing(false);
        setHasUnsavedChanges(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to update formation.');
      }
    }
  };

  const handleCancel = () => {
    setFormationName(originalFormationName); // Revert to the original name
    setIsEditing(false);
    setHasUnsavedChanges(false); // Reset unsaved changes
  };

  const handleChange = (newName: string) => {
    setFormationName(newName);
    setHasUnsavedChanges(true); // Mark as having unsaved changes
  };

  const positions = formationData
    ? [
        {
          number: 1,
          positionName: 'Setter',
          x: 0 * positionMultiplier,
          y: 80 * positionMultiplier,
          playerInfo: {
            name: formationData.roles.role_1?.name || 'Unassigned',
            instructions: formationData.roles.role_1?.instructions || '',
            player_id: formationData.roles.role_1?.player_id || null,
          },
        },
        {
          number: 2,
          positionName: 'Outside Hitter',
          x: -100 * positionMultiplier,
          y: 120 * positionMultiplier,
          playerInfo: {
            name: formationData.roles.role_2?.name || 'Unassigned',
            instructions: formationData.roles.role_2?.instructions || '',
            player_id: formationData.roles.role_2?.player_id || null,
          },
        },
        {
          number: 3,
          positionName: 'Middle Blocker',
          x: 0 * positionMultiplier,
          y: -150 * positionMultiplier,
          playerInfo: {
            name: formationData.roles.role_3?.name || 'Unassigned',
            instructions: formationData.roles.role_3?.instructions || '',
            player_id: formationData.roles.role_3?.player_id || null,
          },
        },
        {
          number: 4,
          positionName: 'Opposite',
          x: 100 * positionMultiplier,
          y: 120 * positionMultiplier,
          playerInfo: {
            name: formationData.roles.role_4?.name || 'Unassigned',
            instructions: formationData.roles.role_4?.instructions || '',
            player_id: formationData.roles.role_4?.player_id || null,
          },
        },
        {
          number: 5,
          positionName: 'Outside Hitter',
          x: -100 * positionMultiplier,
          y: -40 * positionMultiplier,
          playerInfo: {
            name: formationData.roles.role_5?.name || 'Unassigned',
            instructions: formationData.roles.role_5?.instructions || '',
            player_id: formationData.roles.role_5?.player_id || null,
          },
        },
        {
          number: 6,
          positionName: 'Libero',
          x: 100 * positionMultiplier,
          y: -40 * positionMultiplier,
          playerInfo: {
            name: formationData.roles.role_6?.name || 'Unassigned',
            instructions: formationData.roles.role_6?.instructions || '',
            player_id: formationData.roles.role_6?.player_id || null,
          },
        },
      ]
    : [];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: '',
        }}
      />
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.cardBackground, colors.cardBackgroundLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerContainer}
        >
          {isManager && isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={formationName}
                onChangeText={handleChange}
                placeholder="Enter formation name"
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <MaterialIcons name="save" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <MaterialIcons name="cancel" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{formationName}</Text>
              {isManager && (
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => setIsEditing(true)}
                >
                  <MaterialIcons name="edit" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </LinearGradient>
        <View style={styles.courtContainer}>
          <LinearGradient
            colors={['#1a3c4d', '#234b5e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.court}
          >
            {/* Court Lines */}
            <View style={styles.courtLines}>
              {/* Attack Line */}
              <View style={[styles.line, styles.attackLine]} />
              {/* Center Line */}
              <View style={[styles.line, styles.centerLine]} />
              {/* Side Lines */}
              <View style={[styles.line, styles.sideLineLeft]} />
              <View style={[styles.line, styles.sideLineRight]} />
              {/* End Line */}
              <View style={[styles.line, styles.endLine]} />
            </View>
            {positions.map((pos) => (
              <Player
                key={pos.number}
                number={pos.number}
                positionName={pos.positionName}
                initialX={pos.x}
                initialY={pos.y}
                playerInfo={pos.playerInfo}
                formationId={currentFormationId}
                formationData={formationData}
                isManager={isManager}
              />
            ))}
          </LinearGradient>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    padding: 16,
  },
  headerContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.cardBackgroundLight,
    color: colors.textPrimary,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    minWidth: 120,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  courtContainer: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  court: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courtLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  line: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
  attackLine: {
    width: '100%',
    height: 3,
    top: '33%',
  },
  centerLine: {
    width: '100%',
    height: 3,
    top: 0,
  },
  sideLineLeft: {
    width: 3,
    height: '100%',
    left: 0,
  },
  sideLineRight: {
    width: 3,
    height: '100%',
    right: 0,
  },
  endLine: {
    width: '100%',
    height: 3,
    bottom: 0,
  },
  player: {
    width: 70,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  playerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
    padding: 4,
  },
  playerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  playerNumber: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 1,
  },
  playerPosition: {
    color: colors.textPrimary,
    fontWeight: '500',
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    width: '100%',
    paddingHorizontal: 4,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
    backgroundColor: colors.cardBackground,
    elevation: 5,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalInstructions: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  pickerWrapper: {
    width: '100%',
    marginBottom: 20,
    zIndex: 1,
  },
  pickerLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdownButton: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    backgroundColor: colors.cardBackgroundLight,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  dropdownList: {
    marginTop: -25,
    width: 300,
    height: 200,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    backgroundColor: colors.cardBackgroundLight,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  dropdownItemTextDisabled: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: colors.borderColor,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: colors.cardBackgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  closeButton: {
    padding: 8,
  },
  instructionsInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: colors.cardBackgroundLight,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default FormationsPage;
