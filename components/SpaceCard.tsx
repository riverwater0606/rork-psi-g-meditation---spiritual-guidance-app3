import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MeditationSpace } from '@/constants/meditationSpaces';
import { Card } from './Card';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

interface SpaceCardProps {
  space: MeditationSpace;
  onPress: (space: MeditationSpace) => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24; // 2 cards per row with padding

export const SpaceCard: React.FC<SpaceCardProps> = ({ space, onPress }) => {
  const { theme } = useThemeStore();
  
  return (
    <Card 
      style={styles.card} 
      onPress={() => onPress(space)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: space.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
      </View>
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            { color: theme === 'dark' ? colors.darkText : colors.text }
          ]} 
          numberOfLines={1}
        >
          {space.name}
        </Text>
        <Text 
          style={[
            styles.description,
            { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
          ]} 
          numberOfLines={2}
        >
          {space.description}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: 200,
    padding: 0,
    overflow: 'hidden',
    margin: 8,
  },
  imageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: colors.lightText,
    lineHeight: 16,
  },
});