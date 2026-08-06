import { Feather } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import React from "react"
import { Platform, View } from "react-native"
import tw from "twrnc"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tw.color("blue-600") as string,
        tabBarInactiveTintColor: tw.color("slate-400") as string,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
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
            <View style={focused ? tw`bg-blue-50 p-1.5 rounded-full` : null}>
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
            <View style={focused ? tw`bg-blue-50 p-1.5 rounded-full` : null}>
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
            <View style={focused ? tw`bg-blue-50 p-1.5 rounded-full` : null}>
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
            <View style={focused ? tw`bg-blue-50 p-1.5 rounded-full` : null}>
              <Feather size={20} name="user" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  )
}
