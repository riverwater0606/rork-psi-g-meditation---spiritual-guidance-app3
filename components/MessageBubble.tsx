import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AIMessage } from '@/types';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

interface MessageBubbleProps {
  message: AIMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { theme } = useThemeStore();
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser 
          ? [styles.userBubble, { backgroundColor: theme === 'dark' ? colors.darkPrimary : colors.primary }]
          : [styles.assistantBubble, { backgroundColor: theme === 'dark' ? colors.darkSecondaryBackground : colors.secondaryBackground }]
      ]}>
        <Text style={[
          styles.text,
          isUser 
            ? styles.userText
            : { color: theme === 'dark' ? colors.darkText : colors.text }
        ]}>
          {message.content}
        </Text>
      </View>
      <Text style={[
        styles.timestamp,
        { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
      ]}>
        {new Date(message.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    backgroundColor: colors.secondaryBackground,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
  },
  timestamp: {
    fontSize: 12,
    color: colors.lightText,
    marginTop: 4,
    marginHorizontal: 8,
  },
});