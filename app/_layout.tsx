import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Animated } from "react-native";
import colors from "@/constants/colors";
import { FloatingAssistant } from "@/components/FloatingAssistant";
import { usePathname } from "expo-router";
import { useThemeStore, useSystemThemeSync } from "@/store/themeStore";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Animation configuration for page transitions
const transitionConfig = {
  screenInterpolator: ({ position, scene }) => {
    const { index } = scene;
    
    // Slide from right animation
    const translateX = position.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: [300, 0, 0],
    });
    
    // Fade animation
    const opacity = position.interpolate({
      inputRange: [index - 1, index - 0.99, index],
      outputRange: [0, 1, 1],
    });
    
    return {
      transform: [{ translateX }],
      opacity,
    };
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Initialize system theme sync
  useSystemThemeSync();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const pathname = usePathname();
  const { theme } = useThemeStore();
  
  // Don't show the floating assistant on meditation screens
  const showFloatingAssistant = !pathname.includes('/meditation/');
  
  // Set background color based on theme
  const backgroundColor = theme === 'dark' ? colors.darkBackground : colors.background;
  const headerBackgroundColor = theme === 'dark' ? colors.darkBackground : colors.background;
  const headerTintColor = theme === 'dark' ? colors.darkPrimary : colors.primary;
  const headerTitleColor = theme === 'dark' ? colors.darkText : colors.text;
  
  // Animation value for screen transitions
  const screenAnimation = React.useRef(new Animated.Value(0)).current;
  
  return (
    <View style={{ flex: 1, backgroundColor }}>
      <StatusBar style={theme === 'dark' ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: headerBackgroundColor,
          },
          headerTintColor: headerTintColor,
          headerTitleStyle: {
            fontWeight: '600',
            color: headerTitleColor,
          },
          contentStyle: {
            backgroundColor: backgroundColor,
          },
          // Add animation for page transitions
          animation: 'slide_from_right',
          // Custom animation options
          animationDuration: 300,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          // For web compatibility
          presentation: 'card',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="meditation/[id]" 
          options={{ 
            title: "Meditation Session",
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="space/[id]" 
          options={{ 
            title: "Meditation Space",
            presentation: "card",
          }} 
        />
      </Stack>
      
      {/* Only show the floating assistant when not on meditation screens */}
      {showFloatingAssistant && <FloatingAssistant />}
    </View>
  );
}