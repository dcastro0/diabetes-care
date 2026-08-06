import { useAuth } from "@/hooks/useAuth"
import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import React from "react"
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import tw from "twrnc"

export default function AccountScreen() {
  const { signOut, authData } = useAuth()

  const menuOptions = [
    { id: 1, label: "Editar Perfil", icon: "user", screen: "/edit_profile" },
    { id: 2, label: "Lembretes", icon: "clock", screen: "/lembretes" },
    { id: 3, label: "Configurações", icon: "settings", screen: "/config" },
    { id: 4, label: "Ajuda e Suporte", icon: "help-circle", screen: "/help" },
  ]

  if (!authData) {
    return (
      <SafeAreaView style={tw`flex-1 bg-slate-50 justify-center items-center`}>
        <ActivityIndicator size="large" color={tw.color("blue-600")} />
      </SafeAreaView>
    )
  }

  const totalMedicoes = authData.totalMedicoes ?? 0
  const pontos = authData.pontos ?? 0
  const membroDesde = authData.membroDesde ?? "—"
  const streak = authData.streak_count ?? 0

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <ScrollView contentContainerStyle={tw`p-6`}>
        <View style={tw`mb-8 pt-4 mt-8`}>
          <Text style={tw`text-3xl font-bold text-slate-800 text-center`}>
            Minha Conta
          </Text>
        </View>

        <View style={tw`bg-white rounded-3xl p-6 shadow-md shadow-slate-200 mb-8`}>
          <View style={tw`flex-row items-center`}>
            {authData.avatar ? (
              <Image
                source={{ uri: authData.avatar }}
                style={tw`w-20 h-20 rounded-full`}
              />
            ) : (
              <View
                style={tw`w-20 h-20 rounded-full bg-blue-100 items-center justify-center`}
              >
                <Text style={tw`text-3xl font-bold text-blue-600`}>
                  {authData.nome?.[0] ?? "U"}
                </Text>
              </View>
            )}
            <View style={tw`ml-4`}>
              <Text style={tw`text-2xl font-bold text-slate-800`}>
                {authData.nome}
              </Text>
              <Text style={tw`text-base text-slate-500`}>{authData.email}</Text>
              <Text style={tw`text-xs text-slate-400 mt-1`}>Membro desde {membroDesde}</Text>
            </View>
          </View>
          <View style={tw`border-t border-slate-100 mt-6 pt-4 flex-row justify-around`}>
            <View style={tw`items-center`}>
              <Text style={tw`text-xl font-bold text-blue-600`}>
                {totalMedicoes}
              </Text>
              <Text style={tw`text-sm text-slate-500`}>Medições</Text>
            </View>
            <View style={tw`items-center`}>
              <Text style={tw`text-xl font-bold text-blue-600`}>
                {pontos}
              </Text>
              <Text style={tw`text-sm text-slate-500`}>Pontos</Text>
            </View>
            <View style={tw`items-center`}>
              <Text style={tw`text-xl font-bold text-blue-600`}>{streak}</Text>
              <Text style={tw`text-sm text-slate-500`}>Dias de ofensiva</Text>
            </View>
          </View>
        </View>

        <View style={tw`bg-white rounded-3xl shadow-md shadow-slate-200`}>
          {menuOptions.map((option, index) => (
            <Pressable
              key={option.id}
              onPress={() => router.push(option.screen as any)}
              style={({ pressed }) => [
                tw`flex-row items-center justify-between p-5`,
                pressed && tw`bg-slate-50`,
                index < menuOptions.length - 1 &&
                  tw`border-b border-slate-100`,
              ]}
            >
              <View style={tw`flex-row items-center gap-4`}>
                <Feather
                  name={option.icon as any}
                  size={22}
                  color={tw.color("slate-500")}
                />
                <Text style={tw`text-base font-semibold text-slate-700`}>
                  {option.label}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={22}
                color={tw.color("slate-400")}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => {
            signOut()
            router.replace("/login")
          }}
          style={({ pressed }) => [
            tw`bg-white mt-8 py-4 rounded-2xl border border-red-200`,
            pressed && tw`bg-red-50`,
          ]}
        >
          <Text style={tw`text-red-500 font-bold text-center text-base`}>
            Sair
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}