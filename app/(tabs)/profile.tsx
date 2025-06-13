import React from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useMeditationStore } from '@/store/meditationStore';
import { StatsCard } from '@/components/StatsCard';
import { SessionHistoryItem } from '@/components/SessionHistoryItem';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Plus, Coins } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

// Mock NFT data - in a real app, this would come from a blockchain API
type NFT = {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
};

const mockNFTs: NFT[] = [
  {
    id: '1',
    name: 'Cosmic Meditator',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    rarity: 'Rare',
  },
  {
    id: '2',
    name: 'Dragon Guardian',
    imageUrl: 'https://images.unsplash.com/photo-1558244661-d248897f7bc4?q=80&w=2670&auto=format&fit=crop',
    rarity: 'Epic',
  },
];

export default function ProfileScreen() {
  const { sessions, profile } = useMeditationStore();
  const { theme } = useThemeStore();
  
  // Animation for token balance
  const tokenScaleAnim = React.useRef(new Animated.Value(1)).current;
  
  // Mock token balance - in a real app, this would come from a token store
  const tokenBalance = 125;
  
  // Animate token balance when it changes
  const animateTokenBalance = () => {
    Animated.sequence([
      Animated.timing(tokenScaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tokenScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Trigger animation on component mount
  React.useEffect(() => {
    animateTokenBalance();
  }, []);
  
  const renderNFTItem = ({ item }: { item: NFT }) => (
    <TouchableOpacity style={[
      styles.nftCard,
      { backgroundColor: theme === 'dark' ? colors.darkCard : colors.white }
    ]}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.nftImage}
        contentFit="cover"
      />
      <View style={styles.nftInfo}>
        <Text style={[
          styles.nftName,
          { color: theme === 'dark' ? colors.darkText : colors.text }
        ]}>{item.name}</Text>
        <Text style={styles.nftRarity}>{item.rarity}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: theme === 'dark' ? colors.darkBackground : colors.background }
    ]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[
              styles.title,
              { color: theme === 'dark' ? colors.darkText : colors.text }
            ]}>Your Profile</Text>
            <Text style={[
              styles.subtitle,
              { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
            ]}>
              Track your meditation journey and progress
            </Text>
          </View>
          
          {/* Token Balance Display */}
          <Animated.View 
            style={[
              styles.tokenContainer,
              { 
                backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
                transform: [{ scale: tokenScaleAnim }]
              }
            ]}
          >
            <Coins size={18} color={theme === 'dark' ? colors.darkPrimary : colors.primary} />
            <Text style={[
              styles.tokenBalance,
              { color: theme === 'dark' ? colors.darkText : colors.text }
            ]}>
              {tokenBalance}
            </Text>
          </Animated.View>
        </View>
        
        <StatsCard profile={profile} />
        
        {/* NFT Character Display Section */}
        <View style={styles.sectionHeader}>
          <Text style={[
            styles.sectionTitle,
            { color: theme === 'dark' ? colors.darkText : colors.text }
          ]}>Your NFT Characters</Text>
          <Button 
            title="View All" 
            variant="text" 
            size="small"
            style={styles.viewAllButton}
          />
        </View>
        
        <View style={styles.nftContainer}>
          {mockNFTs.length > 0 ? (
            <FlatList
              data={mockNFTs}
              renderItem={renderNFTItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.nftList}
              scrollEnabled={true}
            />
          ) : (
            <Card style={[
              styles.emptyNftCard,
              { backgroundColor: theme === 'dark' ? colors.darkCard : colors.white }
            ]}>
              <Text style={[
                styles.emptyNftText,
                { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
              ]}>You don't have any NFT characters yet</Text>
              <TouchableOpacity style={styles.addNftButton}>
                <Plus size={20} color={colors.white} />
                <Text style={styles.addNftText}>Get Your First NFT</Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>
        
        {/* 3D NFT Display Section */}
        <View style={styles.sectionHeader}>
          <Text style={[
            styles.sectionTitle,
            { color: theme === 'dark' ? colors.darkText : colors.text }
          ]}>3D NFT Gallery</Text>
          <Button 
            title="Explore" 
            variant="text" 
            size="small"
            style={styles.viewAllButton}
          />
        </View>
        
        <Card style={styles.nft3dCard} onPress={() => {}}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2670&auto=format&fit=crop' }}
            style={styles.nft3dImage}
            contentFit="cover"
          />
          <View style={styles.nft3dOverlay}>
            <Text style={styles.nft3dTitle}>View Your 3D NFT Collection</Text>
            <Text style={styles.nft3dSubtitle}>Interact with your spiritual guides in 3D space</Text>
          </View>
        </Card>
        
        {/* Token Rewards Section */}
        <View style={styles.sectionHeader}>
          <Text style={[
            styles.sectionTitle,
            { color: theme === 'dark' ? colors.darkText : colors.text }
          ]}>Token Rewards</Text>
          <Button 
            title="History" 
            variant="text" 
            size="small"
            style={styles.viewAllButton}
          />
        </View>
        
        <Card style={[
          styles.tokenRewardsCard,
          { backgroundColor: theme === 'dark' ? colors.darkCard : colors.white }
        ]}>
          <View style={styles.tokenRewardsContent}>
            <View style={styles.tokenRewardsInfo}>
              <Text style={[
                styles.tokenRewardsTitle,
                { color: theme === 'dark' ? colors.darkText : colors.text }
              ]}>Earn Meditation Tokens</Text>
              <Text style={[
                styles.tokenRewardsDescription,
                { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
              ]}>
                Earn 1 token for every 5 minutes of meditation. Use tokens to unlock premium content and NFTs.
              </Text>
            </View>
            <View style={[
              styles.tokenRewardsIcon,
              { backgroundColor: theme === 'dark' ? colors.darkPrimary : colors.primary }
            ]}>
              <Coins size={24} color={colors.white} />
            </View>
          </View>
          <Button 
            title="Visit Token Store" 
            style={styles.tokenStoreButton}
          />
        </Card>
        
        <View style={styles.historyHeader}>
          <Text style={[
            styles.historyTitle,
            { color: theme === 'dark' ? colors.darkText : colors.text }
          ]}>Meditation History</Text>
          {sessions.length > 0 && (
            <Button 
              title="Export" 
              variant="text" 
              size="small"
              style={styles.exportButton}
            />
          )}
        </View>
        
        {sessions.length > 0 ? (
          <FlatList
            data={sessions}
            renderItem={({ item }) => <SessionHistoryItem session={item} />}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={[
            styles.emptyContainer,
            { backgroundColor: theme === 'dark' ? colors.darkSecondaryBackground : colors.secondaryBackground }
          ]}>
            <Text style={[
              styles.emptyText,
              { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
            ]}>
              You haven't completed any meditation sessions yet.
            </Text>
            <Button 
              title="Start Meditating" 
              style={styles.startButton}
              onPress={() => {}}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Add extra padding at the bottom to avoid tab bar overlap
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
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
  // Token balance display
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tokenBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllButton: {
    paddingVertical: 0,
  },
  nftContainer: {
    marginBottom: 24,
  },
  nftList: {
    paddingRight: 16,
  },
  nftCard: {
    width: 160,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    marginRight: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  nftImage: {
    width: '100%',
    height: 140,
  },
  nftInfo: {
    padding: 12,
  },
  nftName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  nftRarity: {
    fontSize: 12,
    color: colors.primary,
  },
  emptyNftCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNftText: {
    fontSize: 14,
    color: colors.lightText,
    marginBottom: 16,
    textAlign: 'center',
  },
  addNftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addNftText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  // 3D NFT Gallery styles
  nft3dCard: {
    height: 180,
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  nft3dImage: {
    width: '100%',
    height: '100%',
  },
  nft3dOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  nft3dTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  nft3dSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  // Token rewards section
  tokenRewardsCard: {
    marginBottom: 24,
    padding: 16,
  },
  tokenRewardsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenRewardsInfo: {
    flex: 1,
    marginRight: 16,
  },
  tokenRewardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tokenRewardsDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tokenRewardsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenStoreButton: {
    alignSelf: 'flex-start',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  exportButton: {
    paddingVertical: 0,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryBackground,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 16,
  },
  startButton: {
    minWidth: 160,
  },
});