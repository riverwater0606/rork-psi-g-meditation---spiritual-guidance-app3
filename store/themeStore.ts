import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeState {
  theme: ThemeType;
  isSystemTheme: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  setSystemTheme: (useSystem: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      isSystemTheme: true,
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light',
        isSystemTheme: false
      })),
      
      setTheme: (theme) => set({ 
        theme,
        isSystemTheme: false
      }),
      
      setSystemTheme: (useSystem) => set({ 
        isSystemTheme: useSystem 
      }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hook to sync with system theme changes
export function useSystemThemeSync() {
  const { isSystemTheme, setTheme } = useThemeStore();
  const systemTheme = useColorScheme();
  
  useEffect(() => {
    if (isSystemTheme && systemTheme) {
      setTheme(systemTheme as ThemeType);
    }
  }, [isSystemTheme, systemTheme, setTheme]);
}