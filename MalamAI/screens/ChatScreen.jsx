import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { callGeminiMultiTurn } from '../src/utils/gemini';
import useNotes from '../src/hooks/useNotes';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';

const suggestedQuestions = [
  'Explain photosynthesis',
  'Solve quadratic equations',
  'JAMB English tips',
  'Difference between speed and velocity',
  'Causes of the Nigerian Civil War',
];

const DEFAULT_SUBJECT = {
  id: 'chat',
  name: 'Malam AI Chat',
  emoji: '📚',
};

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const { saveNote } = useNotes();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, loading]);

  const submitMessage = useCallback(async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInputText('');
    setError('');
    setLoading(true);

    try {
      const aiResponse = await callGeminiMultiTurn(nextMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      console.warn('[ChatScreen] Gemini failure', err);
      const message = err?.message || 'Unable to reach Malam AI.';
      setError(message);
      Alert.alert('Chat failed', 'Unable to get an answer. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  const handleSend = () => submitMessage(inputText);

  const handleSuggestedPress = (question) => submitMessage(question);

  const handleSaveAsNote = async (messageText) => {
    const snippet = String(messageText || '').trim().slice(0, 40);
    const topic = snippet ? `Malam AI answer: ${snippet}` : 'Malam AI answer';

    try {
      await saveNote(DEFAULT_SUBJECT, topic, messageText);
      Alert.alert('Saved', 'This AI message was saved to your notes.');
    } catch (saveError) {
      console.warn('[ChatScreen] save note failed', saveError);
      Alert.alert('Unable to save', 'Please try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Crack Jamb AI</Text>
          <Text style={styles.headerSubtitle}>Ask any JAMB question and get simple tutor-style help.</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}> 
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>M</Text>
              </View>
              <Text style={styles.emptyTitle}>Ask me anything about JAMB!</Text>
              <Text style={styles.emptySubtitle}>Nagode.</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestedRow}
              >
                {suggestedQuestions.map((question) => (
                  <TouchableOpacity
                    key={question}
                    style={styles.suggestedChip}
                    onPress={() => handleSuggestedPress(question)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestedText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.chatColumn}>
              {messages.map((message, index) => (
                <ChatBubble
                  key={`${message.role}-${index}-${String(message.content).slice(0, 20)}`}
                  message={message.content}
                  isUser={message.role === 'user'}
                  onSaveNote={message.role === 'assistant' ? () => handleSaveAsNote(message.content) : undefined}
                />
              ))}
              {loading && (
                <View style={styles.typingWrapper}>
                  <TypingIndicator />
                </View>
              )}
            </View>
          )}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type your JAMB question..."
            placeholderTextColor="#8f9b8b"
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} activeOpacity={0.8}>
            <Text style={styles.sendIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f5f3',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a7c4f',
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#4e5d4a',
    fontSize: 14,
  },
  messagesContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  chatColumn: {
    paddingBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 70,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0e8dc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0a7c4f',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2d3e2f',
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    color: '#6d7b69',
    textAlign: 'center',
  },
  suggestedRow: {
    marginTop: 20,
    paddingBottom: 10,
  },
  suggestedChip: {
    backgroundColor: '#f5d58d',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#f0c96a',
  },
  suggestedText: {
    color: '#4f3b0f',
    fontWeight: '700',
  },
  typingWrapper: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#d9e3d4',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 30,
    backgroundColor: '#eef5ec',
    color: '#232a22',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendButton: {
    width: 46,
    height: 46,
    marginLeft: 10,
    borderRadius: 23,
    backgroundColor: '#0a7c4f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  errorText: {
    color: '#b00020',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 18,
  },
});
