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
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';

import { getTeamGameStatistics } from '@/services/gameStatsService';
import { sendAIAdvisorTextMessage, cleanTempMessages } from '@/services/aiAdvisorService';
import { getTeamFormations } from '@/services/formationService';
import { useAuth } from '@/contexts/AuthContext';

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

  // Initialize conversation with formations
  useEffect(() => {
    (async () => {
      await cleanTempMessagesFromHistory();
      await loadFormationsToHistory();
    })();
  }, []);
  
  // Get team game statistics
  useEffect(() => {
    (async () => {
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
        }
      } catch (error) {
        console.error('Error fetching game statistics:', error);
      }
    })();
  }, [statisticsVisible]);


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
    try {
      const formationsResponse = await getTeamFormations(user?.team_id ?? '');
      
      if (formationsResponse.formations) {
        // Format formations into a detailed readable string
        const formationsText = formationsResponse.formations
          .map(formation => {
            const rolesText = Object.entries(formation.roles)
              .map(([roleKey, roleInfo]) => {
                if (!roleInfo) return `${roleKey}: Unassigned`;
                return `${roleKey}: ${roleInfo.name}${roleInfo.instructions ? ` (Instructions: ${roleInfo.instructions})` : ''}`;
              })
              .join('\n  ');

            return `${formation.name} (ID: ${formation.id}):\n  ${rolesText}`;
          })
          .join('\n\n');

        const messageData = {
          email: user?.email,
          user_type: user?.user_type,
          type: 'text',
          message: `Current formations:\n${formationsText}\nUse this information to help you analyze the game and provide better advice, Don't specify any ids or non relevent information other then volleyball related information.`,
          isTemp: true
        };
        
        await sendAIAdvisorTextMessage(messageData);
      }
    } catch (error) {
      console.error('Error loading formations:', error);
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

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Analyze game statistics: ${statisticId}`,
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
    let index = 0;

    const typeCharacter = () => {
      if (index <= fullText.length) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, text: fullText.slice(0, index) } : msg
          )
        );
        index += 1;
        typingRef.current = setTimeout(typeCharacter, 15);
      } else {
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
          <Markdown style={markdownStyles}>{item.text}</Markdown>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>AI Advisor</Text>
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
          <TouchableOpacity  onPress={() => setStatisticsVisible(true)} style={styles.attachButton}>
            <Text style={styles.sendIcon}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Message AI Advisor…"
            placeholderTextColor="#888"
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

      <Modal visible={statisticsVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Select Game Statistics</Text>
            <ScrollView>
                {gameStatistics.map(stat => (
                    <TouchableOpacity key={stat._id} style={styles.statItem} onPress={() => handleSendStatistic(stat._id)}>
                        <Text style={styles.statText}>
                            {stat.team_id} vs {stat.opposite_team_name} ({stat.team_sets_won_count}-{stat.team_sets_lost_count}) - {stat.game_date}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setStatisticsVisible(false)} style={styles.closeButton}>
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
    backgroundColor: '#343541',
  },
  header: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#555',
    backgroundColor: '#202123',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
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
  },
  userBubble: {
    backgroundColor: '#0fa37f',
  },
  aiBubble: {
    backgroundColor: '#444654',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#40414f',
    borderTopWidth: 1,
    borderColor: '#555',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendIcon: {
    color: '#888',
    fontSize: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#202123',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  statText: {
    color: '#fff',
  },
  closeButton: {
    marginTop: 15,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: '#0fa37f',
    fontSize: 16,
  },
  attachButton: {
    paddingHorizontal: 10,
  },
});

const markdownStyles = {
  body: {
    color: '#fff',
    fontSize: 16,
  },
  heading1: { color: '#fff' },
  heading2: { color: '#fff' },
  heading3: { color: '#fff' },
  heading4: { color: '#fff' },
  heading5: { color: '#fff' },
  heading6: { color: '#fff' },
  strong: { color: '#fff' },
  em: { color: '#fff' },
  bullet_list: { color: '#fff' },
  ordered_list: { color: '#fff' },
  list_item: { color: '#fff' },
  code_inline: {
    backgroundColor: '#555',
    padding: 4,
    borderRadius: 4,
    color: '#fff',
  },
  code_block: {
    backgroundColor: '#555',
    padding: 8,
    borderRadius: 6,
    color: '#fff',
  },
};
