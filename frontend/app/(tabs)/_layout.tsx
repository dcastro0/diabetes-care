import { useTheme } from "@/contexts/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import React from "react"
import { Platform, View } from "react-native"
import tw from "twrnc"

export default function TabLayout() {
  const { isDark } = useTheme()

  const activeColor = isDark ? (tw.color("blue-400") as string) : (tw.color("blue-600") as string)
  const inactiveColor = isDark ? (tw.color("slate-500") as string) : (tw.color("slate-400") as string)
  const navBg = isDark ? "#0F172A" : "#FFFFFF"
  const activeIconBg = isDark ? tw`bg-blue-500/20 p-1.5 rounded-full` : tw`bg-blue-50 p-1.5 rounded-full`

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: navBg,
          borderTopWidth: isDark ? 1 : 0,
          borderTopColor: isDark ? "#1E293B" : "transparent",
          elevation: 12,
          shadowColor: isDark ? "#000000" : "#0F172A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: 16,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
          marginHorizontal: Platform.OS === "ios" ? 16 : 0,
          marginBottom: Platform.OS === "ios" ? 16 : 0,
          borderRadius: Platform.OS === "ios" ? 32 : 0,
          position: Platform.OS === "ios" ? "absolute" : "relative",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Painel",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? activeIconBg : null}>
              <Feather size={20} name="grid" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="medir"
        options={{
          title: "Medir",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? activeIconBg : null}>
              <Feather size={20} name="plus-circle" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Conquistas",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? activeIconBg : null}>
              <Feather size={20} name="award" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? activeIconBg : null}>
              <Feather size={20} name="user" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  )
}
