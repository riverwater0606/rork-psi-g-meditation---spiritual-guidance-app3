import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Text, 
  KeyboardAvoidingView, 
  Platform, 
  FlatList,
  Animated,
  Keyboard,
  ActivityIndicator,
  PanResponder,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import { MessageCircle, X, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAssistantStore } from '@/store/assistantStore';
import { MessageBubble } from './MessageBubble';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

const BUTTON_SIZE = 56;
const BUBBLE_COUNT = 8; // Number of bubbles in the animation

export const FloatingAssistant = () => {
  const { width, height } = useWindowDimensions();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useThemeStore();
  
  // Animation values for magic bubbles
  const bubbleAnimations = useRef(
    Array(BUBBLE_COUNT).fill(0).map(() => ({
      scale: new Animated.Value(0),
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      opacity: new Animated.Value(0)
    }))
  ).current;
  
  // Glow animation for the button
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Initial position for the floating button (top right instead of bottom right)
  const initialX = width - BUTTON_SIZE - 20;
  const initialY = 120; // Position it higher to avoid tab bar
  
  // Position state for the floating button
  const position = useRef(new Animated.ValueXY({ 
    x: initialX, 
    y: initialY
  })).current;
  
  // Store the current position values as regular numbers
  const [currentPosition, setCurrentPosition] = useState({
    x: initialX,
    y: initialY
  });
  
  const { 
    currentConversation, 
    isLoading, 
    startNewConversation, 
    sendMessage 
  } = useAssistantStore();
  
  // Create pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store the current position as offset
        position.extractOffset();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        position.flattenOffset();
        
        // Get current position values
        const posX = currentPosition.x + gesture.dx;
        const posY = currentPosition.y + gesture.dy;
        
        // Keep button within screen bounds
        let newX = posX;
        let newY = posY;
        
        if (newX < 0) newX = 0;
        if (newX > width - BUTTON_SIZE) newX = width - BUTTON_SIZE;
        if (newY < 50) newY = 50; // Keep some distance from top
        if (newY > height - BUTTON_SIZE - 100) newY = height - BUTTON_SIZE - 100;
        
        // Update the animated value
        Animated.spring(position, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          friction: 5
        }).start();
        
        // Update our tracked position
        setCurrentPosition({ x: newX, y: newY });
        
        // If it was a tap rather than a drag, open the assistant
        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          openAssistant();
        }
      }
    })
  ).current;
  
  // Function to animate magic bubbles
  const animateMagicBubbles = () => {
    // Reset all bubble animations
    bubbleAnimations.forEach(anim => {
      anim.scale.setValue(0);
      anim.opacity.setValue(0);
      anim.position.setValue({ x: 0, y: 0 });
    });
    
    // Animate the glow effect
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
    
    // Animate each bubble with a slight delay between them
    bubbleAnimations.forEach((anim, index) => {
      // Random direction for each bubble
      const angle = (Math.PI * 2 * index) / BUBBLE_COUNT;
      const distance = Math.random() * 80 + 40; // Random distance between 40-120
      
      // Calculate end position based on angle and distance
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      // Stagger the animations
      setTimeout(() => {
        Animated.parallel([
          // Scale up
          Animated.timing(anim.scale, {
            toValue: Math.random() * 0.5 + 0.5, // Random size between 0.5-1
            duration: 600,
            useNativeDriver: true,
          }),
          // Move outward
          Animated.timing(anim.position, {
            toValue: { x: endX, y: endY },
            duration: 800,
            useNativeDriver: true,
          }),
          // Fade in then out
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, index * 50); // Stagger each bubble's animation
    });
  };
  
  const openAssistant = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Trigger the magic bubble animation
    animateMagicBubbles();
    
    setIsVisible(true);
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // Ensure we have a conversation
    if (!currentConversation) {
      startNewConversation();
    }
  };
  
  const closeAssistant = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsVisible(false);
    });
    
    Keyboard.dismiss();
  };
  
  const handleSend = async () => {
    if (message.trim() === '' || isLoading) return;
    
    const messageToSend = message;
    setMessage('');
    
    // Trigger a small bubble animation when sending a message
    animateMagicBubbles();
    
    await sendMessage(messageToSend);
  };
  
  const scrollToBottom = () => {
    if (flatListRef.current && currentConversation?.messages.length) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };
  
  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (isVisible && currentConversation?.messages.length) {
      setTimeout(scrollToBottom, 100);
    }
  }, [currentConversation?.messages.length, isVisible]);
  
  // Update position when screen dimensions change
  useEffect(() => {
    const updateLayout = () => {
      const { width: newWidth, height: newHeight } = Dimensions.get('window');
      
      // If button is outside new bounds, adjust it
      let newX = currentPosition.x;
      let newY = currentPosition.y;
      
      if (newX > newWidth - BUTTON_SIZE) {
        newX = newWidth - BUTTON_SIZE - 20;
      }
      
      if (newY > newHeight - BUTTON_SIZE - 100) {
        newY = newHeight - BUTTON_SIZE - 100;
      }
      
      position.setValue({ x: newX, y: newY });
      setCurrentPosition({ x: newX, y: newY });
    };
    
    // Use the appropriate event listener
    const dimensionsSubscription = Dimensions.addEventListener('change', updateLayout);
    
    // Return cleanup function
    return () => {
      dimensionsSubscription.remove();
    };
  }, [currentPosition, position]);
  
  // Generate the glow style based on animation
  const glowStyle = {
    transform: [
      {
        scale: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.3]
        })
      }
    ],
    opacity: glowAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.6, 0]
    })
  };
  
  return (
    <>
      <Animated.View
        style={[
          styles.floatingButton,
          { transform: position.getTranslateTransform() },
          { backgroundColor: theme === 'dark' ? colors.darkPrimary : colors.primary }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Magic bubbles */}
        {bubbleAnimations.map((anim, index) => (
          <Animated.View
            key={`bubble-${index}`}
            style={[
              styles.magicBubble,
              {
                backgroundColor: theme === 'dark' 
                  ? `rgba(96, 165, 250, ${0.7 - (index * 0.05)})` 
                  : `rgba(59, 130, 246, ${0.7 - (index * 0.05)})`,
                transform: [
                  { scale: anim.scale },
                  ...anim.position.getTranslateTransform()
                ],
                opacity: anim.opacity
              }
            ]}
          />
        ))}
        
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            glowStyle,
            { 
              backgroundColor: theme === 'dark' 
                ? colors.darkPrimary 
                : colors.primary 
            }
          ]}
        />
        
        <MessageCircle size={24} color={colors.white} />
      </Animated.View>
      
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={closeAssistant}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouchable}
            onPress={closeAssistant}
            activeOpacity={1}
          />
          
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
                backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
              }
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardAvoid}
            >
              <View style={[
                styles.modalHeader,
                { borderBottomColor: theme === 'dark' ? colors.darkBorder : colors.border }
              ]}>
                <Text style={[
                  styles.modalTitle,
                  { color: theme === 'dark' ? colors.darkText : colors.text }
                ]}>Spiritual Guide</Text>
                <TouchableOpacity onPress={closeAssistant} style={[
                  styles.closeButton,
                  { backgroundColor: theme === 'dark' ? colors.darkSecondaryBackground : colors.secondaryBackground }
                ]}>
                  <X size={20} color={theme === 'dark' ? colors.darkText : colors.text} />
                </TouchableOpacity>
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
                    <Text style={[
                      styles.emptyText,
                      { color: theme === 'dark' ? colors.darkLightText : colors.lightText }
                    ]}>
                      I am your spiritual guide on this journey. How may I assist with your meditation practice today?
                    </Text>
                  </View>
                }
                onContentSizeChange={scrollToBottom}
                onLayout={scrollToBottom}
              />
              
              <View style={[
                styles.inputContainer,
                { 
                  borderTopColor: theme === 'dark' ? colors.darkBorder : colors.border,
                  backgroundColor: theme === 'dark' ? colors.darkCard : colors.white
                }
              ]}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme === 'dark' ? colors.darkSecondaryBackground : colors.secondaryBackground,
                      color: theme === 'dark' ? colors.darkText : colors.text
                    }
                  ]}
                  placeholder="Ask for spiritual guidance..."
                  placeholderTextColor={theme === 'dark' ? colors.darkLightText : colors.lightText}
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
                    (message.trim() === '' || isLoading) && styles.sendButtonDisabled,
                    { backgroundColor: message.trim() === '' || isLoading 
                      ? (theme === 'dark' ? colors.darkLightText : colors.lightText)
                      : (theme === 'dark' ? colors.darkPrimary : colors.primary)
                    }
                  ]} 
                  onPress={handleSend}
                  disabled={message.trim() === '' || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Send size={18} color={colors.white} />
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  magicBubble: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.7)',
  },
  glow: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: colors.primary,
    opacity: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    height: '70%',
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  keyboardAvoid: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondaryBackground,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.lightText,
  },
});