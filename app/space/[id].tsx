import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/Button';
import { meditationSpaces } from '@/constants/meditationSpaces';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { Clock } from 'lucide-react-native';

export default function SpaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useThemeStore();
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  
  const space = meditationSpaces.find(s => s.id === id);
  
  if (!space) {
    return (
      <View style={[
        styles.notFoundContainer,
        { backgroundColor: theme === 'dark' ? colors.darkBackground : colors.background }
      ]}>
        <Text style={[
          styles.notFoundText,
          { color: theme === 'dark' ? colors.darkText : colors.text }
        ]}>Space not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()}
        />
      </View>
    );
  }
  
  const handleStartMeditation = () => {
    setShowDurationPicker(true);
  };
  
  const handleDurationSelect = (minutes: number) => {
    router.push({
      pathname: `/meditation/${space.id}`,
      params: { duration: minutes * 60 }
    });
  };
  
  const renderDurationPicker = () => {
    const durations = [1, 3, 5, 10, 15, 20, 30, 45, 60];
    
    return (
      <View style={[
        styles.durationPickerContainer,
        { backgroundColor: theme === 'dark' ? colors.darkCard : colors.white }
      ]}>
        <Text style={[
          styles.durationPickerTitle,
          { color: theme === 'dark' ? colors.darkText : colors.text }
        ]}>Select Meditation Duration</Text>
        
        <View style={styles.durationGrid}>
          {durations.map(minutes => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.durationOption,
                { backgroundColor: theme === 'dark' ? colors.darkSecondaryBackground : colors.secondaryBackground }
              ]}
              onPress={() => handleDurationSelect(minutes)}
            >
              <Text style={[
                styles.durationText,
                { color: theme === 'dark' ? colors.darkText : colors.text }
              ]}>{minutes} {minutes === 1 ? "min" : "mins"}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={[
              styles.durationOption,
              { backgroundColor: theme === 'dark' ? colors.darkSecondaryBackground : colors.secondaryBackground }
            ]}
            onPress={() => handleDurationSelect(90)}
          >
            <Text style={[
              styles.durationText,
              { color: theme === 'dark' ? colors.darkText : colors.text }
            ]}>90 mins</Text>
          </TouchableOpacity>
        </View>
        
        <Button 
          title="Cancel" 
          variant="outline"
          onPress={() => setShowDurationPicker(false)}
          style={styles.cancelButton}
        />
      </View>
    );
  };
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: space.name,
          headerTransparent: true,
          headerTintColor: colors.white,
          headerBackTitle: "Spaces",
        }} 
      />
      
      <ScrollView 
        style={[
          styles.container,
          { backgroundColor: theme === 'dark' ? colors.darkBackground : colors.background }
        ]} 
        contentContainerStyle={styles.content}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: space.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.title}>{space.name}</Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={[
            styles.description,
            { color: theme === 'dark' ? colors.darkText : colors.text }
          ]}>{space.description}</Text>
          
          <View style={[
            styles.infoCard,
            { backgroundColor: theme === 'dark' ? colors.darkCard : colors.white }
          ]}>
            <Text style={[
              styles.infoTitle,
              { color: theme === 'dark' ? colors.darkText : colors.text }
            ]}>About this Space</Text>
            <Text style={[
              styles.infoText,
              { color: theme === 'dark' ? colors.darkText : colors.text }
            ]}>
              This meditation space connects you with the energy of {space.name.toLowerCase()}. 
              By focusing on this energy during meditation, you can tap into its unique 
              qualities and receive guidance, healing, or insights.
            </Text>
          </View>
          
          <View style={[
            styles.infoCard,
            { backgroundColor: theme === 'dark' ? colors.darkCard : colors.white }
          ]}>
            <Text style={[
              styles.infoTitle,
              { color: theme === 'dark' ? colors.darkText : colors.text }
            ]}>How to Use</Text>
            <Text style={[
              styles.infoText,
              { color: theme === 'dark' ? colors.darkText : colors.text }
            ]}>
              {"1. Find a quiet, comfortable place to sit or lie down.\n\n2. Close your eyes and take a few deep breaths.\n\n3. Visualize the energy of this space surrounding you.\n\n4. Allow yourself to receive whatever comes through.\n\n5. When the timer ends, slowly return to normal awareness."}
            </Text>
          </View>
          
          <Button 
            title="Start Meditation" 
            size="large"
            style={styles.startButton}
            onPress={handleStartMeditation}
          />
        </View>
      </ScrollView>
      
      {showDurationPicker && (
        <View style={styles.durationPickerOverlay}>
          {renderDurationPicker()}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  imageContainer: {
    height: 300,
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
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  detailsContainer: {
    padding: 24,
  },
  description: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 24,
    lineHeight: 26,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  startButton: {
    marginTop: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  durationPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  durationPickerContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  durationPickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  durationOption: {
    width: '30%',
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  cancelButton: {
    alignSelf: 'center',
    minWidth: 120,
  },
});