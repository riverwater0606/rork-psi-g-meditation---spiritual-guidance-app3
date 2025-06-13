import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MeditationSession, UserProfile } from '@/types';

// Token reward rate: tokens per minute of meditation
const TOKEN_REWARD_RATE = 0.2; // 1 token per 5 minutes

interface MeditationState {
  sessions: MeditationSession[];
  currentSession: MeditationSession | null;
  profile: UserProfile;
  isTimerRunning: boolean;
  remainingTime: number;
  tokenBalance: number;
  
  // Actions
  startSession: (spaceId: string | null, spaceName: string | null, duration: number) => void;
  completeSession: () => void;
  failSession: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  updateRemainingTime: (time: number) => void;
  resetCurrentSession: () => void;
  addTokens: (amount: number) => void;
}

export const useMeditationStore = create<MeditationState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      profile: {
        totalSessions: 0,
        totalMinutes: 0,
        streak: 0,
        lastMeditation: null,
      },
      isTimerRunning: false,
      remainingTime: 0,
      tokenBalance: 0,
      
      startSession: (spaceId, spaceName, duration) => {
        const newSession: MeditationSession = {
          id: Date.now().toString(),
          spaceId,
          spaceName,
          duration,
          date: new Date().toISOString(),
          completed: false,
          failed: false,
        };
        
        set({
          currentSession: newSession,
          isTimerRunning: true,
          remainingTime: duration === -1 ? 0 : duration, // For unlimited sessions, set to 0 but don't count down
        });
      },
      
      completeSession: () => {
        const { currentSession, sessions, profile } = get();
        
        if (!currentSession) return;
        
        // Calculate session duration in minutes for token rewards
        let sessionDurationMinutes = 0;
        
        if (currentSession.duration === -1) {
          // For unlimited sessions, use a default value or calculate based on elapsed time
          // Here we'll use 30 minutes as a default reward for unlimited sessions
          sessionDurationMinutes = 30;
        } else {
          sessionDurationMinutes = Math.floor(currentSession.duration / 60);
        }
        
        // Calculate token rewards
        const tokenReward = Math.floor(sessionDurationMinutes * TOKEN_REWARD_RATE);
        
        const completedSession = {
          ...currentSession,
          completed: true,
          failed: false,
        };
        
        // Check if this is a new day for streak calculation
        const lastDate = profile.lastMeditation 
          ? new Date(profile.lastMeditation).setHours(0, 0, 0, 0)
          : null;
        const today = new Date().setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutiveDay = lastDate && 
          (lastDate === yesterday.getTime() || lastDate === today);
        
        const newStreak = !profile.lastMeditation 
          ? 1 
          : (isConsecutiveDay ? profile.streak + 1 : 1);
        
        set((state) => ({
          sessions: [completedSession, ...sessions],
          currentSession: null,
          isTimerRunning: false,
          remainingTime: 0,
          profile: {
            totalSessions: profile.totalSessions + 1,
            totalMinutes: profile.totalMinutes + sessionDurationMinutes,
            streak: newStreak,
            lastMeditation: new Date().toISOString(),
          },
          tokenBalance: state.tokenBalance + tokenReward,
        }));
      },
      
      failSession: () => {
        const { currentSession, sessions } = get();
        
        if (!currentSession) return;
        
        const failedSession = {
          ...currentSession,
          completed: false,
          failed: true,
          date: new Date().toISOString(), // Update the date to when it was failed
        };
        
        set({
          sessions: [failedSession, ...sessions],
          currentSession: null,
          isTimerRunning: false,
          remainingTime: 0,
        });
      },
      
      pauseTimer: () => set({ isTimerRunning: false }),
      
      resumeTimer: () => set({ isTimerRunning: true }),
      
      updateRemainingTime: (time) => set({ remainingTime: time }),
      
      resetCurrentSession: () => set({ 
        currentSession: null, 
        isTimerRunning: false,
        remainingTime: 0,
      }),
      
      addTokens: (amount) => set((state) => ({
        tokenBalance: state.tokenBalance + amount
      })),
    }),
    {
      name: 'meditation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);