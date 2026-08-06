import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function ConfiguracoesScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const handleClearCache = () => {
    Alert.alert(
      "Limpar Cache Local",
      "Deseja limpar os arquivos temporários e logs da aplicação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar Cache",
          onPress: () => Alert.alert("Cache Limpo", "Cache local liberado com sucesso."),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Cabeçalho */}
      <View style={tw`flex-row items-center justify-between p-4 border-b border-slate-200/80 bg-white`}>
        <Pressable onPress={() => router.back()} style={tw`p-2 rounded-full`}>
          <Feather name="arrow-left" size={20} color={(tw.color("slate-700") as string)} />
        </Pressable>
        <Text style={tw`text-lg font-bold text-slate-800`}>
          Configurações do Sistema
        </Text>
        <View style={tw`w-8`} />
      </View>

      <ScrollView contentContainerStyle={tw`p-6`}>
        {/* Seção Preferências Médicas */}
        <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1`}>
          Preferências Médicas & Notificações
        </Text>

        <View style={tw`bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-6`}>
          <View style={tw`flex-row items-center justify-between p-4 border-b border-slate-100`}>
            <View style={tw`flex-row items-center gap-3.5 flex-1 pr-2`}>
              <View style={tw`bg-blue-50 p-2.5 rounded-xl`}>
                <Feather name="bell" size={18} color={(tw.color("blue-600") as string)} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-bold text-slate-800`}>Notificações Diárias</Text>
                <Text style={tw`text-xs text-slate-400`}>Lembretes automáticos de medição</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: tw.color("slate-200"), true: tw.color("blue-600") }}
            />
          </View>

          <View style={tw`flex-row items-center justify-between p-4`}>
            <View style={tw`flex-row items-center gap-3.5 flex-1 pr-2`}>
              <View style={tw`bg-blue-50 p-2.5 rounded-xl`}>
                <Feather name="refresh-cw" size={18} color={(tw.color("blue-600") as string)} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-bold text-slate-800`}>Sincronização em Nuvem</Text>
                <Text style={tw`text-xs text-slate-400`}>Enviar medições ao servidor automaticamente</Text>
              </View>
            </View>
            <Switch
              value={autoSyncEnabled}
              onValueChange={setAutoSyncEnabled}
              trackColor={{ false: tw.color("slate-200"), true: tw.color("blue-600") }}
            />
          </View>
        </View>

        {/* Seção Dados e Armazenamento */}
        <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1`}>
          Dados & Manutenção
        </Text>

        <View style={tw`bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-6`}>
          <Pressable
            onPress={handleClearCache}
            style={({ pressed }) => [
              tw`flex-row items-center justify-between p-4`,
              pressed && tw`bg-slate-50`,
            ]}
          >
            <View style={tw`flex-row items-center gap-3.5`}>
              <View style={tw`bg-slate-100 p-2.5 rounded-xl`}>
                <Feather name="trash" size={18} color={(tw.color("slate-700") as string)} />
              </View>
              <View>
                <Text style={tw`text-sm font-bold text-slate-800`}>Limpar Cache Local</Text>
                <Text style={tw`text-xs text-slate-400`}>Liberar espaço de dados temporários</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={(tw.color("slate-400") as string)} />
          </Pressable>
        </View>

        {/* Informações da Versão */}
        <View style={tw`items-center my-6`}>
          <View style={tw`bg-blue-100/60 p-3 rounded-full mb-2`}>
            <Feather name="activity" size={24} color={(tw.color("blue-600") as string)} />
          </View>
          <Text style={tw`text-sm font-bold text-slate-800`}>Diabetes Care App</Text>
          <Text style={tw`text-xs font-semibold text-slate-400 mt-0.5`}>Versão 1.2.0 • Build Clínico Pró</Text>
          <Text style={tw`text-[11px] text-slate-400 text-center mt-2 px-6`}>
            Desenvolvido para monitoramento de glicose e gestão da saúde do paciente.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}