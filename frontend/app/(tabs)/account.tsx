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
    { id: 2, label: "Lembretes e Alertas", icon: "clock", screen: "/lembretes" },
    { id: 3, label: "Configurações do Sistema", icon: "settings", screen: "/config" },
    { id: 4, label: "Central de Ajuda e Suporte", icon: "help-circle", screen: "/help" },
  ]

  if (!authData) {
    return (
      <SafeAreaView style={tw`flex-1 bg-slate-50 justify-center items-center`}>
        <ActivityIndicator size="large" color={(tw.color("blue-600") as string)} />
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
        {/* Cabeçalho */}
        <View style={tw`mb-6 mt-2 items-center`}>
          <Text style={tw`text-xs font-semibold text-slate-400 uppercase tracking-wider`}>
            Configurações Clínicas
          </Text>
          <Text style={tw`text-2xl font-bold text-slate-800`}>
            Minha Conta
          </Text>
        </View>

        {/* Card do Usuário */}
        <View style={tw`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-6`}>
          <View style={tw`flex-row items-center`}>
            {authData.avatar ? (
              <Image
                source={{ uri: authData.avatar }}
                style={tw`w-16 h-16 rounded-full`}
              />
            ) : (
              <View
                style={tw`w-16 h-16 rounded-full bg-blue-50 border border-blue-200 items-center justify-center`}
              >
                <Text style={tw`text-2xl font-bold text-blue-600`}>
                  {authData.nome?.[0] ?? "U"}
                </Text>
              </View>
            )}
            <View style={tw`ml-4 flex-1`}>
              <Text style={tw`text-xl font-bold text-slate-800`} numberOfLines={1}>
                {authData.nome}
              </Text>
              <Text style={tw`text-xs font-medium text-slate-500`} numberOfLines={1}>
                {authData.email}
              </Text>
              <Text style={tw`text-xs text-slate-400 mt-1`}>
                Membro desde {membroDesde}
              </Text>
            </View>
          </View>

          {/* Widgets de Métricas */}
          <View style={tw`border-t border-slate-100 mt-6 pt-4 flex-row justify-around`}>
            <View style={tw`items-center`}>
              <Text style={tw`text-lg font-bold text-slate-800`}>
                {totalMedicoes}
              </Text>
              <Text style={tw`text-xs font-semibold text-slate-400 uppercase`}>Medições</Text>
            </View>
            <View style={tw`w-[1px] bg-slate-100 h-8 self-center`} />
            <View style={tw`items-center`}>
              <Text style={tw`text-lg font-bold text-slate-800`}>
                {pontos}
              </Text>
              <Text style={tw`text-xs font-semibold text-slate-400 uppercase`}>Pontos</Text>
            </View>
            <View style={tw`w-[1px] bg-slate-100 h-8 self-center`} />
            <View style={tw`items-center`}>
              <Text style={tw`text-lg font-bold text-blue-600`}>{streak}</Text>
              <Text style={tw`text-xs font-semibold text-slate-400 uppercase`}>Dias Ativos</Text>
            </View>
          </View>
        </View>

        {/* Opções do Menu */}
        <View style={tw`bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-6`}>
          {menuOptions.map((option, index) => (
            <Pressable
              key={option.id}
              onPress={() => router.push(option.screen as any)}
              style={({ pressed }) => [
                tw`flex-row items-center justify-between p-4.5`,
                pressed && tw`bg-slate-50`,
                index < menuOptions.length - 1 && tw`border-b border-slate-100`,
              ]}
            >
              <View style={tw`flex-row items-center gap-3.5`}>
                <View style={tw`bg-slate-100 p-2 rounded-xl`}>
                  <Feather
                    name={option.icon as any}
                    size={18}
                    color={(tw.color("slate-600") as string)}
                  />
                </View>
                <Text style={tw`text-sm font-semibold text-slate-700`}>
                  {option.label}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color={(tw.color("slate-400") as string)}
              />
            </Pressable>
          ))}
        </View>

        {/* Botão Sair */}
        <Pressable
          onPress={() => {
            signOut()
            router.replace("/login")
          }}
          style={({ pressed }) => [
            tw`bg-white py-3.5 rounded-2xl border border-red-200 shadow-sm`,
            pressed && tw`bg-red-50`,
          ]}
        >
          <Text style={tw`text-red-600 font-bold text-center text-sm`}>
            Encerrar Sessão
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}