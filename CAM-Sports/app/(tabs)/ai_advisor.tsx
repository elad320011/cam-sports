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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendAIAdvisorTextMessage } from '@/services/aiAdvisorService';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);

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
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const aiResponse = await sendAIAdvisorTextMessage({ question: input });
      const aiMessageText = aiResponse?.message || 'No response from AI advisor.';
      simulateTypingAIResponse(aiMessageText);
    } catch (error) {
      simulateTypingAIResponse('Error getting response from AI advisor.');
    }
  };

  const simulateTypingAIResponse = (fullText: string) => {
    setTyping(true);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: '',
    };
    setMessages((prev) => [...prev, aiMsg]);

    const typeCharacter = (index: number) => {
      if (index <= fullText.length) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiMsg.id ? { ...msg, text: fullText.slice(0, index) } : msg
          )
        );
        typingRef.current = setTimeout(() => typeCharacter(index + 1), 30);
      } else {
        setTyping(false);
      }
    };

    typeCharacter(1);
  };

  const stopTyping = () => {
    if (typingRef.current) {
      clearTimeout(typingRef.current);
      typingRef.current = null;
      setTyping(false);
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
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
        <Text style={styles.messageText}>{item.text}</Text>
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
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputContainer}>
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
});
