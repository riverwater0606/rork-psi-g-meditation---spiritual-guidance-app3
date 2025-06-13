import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { MeditationSession } from '@/types';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { AlertCircle, CheckCircle } from 'lucide-react-native';

interface SessionHistoryItemProps {
  session: MeditationSession;
}

export const SessionHistoryItem: React.FC<SessionHistoryItemProps> = ({ 
  session 
}) => {
  const { theme } = useThemeStore();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  };
  
  // Determine status color based on session status
  const getStatusColor = () => {
    if (session.failed) {
      return theme === 'dark' ? colors.error : colors.error;
    }
    if (session.completed) {
      return theme === 'dark' ? colors.darkPrimary : colors.primary;
    }
    return theme === 'dark' ? colors.darkLightText : colors.lightText;
  };
  
  return (
    <Card style={[
      styles.card,
      session.failed && styles.failedCard
    ]}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          {session.failed ? (
            <AlertCircle 
              size={16} 
              color={colors.error} 
              style={styles.statusIcon} 
            />
          ) : session.completed ? (
            <CheckCircle 
              size={16} 
              color={theme === 'dark' ? colors.darkPrimary : colors.primary} 
              style={styles.statusIcon} 
            />
          ) : null}
          <Text style={[
            styles.date,
            { color: theme === 'dark' ? colors.darkText : colors.text }
          ]}>{formatDate(session.date)}</Text>
        </View>
        <Text style={[
          styles.duration,
          { color: getStatusColor() }
        ]}>{formatDuration(session.duration)}</Text>
      </View>
      
      {session.spaceName && (
        <View style={styles.spaceContainer}>
          <Text style={[
            styles.spaceLabel,
            { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
          ]}>Space:</Text>
          <Text style={[
            styles.spaceName,
            { color: theme === 'dark' ? colors.darkText : colors.text }
          ]}>{session.spaceName}</Text>
        </View>
      )}
      
      {session.failed && (
        <Text style={styles.failedText}>Incomplete session</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  failedCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 6,
  },
  date: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  duration: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  spaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceLabel: {
    fontSize: 14,
    color: colors.lightText,
    marginRight: 4,
  },
  spaceName: {
    fontSize: 14,
    color: colors.text,
  },
  failedText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    fontStyle: 'italic',
  },
});