import React from "react";
import { Tabs } from "expo-router";
import { Home, Compass, User, MessageCircle } from "lucide-react-native";
import colors from "@/constants/colors";
import { useThemeStore } from "@/store/themeStore";
import { ThemeToggle } from "@/components/ThemeToggle";
import { View, Animated, TouchableOpacity } from "react-native";

export default function TabLayout() {
  const { theme } = useThemeStore();
  
  // Set colors based on theme
  const backgroundColor = theme === 'dark' ? colors.darkBackground : colors.background;
  const tabBarBackgroundColor = theme === 'dark' ? colors.darkCard : colors.white;
  const tabBarBorderColor = theme === 'dark' ? colors.darkBorder : colors.border;
  const headerBorderColor = theme === 'dark' ? colors.darkBorder : colors.border;
  const textColor = theme === 'dark' ? colors.darkText : colors.text;
  const activeTintColor = theme === 'dark' ? colors.darkPrimary : colors.primary;
  const inactiveTintColor = theme === 'dark' ? colors.darkLightText : colors.lightText;

  // Animation for tab press
  const createTabAnimation = () => {
    const anim = new Animated.Value(1);
    return {
      anim,
      onPress: () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };
  };
  
  // Create animations for each tab
  const homeAnim = React.useRef(createTabAnimation()).current;
  const spacesAnim = React.useRef(createTabAnimation()).current;
  const assistantAnim = React.useRef(createTabAnimation()).current;
  const profileAnim = React.useRef(createTabAnimation()).current;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          borderTopColor: tabBarBorderColor,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: backgroundColor,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: headerBorderColor,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: textColor,
        },
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <ThemeToggle />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Animated.View style={{ transform: [{ scale: homeAnim.anim }] }}>
              <Home size={22} color={color} />
            </Animated.View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={(e) => {
                homeAnim.onPress();
                props.onPress?.(e);
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="spaces"
        options={{
          title: "Spaces",
          tabBarIcon: ({ color }) => (
            <Animated.View style={{ transform: [{ scale: spacesAnim.anim }] }}>
              <Compass size={22} color={color} />
            </Animated.View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={(e) => {
                spacesAnim.onPress();
                props.onPress?.(e);
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Assistant",
          tabBarIcon: ({ color }) => (
            <Animated.View style={{ transform: [{ scale: assistantAnim.anim }] }}>
              <MessageCircle size={22} color={color} />
            </Animated.View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={(e) => {
                assistantAnim.onPress();
                props.onPress?.(e);
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Animated.View style={{ transform: [{ scale: profileAnim.anim }] }}>
              <User size={22} color={color} />
            </Animated.View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={(e) => {
                profileAnim.onPress();
                props.onPress?.(e);
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}