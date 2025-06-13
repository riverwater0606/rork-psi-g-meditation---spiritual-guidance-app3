import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Send } from 'lucide-react-native';
import { MessageBubble } from '@/components/MessageBubble';
import { useAssistantStore } from '@/store/assistantStore';
import colors from '@/constants/colors';

export default function AssistantScreen() {
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const { 
    currentConversation, 
    isLoading, 
    startNewConversation, 
    sendMessage 
  } = useAssistantStore();
  
  useEffect(() => {
    if (!currentConversation) {
      startNewConversation();
    }
  }, [currentConversation, startNewConversation]);
  
  const handleSend = async () => {
    if (message.trim() === '' || isLoading) return;
    
    const messageToSend = message;
    setMessage('');
    
    await sendMessage(messageToSend);
  };
  
  const scrollToBottom = () => {
    if (flatListRef.current && currentConversation?.messages.length) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (currentConversation?.messages.length) {
      setTimeout(scrollToBottom, 100);
    }
  }, [currentConversation?.messages.length]);
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Spiritual Assistant</Text>
        <Text style={styles.subtitle}>
          Ask questions about meditation, spirituality, or life
        </Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={currentConversation?.messages || []}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Welcome to your spiritual guide</Text>
            <Text style={styles.emptyText}>
              Ask me anything about meditation, spiritual concepts, or which meditation space might be right for you.
            </Text>
          </View>
        }
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={colors.lightText}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (message.trim() === '' || isLoading) && styles.sendButtonDisabled
          ]} 
          onPress={handleSend}
          disabled={message.trim() === '' || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Send size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.lightText,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: colors.text,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.lightText,
  },
});