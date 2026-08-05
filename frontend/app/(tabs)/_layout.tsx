import { Tabs } from "expo-router"
import React from "react"
import { Platform } from "react-native"

import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { HapticTab } from "../../components/HapticTab"
import { IconSymbol } from "../../components/ui/IconSymbol"
import TabBarBackground from "../../components/ui/TabBarBackground"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medir"
        options={{
          title: "Medir Glicemia",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="sort" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Recompensas",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="star" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="account-circle" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
