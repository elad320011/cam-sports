import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal,
  ImageResizeMode,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { getTeamMembers } from '@/services/usersService';
import { getTeamGameStatistics } from '@/services/gameStatsService';
import { getTrainingPlans } from '@/services/trainingPlansService';
import { sendAIAdvisorTextMessage, cleanTempMessages } from '@/services/aiAdvisorService';
import { getTeamFormations } from '@/services/formationService';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/Colors';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  loading?: boolean;
}

interface GameStatistic {
    _id: string;
    team_id: string;
    opposite_team_name: string;
    team_sets_won_count: number;
    team_sets_lost_count: number;
    game_date: string;
}

interface Player {
    _id?: { $oid: string };
    full_name?: string;
    email?: string;
    role?: string;
    height?: number;
    weight?: number;
    birth_date?: { $date: string };
}

export default function AIAdvisor() {

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'default',
      sender: 'ai',
      text: "**Hey there!** I'm your Volleyball AI Advisor. Need tips on improving your serves, spikes, or overall gameplay? Ask away, and let's get you ready for the court! 🏐",
    },
  ]);

  const [input, setInput] = useState('');
  const [statisticsVisible, setStatisticsVisible] = useState(false);

  const [gameStatistics, setGameStatistics] = useState<GameStatistic[]>([]);
  const [typing, setTyping] = useState(false);
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const { user } = useAuth();

  const [menuVisible, setMenuVisible] = useState(false);
  const [trainingPlansVisible, setTrainingPlansVisible] = useState(false);
  const [trainingPlans, setTrainingPlans] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [formationsVisible, setFormationsVisible] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isLoadingFormations, setIsLoadingFormations] = useState(false);

  const router = useRouter();

  // Initialize conversation with formations
  useEffect(() => {
    (async () => {
      await cleanTempMessagesFromHistory();
      await loadAllTeamMembers();
      await loadFormationsToHistory();
    })();
  }, []);
  
  // Get team game statistics
  const loadGameStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const result = await getTeamGameStatistics(user?.team_id ?? '');
      
      if (result) {
        const formattedResult = JSON.parse(result.stats).map((stat: any) => ({
          ...stat,
          _id: stat._id.$oid,
          game_date: new Date(stat.game_date.$date).toLocaleDateString(),
        }));

        setGameStatistics(formattedResult);
      } else {
        console.log('No game statistics available.');
        setGameStatistics([]);
      }
    } catch (error) {
      console.error('Error fetching game statistics:', error);
      setGameStatistics([]);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Functions

  const cleanTempMessagesFromHistory = async () => {
    try {
      const data = {
        email: user?.email,
        user_type: user?.user_type,
      }
      await cleanTempMessages(data);
    } catch (error) {
      console.error('Error cleaning temp messages:', error);
    }
  };

  const loadFormationsToHistory = async () => {
    setIsLoadingFormations(true);
    try {
      const formationsResponse = await getTeamFormations(user?.team_id ?? '');
      console.log(formationsResponse)
      if (formationsResponse.formations) {
        setFormations(formationsResponse.formations);
        const formationsText = formationsResponse.formations
          .map(formation => {
            const rolesText = Object.entries(formation.roles)
              .map(([roleKey, roleInfo]) => {
                const playerInfo = roleInfo?.player_id ? `Player ID: ${roleInfo.player_id}` : 'Unassigned';
                const instructionText = roleInfo?.instructions ? ` (Instructions: ${roleInfo.instructions})` : '';
                return `${roleKey}: ${playerInfo}${instructionText}`;
              })
              .join('\n  ');
  
            return `${formation.name} (ID: ${formation.id}):\n  ${rolesText}`;
          })
          .join('\n\n');
  
        const messageData = {
          email: user?.email,
          user_type: user?.user_type,
          type: 'text',
          message: `Current formations:\n${formationsText}\nUse this information to help you analyze the game and provide better advice. Don't specify any ids or non-relevant information other than volleyball-related information. Be specific and dont give any unneccessary information that are not relevent to the formation and improvment of it`,
          isTemp: true
        };
  
        await sendAIAdvisorTextMessage(messageData);
      }
    } catch (error) {
      console.error('Error loading formations:', error);
    } finally {
      setIsLoadingFormations(false);
    }
  };
  
  const loadAllTeamMembers = async () => {
    try {
      const teamMembersResponse = await getTeamMembers(user?.team_id ?? '');
  
      if (teamMembersResponse.players && Array.isArray(teamMembersResponse.players)) {
        const parsedPlayers = teamMembersResponse.players.map((playerStr: string) => JSON.parse(playerStr) as Player);
  
        const playersText = parsedPlayers.map((player: Player) => {
          const id = player._id?.$oid ?? 'Unknown';
          const fullName = player.full_name || 'Unknown';
          const email = player.email || 'Unknown';
          const role = player.role || 'Unknown';
          const height = player.height ? `${player.height} cm` : 'Unknown';
          const weight = player.weight ? `${player.weight} kg` : 'Unknown';
          const birthDate = player.birth_date?.$date
          ? new Date(player.birth_date.$date).toLocaleDateString()
          : 'Unknown';
          
          return `ID: ${id} \n Name: ${fullName}\n  Email: ${email}\n  Role: ${role}\n  Height: ${height}\n  Weight: ${weight}\n birthDate: ${birthDate}`;
        }).join('\n\n');
  
        const messageData = {
          email: user?.email,
          user_type: user?.user_type,
          type: 'text',
          message: `Current team members:\n\n${playersText}\n\nUse this information to gather insights about players for the formation, statistics, and anything else to give the best answer possible. When referancing one of the players use their names not id`,
          isTemp: true
        };
        
        await sendAIAdvisorTextMessage(messageData);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };
  
  
  const handleSend = async () => {
    if (typing) {
      stopTyping();
      return;
    }

    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
    };

    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: '',
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');

    try {
        const data = {
            email: user?.email,
            user_type: user?.user_type,
            type: 'text',
            message: JSON.stringify(input),
        }

        const aiResponse = await sendAIAdvisorTextMessage(data);
        const aiMessageText = aiResponse?.message || 'No response from AI advisor.';

        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
            msg.id === loadingMsg.id ? { ...msg, loading: false } : msg
            )
        );

        simulateTypingAIResponse(aiMessageText, loadingMsg.id);
    } catch (error) {
        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
            msg.id === loadingMsg.id
                ? { ...msg, text: 'Error getting response from AI advisor.', loading: false }
                : msg
            )
        );
    }
  };

  const handleSendStatistic = async (statisticId: string) => {
    setStatisticsVisible(false);

    const statistic = gameStatistics.find(stat => stat._id === statisticId);
    const statisticsName = statistic ? `${statistic.team_id} vs ${statistic.opposite_team_name} - ${statistic.game_date}` : 'Unknown Statistic';
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Analyze game statistics: ${statisticsName}`,
    };

    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: '',
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);

    try {
      const data = {
        email: user?.email,
        user_type: user?.user_type,
        type: 'statistic_doc_id',
        message: statisticId,
      };

      const aiResponse = await sendAIAdvisorTextMessage(data);
      const aiMessageText = aiResponse?.message || 'No response from AI advisor.';

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMsg.id ? { ...msg, loading: false } : msg
        )
      );

      simulateTypingAIResponse(aiMessageText, loadingMsg.id);
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMsg.id
            ? { ...msg, text: 'Error getting response from AI advisor.', loading: false }
            : msg
        )
      );
    }
  };


  const simulateTypingAIResponse = (fullText: string, messageId: string) => {
    setTyping(true);
    
    // Extract images and remove them from the text
    const imageRegex = /!\[.*?\]\(.*?\)/g;
    const images = fullText.match(imageRegex) || [];
    let textWithoutImages = fullText;
    images.forEach(img => {
      textWithoutImages = textWithoutImages.replace(img, '');
    });

    let index = 0;
    let currentText = textWithoutImages;

    const typeCharacter = () => {
      if (index <= textWithoutImages.length) {
        currentText = textWithoutImages.slice(0, index);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, text: currentText } : msg
          )
        );
        index += 1;
        typingRef.current = setTimeout(typeCharacter, 15);
      } else {
        // After text is done, add all images
        if (images.length > 0) {
          currentText = textWithoutImages + '\n\n' + images.join('\n\n');
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === messageId ? { ...msg, text: currentText } : msg
            )
          );
        }
        setTyping(false);
      }
    };

    typeCharacter();
  };

  const stopTyping = () => {
    if (typingRef.current) {
      clearTimeout(typingRef.current);
      typingRef.current = null;
      setTyping(false);
    }
  };

  useEffect(() => {
    if (autoScroll) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);


  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userContainer : styles.aiContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.sender === 'user' ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {item.loading ? (
          <ActivityIndicator color="#fff" />
        ) : item.sender === 'ai' ? (
          <View style={styles.markdownContainer}>
            <Markdown style={markdownStyles}>{item.text}</Markdown>
          </View>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
      </View>
    </View>
  );

  const loadTrainingPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const plans = await getTrainingPlans(user?.team_id ?? '');
      const parsedPlans = JSON.parse(plans.plans);
      setTrainingPlans(parsedPlans);
    } catch (error) {
      console.error('Error loading training plans:', error);
      setTrainingPlans([]); 
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleTrainingPlanSelect = async (planId: string) => {
    setTrainingPlansVisible(false);

    const planName = trainingPlans.find(plan => plan.id === planId)?.name || 'Unknown Plan';
    
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Analyze training plan: ${planName}`,
    };

    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: '',
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);

    try {
      const data = {
        email: user?.email,
        user_type: user?.user_type,
        type: 'training_plan_id',
        message: planId,
      };
      console.log(data)
      const aiResponse = await sendAIAdvisorTextMessage(data);
      console.log(aiResponse)
      const aiMessageText = aiResponse?.message || 'No response from AI advisor.';

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMsg.id ? { ...msg, loading: false } : msg
        )
      );

      simulateTypingAIResponse(aiMessageText, loadingMsg.id);
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMsg.id
            ? { ...msg, text: 'Error getting response from AI advisor.', loading: false }
            : msg
        )
      );
    }
  };

  const handleFormationSelect = async (formationName: string) => {
    setFormationsVisible(false);
    
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Analyze formation: ${formationName}`,
    };

    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: '',
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);

    try {
      const data = {
        email: user?.email,
        user_type: user?.user_type,
        type: 'text',
        message: JSON.stringify(`Analyze formation: ${formationName}`),
      };

      const aiResponse = await sendAIAdvisorTextMessage(data);
      const aiMessageText = aiResponse?.message || 'No response from AI advisor.';

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMsg.id ? { ...msg, loading: false } : msg
        )
      );

      simulateTypingAIResponse(aiMessageText, loadingMsg.id);
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMsg.id
            ? { ...msg, text: 'Error getting response from AI advisor.', loading: false }
            : msg
        )
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>AI Advisor</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
        onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 30; // threshold
            const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
            setAutoScroll(isAtBottom);
          }}
        scrollEventThrottle={100}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Message AI Advisor…"
            placeholderTextColor="#d3cdcd"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!typing}
          />

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendIcon}>{typing ? '⏹' : '➤'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalBackground} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setMenuVisible(false);
                setIsLoadingStats(true);
                setStatisticsVisible(true);
                loadGameStatistics();
              }}
            >
              <Text style={styles.menuItemText}>Game Statistics</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setMenuVisible(false);
                setIsLoadingPlans(true);
                setTrainingPlansVisible(true);
                loadTrainingPlans();
              }}
            >
              <Text style={styles.menuItemText}>Training Plans</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setMenuVisible(false);
                setIsLoadingFormations(true);
                setFormationsVisible(true);
                loadFormationsToHistory();
              }}
            >
              <Text style={styles.menuItemText}>Formations</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={statisticsVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Select Game Statistics</Text>
            <ScrollView style={styles.modalScrollView}>
              {isLoadingStats ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading statistics...</Text>
                </View>
              ) : gameStatistics.length > 0 ? (
                gameStatistics.map(stat => (
                  <TouchableOpacity key={stat._id} style={styles.statItem} onPress={() => handleSendStatistic(stat._id)}>
                    <Text style={styles.statText}>
                      {stat.team_id} vs {stat.opposite_team_name} ({stat.team_sets_won_count}-{stat.team_sets_lost_count}) - {stat.game_date}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyMessage}>No game statistics available yet. Start tracking your games to see them here!</Text>
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setStatisticsVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={trainingPlansVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Select Training Plan</Text>
            <ScrollView style={styles.modalScrollView}>
              {isLoadingPlans ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading training plans...</Text>
                </View>
              ) : trainingPlans.length > 0 ? (
                trainingPlans.map(plan => (
                  <TouchableOpacity 
                    key={plan.id} 
                    style={styles.statItem} 
                    onPress={() => handleTrainingPlanSelect(plan.id)}
                  >
                    <Text style={styles.statText}>
                      {plan.name || 'Unnamed Plan'}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyMessage}>No training plans available yet. Create some plans to help your team improve!</Text>
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setTrainingPlansVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={formationsVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Select Formation</Text>
            <ScrollView style={styles.modalScrollView}>
              {isLoadingFormations ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading formations...</Text>
                </View>
              ) : formations.length > 0 ? (
                formations.map(formation => (
                  <TouchableOpacity 
                    key={formation.id} 
                    style={styles.statItem} 
                    onPress={() => handleFormationSelect(formation.name)}
                  >
                    <Text style={styles.statText}>
                      {formation.name || 'Unnamed Formation'}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyMessage}>No formations available yet. Create some formations to help your team improve!</Text>
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setFormationsVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  header: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
    backgroundColor: colors.cardBackgroundMidLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  chatContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    fontSize: 20,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  aiBubble: {
    backgroundColor: colors.cardBackgroundMidLight,
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.cardBackgroundMidLight,
    borderTopWidth: 1,
    borderColor: colors.borderColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 18
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendIcon: {
    color: colors.textSecondary,
    fontSize: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: colors.shadowColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: colors.cardBackgroundMidLight,
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  statText: {
    color: colors.textPrimary,
  },
  closeButton: {
    marginTop: 15,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  attachButton: {
    paddingHorizontal: 10,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    backgroundColor: colors.cardBackgroundMidLight,
    borderRadius: 10,
    padding: 10,
    minWidth: 200,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 600,
  },
  emptyMessage: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  markdownContainer: {
    width: '100%',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 16,
  },
  modalScrollView: {
    maxHeight: 400,
  },
});

const markdownStyles: {
  body: TextStyle;
  heading1: TextStyle;
  heading2: TextStyle;
  heading3: TextStyle;
  heading4: TextStyle;
  heading5: TextStyle;
  heading6: TextStyle;
  strong: TextStyle;
  em: TextStyle;
  bullet_list: TextStyle;
  ordered_list: TextStyle;
  list_item: TextStyle;
  code_inline: TextStyle;
  code_block: TextStyle;
  image: ImageStyle;
  paragraph: TextStyle;
  link: TextStyle;
} = {
  body: {
    color: colors.textPrimary,
    fontSize: 20,
  },
  heading1: { color: colors.textPrimary },
  heading2: { color: colors.textPrimary },
  heading3: { color: colors.textPrimary },
  heading4: { color: colors.textPrimary },
  heading5: { color: colors.textPrimary },
  heading6: { color: colors.textPrimary },
  strong: { color: colors.textPrimary },
  em: { color: colors.textPrimary },
  bullet_list: { color: colors.textPrimary },
  ordered_list: { color: colors.textPrimary },
  list_item: { color: colors.textPrimary },
  code_inline: {
    backgroundColor: colors.cardBackgroundMidLight,
    padding: 4,
    borderRadius: 4,
    color: colors.textPrimary,
  },
  code_block: {
    backgroundColor: colors.cardBackgroundMidLight,
    padding: 8,
    borderRadius: 6,
    color: colors.textPrimary,
  },
  image: {
    marginVertical: 10,
    borderRadius: 8,
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  paragraph: {
    marginVertical: 8,
  },
  link: {
    color: colors.primary,
  },
};