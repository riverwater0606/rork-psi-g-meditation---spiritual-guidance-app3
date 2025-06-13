import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { SpaceCard } from '@/components/SpaceCard';
import { meditationSpaces, MeditationSpace } from '@/constants/meditationSpaces';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

export default function SpacesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useThemeStore();
  
  const filteredSpaces = meditationSpaces.filter(space => 
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSpacePress = (space: MeditationSpace) => {
    router.push(`/space/${space.id}`);
  };
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: theme === 'dark' ? colors.darkBackground : colors.background }
    ]}>
      <View style={styles.header}>
        <Text style={[
          styles.title,
          { color: theme === 'dark' ? colors.darkText : colors.text }
        ]}>Meditation Spaces</Text>
        <Text style={[
          styles.subtitle,
          { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
        ]}>
          Explore different energetic spaces for your meditation practice
        </Text>
        
        <View style={[
          styles.searchContainer,
          { 
            backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
            borderColor: theme === 'dark' ? colors.darkBorder : colors.border
          }
        ]}>
          <Search 
            size={20} 
            color={theme === 'dark' ? colors.darkLightText : colors.lightText} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme === 'dark' ? colors.darkText : colors.text }
            ]}
            placeholder="Search spaces..."
            placeholderTextColor={theme === 'dark' ? colors.darkLightText : colors.lightText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <FlatList
        data={filteredSpaces}
        renderItem={({ item }) => (
          <SpaceCard space={item} onPress={handleSpacePress} />
        )}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[
              styles.emptyText,
              { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
            ]}>No spaces found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: 16,
  },
  listContent: {
    padding: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.lightText,
  },
});