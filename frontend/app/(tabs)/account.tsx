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
    { id: 2, label: "Dicas & Educação em Saúde", icon: "book-open", screen: "/dicas" },
    { id: 3, label: "Lembretes e Alertas", icon: "clock", screen: "/lembretes" },
    { id: 4, label: "Configurações do Sistema", icon: "settings", screen: "/config" },
    { id: 5, label: "Central de Ajuda e Suporte", icon: "help-circle", screen: "/help" },
  ]

  if (!authData) {
    return (
      <SafeAreaView style={tw`flex-1 bg-slate-50 justify-center items-center`}>
        <ActivityIndicator size="large" color={(tw.color("blue-600") as string)} />
      </SafeAreaView>
    )
  }

  const totalMedicoes = authData.totalMedicoes ?? 0
  const membroDesde = authData.membroDesde ?? "—"
  const streak = authData.streak_count ?? 0

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <ScrollView contentContainerStyle={tw`p-6`}>
        {/* Cabeçalho */}
        <View style={tw`mb-6 mt-2 items-center`}>
          <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest`}>
            Prontuário & Configurações
          </Text>
          <Text style={tw`text-2xl font-bold text-slate-800`}>
            Perfil do Paciente
          </Text>
        </View>

        {/* Cartão de Identificação Médica do Paciente (Medical ID Card) */}
        <View style={tw`bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl mb-6`}>
          {/* Header do Cartão de Identificação */}
          <View style={tw`flex-row justify-between items-center border-b border-slate-800 pb-4 mb-4`}>
            <View style={tw`flex-row items-center gap-2`}>
              <Image
                source={require("../../assets/images/glico_mascot.png")}
                style={tw`w-7 h-7 rounded-full border border-blue-400/40`}
              />
              <View>
                <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider`}>
                  Diabetes Care Medical ID
                </Text>
                <Text style={tw`text-xs text-emerald-400 font-semibold`}>Sincronizado</Text>
              </View>
            </View>
            <View style={tw`bg-slate-800 px-3 py-1 rounded-full border border-slate-700`}>
              <Text style={tw`text-xs font-bold text-slate-300`}>Paciente</Text>
            </View>
          </View>

          {/* Dados do Paciente */}
          <View style={tw`flex-row items-center`}>
            {authData.avatar ? (
              <Image
                source={{ uri: authData.avatar }}
                style={tw`w-16 h-16 rounded-2xl border-2 border-slate-700`}
              />
            ) : (
              <View
                style={tw`w-16 h-16 rounded-2xl bg-blue-600 border border-blue-400/40 items-center justify-center`}
              >
                <Text style={tw`text-2xl font-black text-white`}>
                  {authData.nome?.[0] ?? "U"}
                </Text>
              </View>
            )}
            <View style={tw`ml-4 flex-1`}>
              <Text style={tw`text-lg font-bold text-white`} numberOfLines={1}>
                {authData.nome}
              </Text>
              <Text style={tw`text-xs text-slate-400 font-medium`} numberOfLines={1}>
                {authData.email}
              </Text>
              <View style={tw`flex-row items-center gap-1 mt-1`}>
                <Feather name="calendar" size={12} color={(tw.color("slate-500") as string)} />
                <Text style={tw`text-xs text-slate-400`}>
                  Cadastrado em {membroDesde}
                </Text>
              </View>
            </View>
          </View>

          {/* Métricas Clínicas */}
          <View style={tw`border-t border-slate-800 mt-5 pt-4 flex-row justify-around`}>
            <View style={tw`items-center`}>
              <Text style={tw`text-xl font-black text-white`}>
                {totalMedicoes}
              </Text>
              <Text style={tw`text-xs font-semibold text-slate-400 uppercase tracking-wider`}>
                Medições
              </Text>
            </View>
            <View style={tw`w-[1px] bg-slate-800 h-8 self-center`} />
            <View style={tw`items-center`}>
              <Text style={tw`text-xl font-black text-blue-400`}>
                {streak}
              </Text>
              <Text style={tw`text-xs font-semibold text-slate-400 uppercase tracking-wider`}>
                Dias Ativos
              </Text>
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
                <View style={tw`bg-slate-100 p-2.5 rounded-xl`}>
                  <Feather
                    name={option.icon as any}
                    size={18}
                    color={(tw.color("slate-700") as string)}
                  />
                </View>
                <Text style={tw`text-sm font-bold text-slate-700`}>
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
            tw`bg-white py-4 rounded-2xl border border-red-200 shadow-sm flex-row justify-center items-center gap-2`,
            pressed && tw`bg-red-50`,
          ]}
        >
          <Feather name="log-out" size={16} color={(tw.color("red-600") as string)} />
          <Text style={tw`text-red-600 font-bold text-center text-sm`}>
            Encerrar Sessão
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}