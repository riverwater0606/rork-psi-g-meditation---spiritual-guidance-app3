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
          animation: 'slide_from_right',
          animationDuration: 300,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
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
      
      {showFloatingAssistant && <FloatingAssistant />}
    </View>
  );
}