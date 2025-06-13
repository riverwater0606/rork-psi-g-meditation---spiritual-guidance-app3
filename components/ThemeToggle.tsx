import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Moon, Sun, Smartphone } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import colors from '@/constants/colors';

interface ThemeToggleProps {
  style?: any;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ style }) => {
  const { theme, isSystemTheme, toggleTheme, setTheme, setSystemTheme } = useThemeStore();
  
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          !isSystemTheme && theme === 'light' && styles.activeButton,
          { backgroundColor: theme === 'dark' ? colors.darkSecondaryBackground : colors.secondaryBackground }
        ]}
        onPress={() => setTheme('light')}
      >
        <Sun 
          size={20} 
          color={
            !isSystemTheme && theme === 'light' 
              ? colors.primary 
              : theme === 'dark' ? colors.darkLightText : colors.lightText
          } 
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.button,
          !isSystemTheme && theme === 'dark' && styles.activeButton,
          { backgroundColor: theme === 'dark' ? colors.darkSecondaryBackground : colors.secondaryBackground }
        ]}
        onPress={() => setTheme('dark')}
      >
        <Moon 
          size={20} 
          color={
            !isSystemTheme && theme === 'dark' 
              ? colors.darkPrimary 
              : theme === 'dark' ? colors.darkLightText : colors.lightText
          } 
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.button,
          isSystemTheme && styles.activeButton,
          { backgroundColor: theme === 'dark' ? colors.darkSecondaryBackground : colors.secondaryBackground }
        ]}
        onPress={() => setSystemTheme(true)}
      >
        <Smartphone 
          size={20} 
          color={
            isSystemTheme 
              ? theme === 'dark' ? colors.darkPrimary : colors.primary 
              : theme === 'dark' ? colors.darkLightText : colors.lightText
          } 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});