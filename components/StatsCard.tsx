import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { UserProfile } from '@/types';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

interface StatsCardProps {
  profile: UserProfile;
}

export const StatsCard: React.FC<StatsCardProps> = ({ profile }) => {
  const { theme } = useThemeStore();
  
  return (
    <Card style={styles.card}>
      <Text style={[
        styles.title,
        { color: theme === 'dark' ? colors.darkText : colors.text }
      ]}>Meditation Stats</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            { color: theme === 'dark' ? colors.darkPrimary : colors.primary }
          ]}>{profile.totalSessions}</Text>
          <Text style={[
            styles.statLabel,
            { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
          ]}>Sessions</Text>
        </View>
        
        <View style={[
          styles.divider,
          { backgroundColor: theme === 'dark' ? colors.darkBorder : colors.border }
        ]} />
        
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            { color: theme === 'dark' ? colors.darkPrimary : colors.primary }
          ]}>{profile.totalMinutes}</Text>
          <Text style={[
            styles.statLabel,
            { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
          ]}>Minutes</Text>
        </View>
        
        <View style={[
          styles.divider,
          { backgroundColor: theme === 'dark' ? colors.darkBorder : colors.border }
        ]} />
        
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            { color: theme === 'dark' ? colors.darkPrimary : colors.primary }
          ]}>{profile.streak}</Text>
          <Text style={[
            styles.statLabel,
            { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
          ]}>Day Streak</Text>
        </View>
      </View>
      
      {profile.lastMeditation && (
        <Text style={[
          styles.lastSession,
          { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
        ]}>
          Last session: {new Date(profile.lastMeditation).toLocaleDateString()}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.lightText,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  lastSession: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    marginTop: 16,
  },
});