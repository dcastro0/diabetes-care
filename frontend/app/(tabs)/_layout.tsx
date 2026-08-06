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
  const activeIconBg = isDark ? tw`bg-blue-500/20 p-2 rounded-full` : tw`bg-blue-50 p-2 rounded-full`

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          letterSpacing: 0.2,
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: navBg,
          borderTopWidth: isDark ? 1 : 0,
          borderTopColor: isDark ? "#1E293B" : "transparent",
          elevation: 16,
          shadowColor: isDark ? "#000000" : "#0F172A",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.5 : 0.12,
          shadowRadius: 20,
          height: Platform.OS === "ios" ? 80 : 64,
          paddingBottom: Platform.OS === "ios" ? 22 : 8,
          paddingTop: 8,
          marginHorizontal: Platform.OS === "ios" ? 20 : 0,
          marginBottom: Platform.OS === "ios" ? 20 : 0,
          borderRadius: Platform.OS === "ios" ? 40 : 0,
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
