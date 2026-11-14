import { useGlucoseTarget } from "@/contexts/GlucoseTargetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cancelAllReminders } from "@/services/notificationService";
import { UNIVERSAL_GLUCOSE_TARGET } from "@/utils/glucoseLevels";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function ConfiguracoesScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const queryClient = useQueryClient();
  const {
    customTarget,
    hasCustomTarget,
    saveCustomTarget,
    resetToStandardTarget,
  } = useGlucoseTarget();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet([
      "@DiabetesCare:notificationsEnabled",
      "@DiabetesCare:autoSyncEnabled",
    ])
      .then((pairs) => {
        const notif = pairs[0]?.[1];
        const sync = pairs[1]?.[1];
        if (notif !== null) setNotificationsEnabled(notif === "true");
        if (sync !== null) setAutoSyncEnabled(sync === "true");
      })
      .catch(() => {});
  }, []);

  const handleToggleNotifications = async (val: boolean) => {
    setNotificationsEnabled(val);
    await AsyncStorage.setItem("@DiabetesCare:notificationsEnabled", String(val));
    if (!val) {
      await cancelAllReminders();
    }
  };

  const handleToggleAutoSync = async (val: boolean) => {
    setAutoSyncEnabled(val);
    await AsyncStorage.setItem("@DiabetesCare:autoSyncEnabled", String(val));
  };
  const [targetMinInput, setTargetMinInput] = useState(
    String(customTarget?.min ?? UNIVERSAL_GLUCOSE_TARGET.min),
  );
  const [targetMaxInput, setTargetMaxInput] = useState(
    String(customTarget?.max ?? UNIVERSAL_GLUCOSE_TARGET.max),
  );

  useEffect(() => {
    setTargetMinInput(String(customTarget?.min ?? UNIVERSAL_GLUCOSE_TARGET.min));
    setTargetMaxInput(String(customTarget?.max ?? UNIVERSAL_GLUCOSE_TARGET.max));
  }, [customTarget]);

  const handleSaveTarget = async () => {
    const min = parseInt(targetMinInput, 10);
    const max = parseInt(targetMaxInput, 10);
    if (isNaN(min) || isNaN(max) || min < 40 || max > 400 || min >= max) {
      Alert.alert(
        "Faixa inválida",
        "Informe valores válidos (mínimo >= 40, máximo <= 400 e mínimo menor que máximo).",
      );
      return;
    }
    await saveCustomTarget(min, max);
    Alert.alert("Meta Atualizada", `Meta personalizada salva: ${min}–${max} mg/dL.`);
  };

  const handleResetTarget = async () => {
    await resetToStandardTarget();
    Alert.alert(
      "Padrão Restaurado",
      `Faixa alvo restaurada para o Padrão Universal (${UNIVERSAL_GLUCOSE_TARGET.min}–${UNIVERSAL_GLUCOSE_TARGET.max} mg/dL).`,
    );
  };

  const isDark = theme === "dark";

  const handleResetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem("@DiabetesCare:hasSeenOnboarding");
      router.push("/onboarding");
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Limpar Cache Local",
      "Deseja limpar os dados temporários em cache? Suas medições salvas não serão apagadas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar Cache",
          onPress: async () => {
            queryClient.clear();
            await AsyncStorage.removeItem("@LastHeartbeat");
            Alert.alert("Cache Limpo", "Cache local liberado com sucesso.");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[tw`flex-1`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
      {/* Cabeçalho */}
      <View
        style={[
          tw`flex-row items-center justify-between p-4 border-b`,
          isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
        ]}
      >
        <Pressable onPress={() => router.back()} style={tw`p-2 rounded-full`}>
          <Feather
            name="arrow-left"
            size={20}
            color={isDark ? (tw.color("slate-200") as string) : (tw.color("slate-700") as string)}
          />
        </Pressable>
        <Text style={[tw`text-lg font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
          Configurações do Sistema
        </Text>
        <View style={tw`w-8`} />
      </View>

      <ScrollView contentContainerStyle={tw`p-6`}>
        {/* Seção Aparência & Tema */}
        <Text style={[tw`text-xs font-bold uppercase tracking-widest mb-3 ml-1`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
          Aparência do Aplicativo
        </Text>

        <View
          style={[
            tw`rounded-3xl p-5 border shadow-sm mb-6`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3 mb-4`}>
            <View style={tw`bg-blue-500/20 p-2.5 rounded-xl`}>
              <Feather name={isDark ? "moon" : "sun"} size={20} color={(tw.color("blue-400") as string)} />
            </View>
            <View>
              <Text style={[tw`text-sm font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
                Tema Visual
              </Text>
              <Text style={[tw`text-xs`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                Escolha o modo de exibição de sua preferência
              </Text>
            </View>
          </View>

          {/* Seleção de Tema Segmentada */}
          <View style={tw`flex-row bg-slate-100 p-1.5 rounded-2xl gap-1 border border-slate-200/60`}>
            {[
              { id: "light", label: "Claro", icon: "sun" },
              { id: "dark", label: "Escuro", icon: "moon" },
              { id: "system", label: "Sistema", icon: "smartphone" },
            ].map((item) => {
              const active = themeMode === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setThemeMode(item.id as any)}
                  style={[
                    tw`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 transition-all`,
                    active ? tw`bg-white shadow-sm border border-slate-200` : tw`bg-transparent`,
                  ]}
                >
                  <Feather
                    name={item.icon as any}
                    size={14}
                    color={active ? (tw.color("blue-600") as string) : (tw.color("slate-500") as string)}
                  />
                  <Text
                    style={[
                      tw`text-xs font-bold`,
                      active ? tw`text-blue-600` : tw`text-slate-600`,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Seção Apresentação & Acolhimento */}
        <Text style={[tw`text-xs font-bold uppercase tracking-widest mb-3 ml-1`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
          Acolhimento & Onboarding
        </Text>

        <View
          style={[
            tw`rounded-3xl border shadow-sm overflow-hidden mb-6`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
          ]}
        >
          <Pressable
            onPress={handleResetOnboarding}
            style={({ pressed }) => [
              tw`flex-row items-center justify-between p-4.5`,
              pressed && (isDark ? tw`bg-slate-800` : tw`bg-slate-50`),
            ]}
          >
            <View style={tw`flex-row items-center gap-3.5`}>
              <View style={tw`bg-blue-500/20 p-2.5 rounded-xl`}>
                <Feather name="smile" size={18} color={(tw.color("blue-400") as string)} />
              </View>
              <View>
                <Text style={[tw`text-sm font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
                  Rever Apresentação do Glico
                </Text>
                <Text style={[tw`text-xs`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                  Refazer o fluxo de acolhimento e seleção de tipo de diabetes
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={(tw.color("slate-400") as string)} />
          </Pressable>
        </View>

        {/* Seção Meta Glicêmica Individual */}
        <Text style={[tw`text-xs font-bold uppercase tracking-widest mb-3 ml-1`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
          Meta Glicêmica Individual
        </Text>

        <View
          style={[
            tw`rounded-3xl p-5 border shadow-sm mb-6`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
          ]}
        >
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center gap-2.5`}>
              <View style={tw`bg-purple-500/20 p-2 rounded-xl`}>
                <Feather name="target" size={18} color={(tw.color("purple-500") as string)} />
              </View>
              <View>
                <Text style={[tw`text-sm font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
                  Faixa Alvo (mg/dL)
                </Text>
                <Text style={[tw`text-xs`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                  {hasCustomTarget
                    ? "Meta personalizada ativa"
                    : `Usando Padrão Universal (${UNIVERSAL_GLUCOSE_TARGET.min}–${UNIVERSAL_GLUCOSE_TARGET.max})`}
                </Text>
              </View>
            </View>
          </View>

          <View style={tw`flex-row gap-3 mb-3`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-[11px] font-bold text-slate-400 uppercase mb-1`}>Mínimo</Text>
              <TextInput
                keyboardType="numeric"
                value={targetMinInput}
                onChangeText={setTargetMinInput}
                style={[
                  tw`px-3.5 py-2.5 rounded-2xl border text-sm font-bold`,
                  isDark ? tw`bg-slate-800 border-slate-700 text-white` : tw`bg-slate-50 border-slate-200 text-slate-800`,
                ]}
              />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-[11px] font-bold text-slate-400 uppercase mb-1`}>Máximo</Text>
              <TextInput
                keyboardType="numeric"
                value={targetMaxInput}
                onChangeText={setTargetMaxInput}
                style={[
                  tw`px-3.5 py-2.5 rounded-2xl border text-sm font-bold`,
                  isDark ? tw`bg-slate-800 border-slate-700 text-white` : tw`bg-slate-50 border-slate-200 text-slate-800`,
                ]}
              />
            </View>
          </View>

          <View style={tw`flex-row gap-2`}>
            <Pressable
              onPress={handleSaveTarget}
              style={({ pressed }) => [
                tw`flex-1 bg-blue-600 py-2.5 rounded-2xl items-center justify-center`,
                pressed && tw`bg-blue-700`,
              ]}
            >
              <Text style={tw`text-white font-bold text-xs`}>Salvar Meta</Text>
            </Pressable>
            {hasCustomTarget && (
              <Pressable
                onPress={handleResetTarget}
                style={({ pressed }) => [
                  tw`px-4 py-2.5 rounded-2xl border items-center justify-center`,
                  isDark ? tw`bg-slate-800 border-slate-700` : tw`bg-slate-100 border-slate-200`,
                  pressed && tw`opacity-80`,
                ]}
              >
                <Text style={[tw`font-bold text-xs`, isDark ? tw`text-slate-300` : tw`text-slate-600`]}>
                  Usar Padrão
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Seção Preferências Médicas */}
        <Text style={[tw`text-xs font-bold uppercase tracking-widest mb-3 ml-1`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
          Preferências Médicas & Notificações
        </Text>

        <View
          style={[
            tw`rounded-3xl border shadow-sm overflow-hidden mb-6`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
          ]}
        >
          <View style={tw`flex-row items-center justify-between p-4 border-b border-slate-100`}>
            <View style={tw`flex-row items-center gap-3.5 flex-1 pr-2`}>
              <View style={tw`bg-blue-500/20 p-2.5 rounded-xl`}>
                <Feather name="bell" size={18} color={(tw.color("blue-400") as string)} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-sm font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
                  Notificações Diárias
                </Text>
                <Text style={[tw`text-xs`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                  Lembretes gentis de acompanhamento
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: tw.color("slate-300"), true: tw.color("blue-600") }}
            />
          </View>

          <View style={tw`flex-row items-center justify-between p-4`}>
            <View style={tw`flex-row items-center gap-3.5 flex-1 pr-2`}>
              <View style={tw`bg-blue-500/20 p-2.5 rounded-xl`}>
                <Feather name="refresh-cw" size={18} color={(tw.color("blue-400") as string)} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-sm font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
                  Sincronização em Nuvem
                </Text>
                <Text style={[tw`text-xs`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                  Backup automático das suas medições
                </Text>
              </View>
            </View>
            <Switch
              value={autoSyncEnabled}
              onValueChange={handleToggleAutoSync}
              trackColor={{ false: tw.color("slate-300"), true: tw.color("blue-600") }}
            />
          </View>
        </View>

        {/* Seção Dados e Armazenamento */}
        <Text style={[tw`text-xs font-bold uppercase tracking-widest mb-3 ml-1`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
          Dados & Manutenção
        </Text>

        <View
          style={[
            tw`rounded-3xl border shadow-sm overflow-hidden mb-6`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
          ]}
        >
          <Pressable
            onPress={handleClearCache}
            style={({ pressed }) => [
              tw`flex-row items-center justify-between p-4`,
              pressed && (isDark ? tw`bg-slate-700` : tw`bg-slate-50`),
            ]}
          >
            <View style={tw`flex-row items-center gap-3.5`}>
              <View style={tw`bg-slate-100 p-2.5 rounded-xl`}>
                <Feather name="trash" size={18} color={(tw.color("slate-700") as string)} />
              </View>
              <View>
                <Text style={[tw`text-sm font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
                  Limpar Cache Local
                </Text>
                <Text style={[tw`text-xs`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                  Liberar espaço de dados temporários
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={(tw.color("slate-400") as string)} />
          </Pressable>
        </View>

        {/* Informações da Versão */}
        <View style={tw`items-center my-6`}>
          <View style={tw`bg-blue-100/60 p-3 rounded-full mb-2`}>
            <Feather name="heart" size={24} color={(tw.color("blue-600") as string)} />
          </View>
          <Text style={[tw`text-sm font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
            Diabetes Care App
          </Text>
          <Text style={[tw`text-xs font-semibold mt-0.5`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
            Versão 1.3.0 • Acolhimento & Saúde
          </Text>
          <Text style={[tw`text-[11px] text-center mt-2 px-6`, isDark ? tw`text-slate-500` : tw`text-slate-400`]}>
            Criado com empatia para o seu acompanhamento glicêmico diário.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}