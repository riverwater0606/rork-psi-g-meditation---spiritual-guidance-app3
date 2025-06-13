import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle, 
  TouchableOpacity, 
  TouchableOpacityProps 
} from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  onPress, 
  ...props 
}) => {
  const { theme } = useThemeStore();
  const backgroundColor = theme === 'dark' ? colors.darkCard : colors.card;
  const shadowColor = theme === 'dark' ? colors.darkShadow : colors.shadow;
  
  const cardStyles = [
    styles.card, 
    { backgroundColor, shadowColor },
    style
  ];
  
  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyles} 
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
});