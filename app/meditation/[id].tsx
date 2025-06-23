import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  ScrollView
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, ChevronLeft, Clock, Plus, Minus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMeditationStore } from '@/store/meditationStore';
import { meditationSpaces } from '@/constants/meditationSpaces';
import { Button } from '@/components/Button';
import colors from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '@/store/themeStore';

// Quick preset durations in seconds
const QUICK_PRESETS = [
  { label: "5 min", value: 5 * 60 },
  { label: "10 min", value: 10 * 60 },
  { label: "15 min", value: 15 * 60 },
  { label: "30 min", value: 30 * 60 },
  { label: "45 min", value: 45 * 60 },
  { label: "60 min", value: 60 * 60 },
  { label: "90 min", value: 90 * 60 },
  { label: "Unlimited", value: -1 } // Special value for unlimited
];

// Minimum time (in seconds) for unlimited meditation before allowing completion
const MIN_UNLIMITED_TIME = 5 * 60; // 5 minutes

export default function MeditationSessionScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const customDurationParam = params.duration ? parseInt(params.duration as string) : null;
  
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useThemeStore();
  
  const { 
    startSession, 
    completeSession, 
    failSession, 
    pauseTimer, 
    resumeTimer, 
    resetCurrentSession,
    isTimerRunning,
    remainingTime,
    currentSession
  } = useMeditationStore();
  
  const [showControls, setShowControls] = useState(true);
  const [customDuration, setCustomDuration] = useState(customDurationParam || 300);
  const [showDurationPicker, setShowDurationPicker] = useState(id === 'quick' && !customDurationParam);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [meditationStarted, setMeditationStarted] = useState(false);
  const [showExtendOptions, setShowExtendOptions] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Get space details if this is a space-specific meditation
  const isQuickSession = id === 'quick';
  const space = !isQuickSession ? meditationSpaces.find(s => s.id === id) : null;
  
  // Initialize session but don't start timer automatically
  useEffect(() => {
    if (!currentSession && !showDurationPicker) {
      startSession(
        space?.id || null,
        space?.name || null,
        customDuration
      );
      pauseTimer();
    }
  }, [space, startSession, currentSession, customDuration, showDurationPicker]);
  
  // Timer logic - only run when meditation has been started
  useEffect(() => {
    if (customDuration === -1 && isTimerRunning && meditationStarted) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    
    if (isTimerRunning && remainingTime > 0 && meditationStarted) {
      intervalRef.current = setInterval(() => {
        useMeditationStore.getState().updateRemainingTime(
          useMeditationStore.getState().remainingTime - 1
        );
      }, 1000);
    } else if (remainingTime <= 0 && currentSession && meditationStarted) {
      setTimerCompleted(true);
      setShowExtendOptions(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, remainingTime, meditationStarted, customDuration]);
  
  const formatTime = (seconds: number) => {
    if (seconds === -1) {
      return "∞";
    }
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const toggleTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (isTimerRunning) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  };
  
  const handleStartMeditation = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setMeditationStarted(true);
    resumeTimer();
  };
  
  const handleExit = () => {
    if (isTimerRunning) {
      pauseTimer();
    }
    
    Alert.alert(
      "Exit Meditation",
      "Are you sure you want to exit this meditation session? You will lose any progress for this session.",
      [
        {
          text: "Cancel",
          onPress: () => {
            if (meditationStarted && !timerCompleted) {
              resumeTimer();
            }
          },
          style: "cancel"
        },
        {
          text: "Exit",
          onPress: () => {
            failSession();
            router.replace('/(tabs)/index');
          },
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
  };
  
  const isCompleteEnabled = () => {
    if (customDuration !== -1) {
      return timerCompleted;
    }
    return elapsedTime >= MIN_UNLIMITED_TIME;
  };
  
  const handleComplete = () => {
    if (isCompleteEnabled()) {
      completeSession();
      router.replace('/(tabs)/profile');
    }
  };
  
  const handleDurationSelect = (seconds: number) => {
    setCustomDuration(seconds);
    setShowDurationPicker(false);
  };
  
  const handleExtendMeditation = (additionalMinutes: number) => {
    const additionalSeconds = additionalMinutes * 60;
    useMeditationStore.getState().updateRemainingTime(additionalSeconds);
    
    if (currentSession) {
      const newDuration = currentSession.duration + additionalSeconds;
      startSession(
        currentSession.spaceId,
        currentSession.spaceName,
        newDuration
      );
    }
    
    setTimerCompleted(false);
    setShowExtendOptions(false);
    resumeTimer();
  };
  
  const renderDurationPicker = () => {
    return (
      <View style={[
        styles.durationPickerContainer,
        { backgroundColor: theme === 'light' ? colors.background : colors.darkBackground }
      ]}>
        <View style={styles.durationPickerHeader}>
          <Text style={[
            styles.durationPickerTitle,
            { color: theme === 'light' ? colors.text : colors.darkText }
          ]}>Select Meditation Duration</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={theme === 'light' ? colors.text : colors.darkText} />
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={styles.durationList}>
          {QUICK_PRESETS.map(preset => (
            <TouchableOpacity
              key={preset.label}
              style={[
                styles.durationOption,
                { backgroundColor: theme === 'light' ? colors.white : colors.darkCard }
              ]}
              onPress={() => handleDurationSelect(preset.value)}
            >
              <Clock size={20} color={theme === 'light' ? colors.primary : colors.darkPrimary} />
              <Text style={[
                styles.durationText,
                { color: theme === 'light' ? colors.text : colors.darkText }
              ]}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={[
              styles.durationOption,
              { backgroundColor: theme === 'light' ? colors.white : colors.darkCard }
            ]}
            onPress={() => setShowDurationPicker(false)}
          >
            <ChevronLeft size={20} color={theme === 'light' ? colors.text : colors.darkText} />
            <Text style={[
              styles.durationText,
              { color: theme === 'light' ? colors.text : colors.darkText }
            ]}>Custom Duration</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };
  
  const renderExtendOptions = () => {
    return (
      <View style={styles.extendContainer}>
        <Text style={styles.extendTitle}>Meditation Complete</Text>
        <Text style={styles.extendText}>Would you like to extend your session?</Text>
        
        <View style={styles.extendButtonsRow}>
          <TouchableOpacity 
            style={styles.extendButton}
            onPress={() => handleExtendMeditation(5)}
          >
            <Text style={styles.extendButtonText}>+5 min</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.extendButton}
            onPress={() => handleExtendMeditation(10)}
          >
            <Text style={styles.extendButtonText}>+10 min</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.extendButton}
            onPress={() => handleExtendMeditation(15)}
          >
            <Text style={styles.extendButtonText}>+15 min</Text>
          </TouchableOpacity>
        </View>
        
        <Button 
          title="Complete Meditation" 
          style={styles.completeButton}
          onPress={handleComplete}
        />
      </View>
    );
  };
  
  const renderCustomDurationPicker = () => {
    const minutes = customDuration === -1 ? "∞" : Math.floor(customDuration / 60);
    
    const incrementDuration = () => {
      if (customDuration === -1) return;
      setCustomDuration(prev => prev + 5 * 60);
    };
    
    const decrementDuration = () => {
      if (customDuration === -1) {
        setCustomDuration(60 * 60);
        return;
      }
      if (customDuration > 5 * 60) {
        setCustomDuration(prev => prev - 5 * 60);
      }
    };
    
    const toggleUnlimited = () => {
      setCustomDuration(prev => prev === -1 ? 30 * 60 : -1);
    };
    
    return (
      <View style={styles.customDurationContainer}>
        <Text style={styles.customDurationTitle}>Set Custom Duration</Text>
        
        <View style={styles.customDurationControls}>
          <TouchableOpacity 
            style={styles.durationButton}
            onPress={decrementDuration}
            disabled={customDuration === 5 * 60}
          >
            <Minus size={24} color={colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.durationDisplay}
            onPress={toggleUnlimited}
          >
            <Text style={styles.durationValue}>
              {minutes === "∞" ? "∞" : `${minutes} min`}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.durationButton}
            onPress={incrementDuration}
            disabled={customDuration === -1}
          >
            <Plus size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.customDurationButtons}>
          <Button 
            title="Cancel" 
            variant="outline"
            style={styles.customDurationButton}
            textStyle={{ color: colors.white }}
            onPress={() => router.back()}
          />
          
          <Button 
            title="Start" 
            style={styles.customDurationButton}
            onPress={() => setShowDurationPicker(false)}
          />
        </View>
      </View>
    );
  };
  
  if (showDurationPicker) {
    return (
      <View style={[
        styles.container, 
        { backgroundColor: theme === 'light' ? colors.background : colors.darkBackground }
      ]}>
        <StatusBar style={theme === 'light' ? "dark" : "light"} />
        {renderDurationPicker()}
      </View>
    );
  }
  
  if (remainingTime <= 0 && !currentSession) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={theme === 'light' ? ['#4c669f', '#3b5998', '#192f6a'] : ['#1E3A8A', '#2563EB', '#3B82F6']}
          style={styles.background}
        />
        <View style={styles.completionContainer}>
          <Text style={styles.completionTitle}>Session Complete</Text>
          <Text style={styles.completionText}>
            Congratulations on completing your meditation session.
          </Text>
          <Button 
            title="Return to Home" 
            style={styles.completionButton}
            onPress={() => router.replace('/(tabs)/index')}
          />
        </View>
      </View>
    );
  }
  
  if (!meditationStarted) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {space ? (
          <Image
            source={{ uri: space.imageUrl }}
            style={styles.background}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={theme === 'light' ? ['#4c669f', '#3b5998', '#192f6a'] : ['#1E3A8A', '#2563EB', '#3B82F6']}
            style={styles.background}
          />
        )}
        
        <View style={styles.preparationContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.preparationContent}>
            <Text style={styles.preparationTitle}>
              {space ? space.name : "Quick Meditation"}
            </Text>
            <Text style={styles.preparationDuration}>
              {customDuration === -1 ? "∞" : formatTime(customDuration)}
            </Text>
            <Text style={styles.preparationText}>
              Find a comfortable position and take a few deep breaths before starting.
            </Text>
            
            <Button 
              title="Begin Meditation" 
              size="large"
              style={styles.startButton}
              onPress={handleStartMeditation}
            />
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {space ? (
        <Image
          source={{ uri: space.imageUrl }}
          style={styles.background}
          contentFit="cover"
        />
      ) : (
        <LinearGradient
          colors={theme === 'light' ? ['#4c669f', '#3b5998', '#192f6a'] : ['#1E3A8A', '#2563EB', '#3B82F6']}
          style={styles.background}
        />
      )}
      
      <View style={styles.fullScreenContainer}>
        <View style={styles.alwaysVisibleHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleExit}
          >
            <ChevronLeft size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        {showExtendOptions && (
          <View style={styles.extendOverlay}>
            {renderExtendOptions()}
          </View>
        )}
        
        <View style={[
          styles.controlsContainer,
          { display: showControls ? 'flex' : 'none' }
        ]}>
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>
              {customDuration === -1 ? formatTime(elapsedTime) : formatTime(remainingTime)}
            </Text>
            {space && (
              <Text style={styles.spaceName}>{space.name}</Text>
            )}
            <Text style={styles.guidanceText}>
              Focus on your breath and let go of your thoughts
            </Text>
          </View>
          
          <View style={styles.controlsRow}>
            <TouchableOpacity 
              style={styles.timerButton} 
              onPress={toggleTimer}
            >
              {isTimerRunning ? (
                <Pause size={32} color={colors.white} />
              ) : (
                <Play size={32} color={colors.white} />
              )}
            </TouchableOpacity>
            
            <View style={styles.actionButtonsContainer}>
              <Button 
                title="Complete" 
                style={[
                  styles.actionButton,
                  (!isCompleteEnabled() || !isTimerRunning) && styles.disabledButton
                ]}
                textStyle={{ 
                  color: (isCompleteEnabled() && isTimerRunning) ? colors.white : 'rgba(255,255,255,0.5)' 
                }}
                onPress={handleComplete}
                disabled={!isCompleteEnabled() || !isTimerRunning}
              />
              
              <Button 
                title="Exit" 
                variant="outline"
                style={[styles.actionButton, styles.stopButton]}
                textStyle={{ color: colors.white }}
                onPress={handleExit}
              />
            </View>
          </View>
        </View>
        
        {!showControls && (
          <View style={styles.minimalTimerContainer}>
            <Text style={styles.minimalTimer}>
              {customDuration === -1 ? formatTime(elapsedTime) : formatTime(remainingTime)}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.toggleControlsButton} 
          onPress={() => setShowControls(prevState => !prevState)}
        >
          <Text style={styles.toggleControlsText}>
            {showControls ? "Hide Controls" : "Show Controls"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  alwaysVisibleHeader: {
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  spaceName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  guidanceText: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: '80%',
  },
  controlsRow: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  timerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    minWidth: 120,
  },
  stopButton: {
    borderColor: 'rgba(255,255,255,0.8)',
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  disabledButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  completionText: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 32,
  },
  completionButton: {
    minWidth: 200,
  },
  durationPickerContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  durationPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  durationPickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  durationList: {
    paddingBottom: 24,
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  durationText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  minimalTimerContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -50 }],
  },
  minimalTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  toggleControlsButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 10,
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
  },
  toggleControlsText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  preparationContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  preparationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  preparationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  preparationDuration: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 24,
  },
  preparationText: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  startButton: {
    minWidth: 220,
    marginBottom: 16,
  },
  cancelButton: {
    padding: 12,
  },
  cancelText: {
    color: colors.white,
    fontSize: 16,
    opacity: 0.8,
  },
  extendOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  extendContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  extendTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
  },
  extendText: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 24,
  },
  extendButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  extendButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  extendButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    minWidth: 200,
  },
  customDurationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  customDurationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 32,
  },
  customDurationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  durationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationDisplay: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginHorizontal: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  durationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  customDurationButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  customDurationButton: {
    minWidth: 120,
  },
});