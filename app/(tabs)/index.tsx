import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StatsCard } from '@/components/StatsCard';
import { useMeditationStore } from '@/store/meditationStore';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useMeditationStore();
  const { theme } = useThemeStore();
  
  const handleStartMeditation = () => {
    router.push('/meditation/quick');
  };
  
  const handleViewHistory = () => {
    router.push('/profile');
  };
  
  const handleExploreSpaces = () => {
    router.push('/spaces');
  };
  
  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: theme === 'dark' ? colors.darkBackground : colors.background }
      ]} 
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=2586&auto=format&fit=crop' }}
          style={styles.headerImage}
          contentFit="cover"
        />
        <View style={styles.overlay}>
          <Text style={styles.title}>PSI-G</Text>
          <Text style={styles.subtitle}>Spiritual Meditation</Text>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <Button 
          title="Start Meditation" 
          size="large"
          style={styles.mainButton}
          onPress={handleStartMeditation}
        />
        
        <View style={styles.buttonRow}>
          <Button 
            title="Explore Spaces" 
            variant="outline"
            style={styles.secondaryButton}
            onPress={handleExploreSpaces}
          />
          <Button 
            title="View History" 
            variant="outline"
            style={styles.secondaryButton}
            onPress={handleViewHistory}
          />
        </View>
      </View>
      
      {profile.totalSessions > 0 && (
        <StatsCard profile={profile} />
      )}
      
      <Card style={styles.infoCard}>
        <Text style={[
          styles.infoTitle,
          { color: theme === 'dark' ? colors.darkText : colors.text }
        ]}>What is PSI-G?</Text>
        <Text style={[
          styles.infoText,
          { color: theme === 'dark' ? colors.darkText : colors.text }
        ]}>
          PSI-G is a spiritual meditation app that helps you connect with various energetic symbols and spaces. 
          Through guided meditation, you can explore different dimensions of consciousness and tap into the 
          wisdom of angels, dragons, and cosmic energies.
        </Text>
      </Card>
      
      <Card style={[
        styles.tipCard,
        { backgroundColor: theme === 'dark' ? colors.darkSecondaryBackground : colors.secondaryBackground }
      ]}>
        <Text style={[
          styles.tipTitle,
          { color: theme === 'dark' ? colors.darkText : colors.text }
        ]}>Meditation Tip</Text>
        <Text style={[
          styles.tipText,
          { color: theme === 'dark' ? colors.darkText : colors.text }
        ]}>
          "The quieter you become, the more you can hear." — Ram Dass
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.9,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  mainButton: {
    width: '100%',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  tipCard: {
    marginBottom: 24,
    backgroundColor: colors.secondaryBackground,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 22,
  },
});