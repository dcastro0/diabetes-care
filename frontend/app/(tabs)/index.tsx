import { GlucoseBadge } from "@/components/ui/GlucoseBadge";
import { GlucoseChartCard } from "@/components/ui/GlucoseChartCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { sendHeartbeat } from "@/services/heartbeat";
import { syncMeasurements } from "@/services/measurementService";
import {
  getMeasurements,
  getUnsyncedMeasurements,
  initMeasurementTable,
  markMeasurementsAsSynced,
  Measurement,
} from "@/services/orm/entities/measurement";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function HomeScreen() {
  const router = useRouter();
  const { authData, updateAuthData } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const nome = authData?.nome ?? "Usuário";
  const diasOfensiva = authData?.streak_count ?? 0;

  const load = useCallback(async () => {
    try {
      await initMeasurementTable();
      const rows = await getMeasurements();
      const sorted = rows.sort((a, b) => (a.date < b.date ? 1 : -1));
      setMeasurements(sorted);
    } catch (err) {
      console.error("Erro ao carregar medições:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const attemptSync = useCallback(async () => {
    if (!authData?.token) return;

    try {
      const unsyncedMeasurements = await getUnsyncedMeasurements();
      if (unsyncedMeasurements.length > 0) {
        await syncMeasurements(authData.token, unsyncedMeasurements);
        const idsToUpdate = unsyncedMeasurements.map((m) => m.id!);
        await markMeasurementsAsSynced(idsToUpdate);
      }
    } catch (error) {
      console.error("(Home) Falha na sincronização:", error);
    }
  }, [authData?.token]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (authData?.token) {
      await attemptSync();
      const heartbeatResponse = await sendHeartbeat(authData.token);
      if (heartbeatResponse) {
        updateAuthData({
          streak_count: heartbeatResponse.streak_count,
          pontos: heartbeatResponse.pontos,
          totalMedicoes: heartbeatResponse.total_medicoes,
        });
      }
    }
    await load();
  }, [load, authData?.token, updateAuthData, attemptSync]);

  const lastThree = measurements.slice(0, 3);
  const ultimaMedicao = measurements.length > 0 ? measurements[0] : null;

  const statusBiologico = useMemo(() => {
    if (!ultimaMedicao) return { text: "Nenhum registro hoje. Sem pressa!", color: "text-slate-500", bg: "bg-slate-100" };
    const val = ultimaMedicao.value;
    if (val < 70) return { text: "Leitura abaixo da meta recomendada", color: "text-amber-700", bg: "bg-amber-50" };
    if (val <= 140) return { text: "Leitura dentro da faixa alvo", color: "text-emerald-700", bg: "bg-emerald-50" };
    if (val <= 180) return { text: "Leitura ligeiramente elevada", color: "text-amber-700", bg: "bg-amber-50" };
    return { text: "Leitura acima da faixa alvo", color: "text-purple-700", bg: "bg-purple-50" };
  }, [ultimaMedicao]);

  return (
    <SafeAreaView style={[tw`flex-1`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-6 pt-6`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[(tw.color("blue-600") as string)]}
            tintColor={(tw.color("blue-600") as string)}
          />
        }
      >
        {/* Cabeçalho Acolhedor com Alternador de Tema Sol/Lua */}
        <View style={tw`flex-row justify-between items-center mb-5 mt-2`}>
          <View>
            <Text style={[tw`text-xs font-bold uppercase tracking-widest`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
              Seu Espaço de Saúde
            </Text>
            <Text style={[tw`text-2xl font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
              Olá, {nome}
            </Text>
          </View>

          <View style={tw`flex-row items-center gap-2`}>
            {/* Botão de Alternar Tema Claro/Escuro */}
            <Pressable
              onPress={toggleTheme}
              style={[
                tw`p-2.5 rounded-full border`,
                isDark ? tw`bg-slate-800 border-slate-700` : tw`bg-white border-slate-200/80 shadow-sm`,
              ]}
            >
              <Feather
                name={isDark ? "sun" : "moon"}
                size={18}
                color={isDark ? (tw.color("amber-400") as string) : (tw.color("slate-700") as string)}
              />
            </Pressable>

            {/* Badge de Dias Acompanhados */}
            <View style={tw`flex-row items-center gap-1.5 bg-blue-50 px-3 py-2 rounded-full border border-blue-200`}>
              <Feather name="heart" size={14} color={(tw.color("blue-600") as string)} />
              <Text style={tw`text-xs font-bold text-blue-700`}>
                {diasOfensiva} {diasOfensiva === 1 ? "Dia de Cuidado" : "Dias de Cuidado"}
              </Text>
            </View>
          </View>
        </View>

        {/* Banner Acolhedor do Mascote Glico (Não Impositivo) */}
        <View
          style={[
            tw`rounded-3xl p-4.5 mb-5 border flex-row items-center justify-between shadow-sm`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-blue-50/70 border-blue-200/80`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3.5 flex-1 mr-2`}>
            <Image
              source={require("../../assets/images/glico_mascot.png")}
              style={tw`w-12 h-12 rounded-full border border-blue-300`}
            />
            <View style={tw`flex-1`}>
              <Text style={tw`text-[11px] font-bold text-blue-600 uppercase tracking-wider`}>
                Glico Acompanha
              </Text>
              <Text style={[tw`text-sm font-bold leading-5`, isDark ? tw`text-slate-200` : tw`text-slate-800`]}>
                Sem pressa, no seu tempo. O acompanhamento é para te cuidar, sem julgamentos.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/dicas")}
            style={tw`bg-blue-600 px-3 py-2 rounded-xl flex-row items-center gap-1`}
          >
            <Feather name="book-open" size={14} color="white" />
            <Text style={tw`text-xs font-bold text-white`}>Dicas</Text>
          </Pressable>
        </View>

        {/* Visor Médico Acolhedor */}
        <View style={tw`bg-slate-900 rounded-3xl p-6 shadow-xl mb-4 border border-slate-800`}>
          <View style={tw`flex-row items-center justify-between mb-4 border-b border-slate-800 pb-3`}>
            <View>
              <Text style={tw`text-base font-bold text-white`}>Sua Jornada Hoje</Text>
              <Text style={tw`text-slate-400 text-xs mt-0.5`}>Acompanhamento Diário</Text>
            </View>
            <View style={tw`bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30`}>
              <Text style={tw`text-[10px] font-bold text-blue-300 uppercase tracking-wider`}>Em Acompanhamento</Text>
            </View>
          </View>

          <Text style={tw`text-slate-400 text-xs font-bold uppercase tracking-wider mb-2`}>
            Última Leitura Registrada
          </Text>

          {loading && !refreshing ? (
            <View style={tw`py-6 items-center`}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : ultimaMedicao ? (
            <View style={tw`mb-6`}>
              <View style={tw`flex-row items-baseline gap-2 mb-2`}>
                <Text style={tw`text-white text-5xl font-black`}>
                  {ultimaMedicao.value}
                </Text>
                <Text style={tw`text-slate-400 text-lg font-bold`}>mg/dL</Text>
              </View>

              <View style={tw`flex-row items-center justify-between`}>
                <Text style={tw`text-slate-400 text-xs`}>
                  {new Date(ultimaMedicao.date).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <GlucoseBadge value={ultimaMedicao.value} size="sm" />
              </View>
            </View>
          ) : (
            <View style={tw`mb-6`}>
              <Text style={tw`text-white text-xl font-semibold mb-1`}>Você ainda não registrou hoje</Text>
              <Text style={tw`text-slate-400 text-xs`}>Quando se sentir à vontade, adicione sua medição aqui.</Text>
            </View>
          )}

          <Pressable
            onPress={() => router.push("/(tabs)/medir")}
            style={({ pressed }) => [
              tw`bg-blue-600 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm`,
              pressed && tw`bg-blue-700 opacity-90`,
            ]}
          >
            <Feather name="plus-circle" size={18} color="white" />
            <Text style={tw`text-white text-center text-sm font-bold`}>
              Adicionar Nova Leitura
            </Text>
          </Pressable>
        </View>

        {/* Card de Status Biológico Gentil */}
        <View
          style={[
            tw`rounded-3xl p-4 border shadow-sm mb-6 flex-row items-center justify-between`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3`}>
            <View style={tw`${statusBiologico.bg} p-2.5 rounded-2xl`}>
              <Feather name="activity" size={18} color={(tw.color("blue-600") as string)} />
            </View>
            <View>
              <Text style={[tw`text-xs font-bold uppercase tracking-wider`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                Estado da Última Leitura
              </Text>
              <Text style={tw`text-sm font-bold ${statusBiologico.color}`}>
                {statusBiologico.text}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={(tw.color("slate-400") as string)} />
        </View>

        {/* Módulo 1: Card de Tendência Clínica e Estatísticas eA1c / TIR */}
        <GlucoseChartCard measurements={measurements} />

        {/* Histórico Recente */}
        <View style={tw`mt-2`}>
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={[tw`text-base font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>Histórico Recente</Text>
            <Pressable onPress={() => router.push("/historico")}>
              <Text style={tw`text-xs font-bold text-blue-600`}>Ver completo</Text>
            </Pressable>
          </View>

          <View
            style={[
              tw`rounded-3xl border shadow-sm overflow-hidden mb-6`,
              isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
            ]}
          >
            {loading && !refreshing ? (
              <View style={tw`py-6 items-center`}>
                <ActivityIndicator size="small" color={(tw.color("blue-600") as string)} />
              </View>
            ) : lastThree.length === 0 ? (
              <Text style={tw`text-slate-400 text-sm py-6 text-center`}>
                Nenhuma medição salva localmente.
              </Text>
            ) : (
              lastThree.map((medicao, index) => (
                <Pressable
                  key={medicao.id ?? index}
                  onPress={() => router.push("/historico")}
                  style={({ pressed }) => [
                    tw`flex-row justify-between items-center p-4`,
                    pressed && (isDark ? tw`bg-slate-800` : tw`bg-slate-50`),
                    index < lastThree.length - 1 && (isDark ? tw`border-b border-slate-800` : tw`border-b border-slate-100`),
                  ]}
                >
                  <View style={tw`flex-row items-center gap-3`}>
                    <View style={tw`bg-blue-500/10 p-2.5 rounded-2xl`}>
                      <Feather name="droplet" size={16} color={(tw.color("blue-600") as string)} />
                    </View>
                    <View>
                      <Text style={[tw`text-base font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
                        {medicao.value} mg/dL
                      </Text>
                      <Text style={tw`text-xs text-slate-400`}>
                        {new Date(medicao.date).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                  <GlucoseBadge value={medicao.value} size="sm" />
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}