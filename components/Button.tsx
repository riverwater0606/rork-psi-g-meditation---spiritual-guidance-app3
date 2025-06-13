import React, { useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  Animated
} from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const { theme } = useThemeStore();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Get theme-specific colors
  const getButtonColor = () => {
    if (theme === 'dark') {
      switch (variant) {
        case 'primary': return colors.darkPrimary;
        case 'secondary': return colors.darkSecondary;
        case 'outline': return 'transparent';
        case 'text': return 'transparent';
        default: return colors.darkPrimary;
      }
    } else {
      switch (variant) {
        case 'primary': return colors.primary;
        case 'secondary': return colors.secondary;
        case 'outline': return 'transparent';
        case 'text': return 'transparent';
        default: return colors.primary;
      }
    }
  };
  
  const getTextColor = () => {
    if (theme === 'dark') {
      switch (variant) {
        case 'primary': 
        case 'secondary': 
          return colors.white;
        case 'outline': 
        case 'text': 
          return colors.darkPrimary;
        default: return colors.white;
      }
    } else {
      switch (variant) {
        case 'primary': 
        case 'secondary': 
          return colors.white;
        case 'outline': 
        case 'text': 
          return colors.primary;
        default: return colors.white;
      }
    }
  };
  
  const getBorderColor = () => {
    return theme === 'dark' ? colors.darkPrimary : colors.primary;
  };
  
  // Handle press with animation
  const handlePress = (e) => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Call the original onPress handler
    if (onPress) {
      onPress(e);
    }
  };
  
  const buttonStyles = [
    styles.button,
    { backgroundColor: getButtonColor() },
    variant === 'outline' && { borderWidth: 1, borderColor: getBorderColor() },
    styles[size],
    style
  ];
  
  const textStyles = [
    styles.buttonText,
    { color: getTextColor() },
    styles[`${size}Text`],
    textStyle
  ];
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={buttonStyles}
        disabled={loading || props.disabled}
        onPress={handlePress}
        {...props}
      >
        {loading ? (
          <ActivityIndicator 
            color={variant === 'primary' ? colors.white : (theme === 'dark' ? colors.darkPrimary : colors.primary)} 
            size="small" 
          />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});