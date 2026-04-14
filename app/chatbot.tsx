import { sendChatMessage } from '@/app/api';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatbotScreen() {
  const router = useRouter();
  const { initialPrompt, diagnosisContext } = useLocalSearchParams<{
    initialPrompt?: string;
    diagnosisContext?: string;
  }>();
  const { translate } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const didAutoStart = useRef(false);
  const [ui, setUi] = useState({
    title: 'AI Farming Assistant',
    placeholder: 'Ask farming questions...',
    send: 'Send',
    noInternet: 'Cannot connect to server. Check your connection.',
    error: 'Error sending message',
    emptyState: 'Start by asking farming questions!',
  });

  useEffect(() => {
    (async () => {
      setUi({
        title: await translate('AI Farming Assistant'),
        placeholder: await translate('Ask farming questions...'),
        send: await translate('Send'),
        noInternet: await translate('Cannot connect to server. Check your connection.'),
        error: await translate('Error sending message'),
        emptyState: await translate('Start by asking farming questions!'),
      });
    })();
  }, [translate]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const runSendMessage = async (rawText: string, visibleText?: string) => {
    const textToSend = (rawText || '').trim();
    if (!textToSend) return;

    const history: Array<{ role: 'user' | 'assistant'; text: string }> = messages
      .slice(-8)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text,
      }));

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: visibleText || textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    scrollToBottom();

    try {
      const response = await sendChatMessage(textToSend, history);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.reply || response.message || 'Unable to get response',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      scrollToBottom();
    } catch (error: any) {
      console.error('[Chatbot] Error:', error?.message);
      
      const errorMsg = error?.message || ui.error;
      const inetError = errorMsg.includes('Network') || errorMsg.includes('Cannot reach');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: inetError ? ui.noInternet : errorMsg,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      scrollToBottom();
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    await runSendMessage(inputText);
  };

  useEffect(() => {
    if (didAutoStart.current) return;
    if (!initialPrompt) return;

    didAutoStart.current = true;
    const context = typeof diagnosisContext === 'string' ? diagnosisContext.trim() : '';
    const prompt = typeof initialPrompt === 'string' ? initialPrompt.trim() : '';
    const payload = context ? `${prompt}\n\nDiagnosis Context:\n${context}` : prompt;

    runSendMessage(payload, prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, diagnosisContext]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{ui.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages Container */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={messages.length === 0 && styles.emptyStateContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={64} color="#9ccc65" />
            <Text style={styles.emptyStateText}>{ui.emptyState}</Text>
          </View>
        ) : (
          messages.map(msg => (
            <View
              key={msg.id}
              style={[styles.messageRow, msg.sender === 'user' ? styles.userRow : styles.botRow]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.userText : styles.botText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          ))
        )}

        {loading && (
          <View style={[styles.messageRow, styles.botRow]}>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <ActivityIndicator size="small" color="#1b5e20" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          style={[styles.input, { maxHeight: 100 }]}
          placeholder={ui.placeholder}
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons
            name="send"
            size={20}
            color={!inputText.trim() || loading ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: '#9ccc65',
  },
  botBubble: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#1b5e20',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#43a047',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#e0e0e0',
  },
});
