import { GlicoBubbleCard } from "@/components/ui/GlicoBubbleCard";
import { GlucoseBadge } from "@/components/ui/GlucoseBadge";
import { GlucoseChartCard } from "@/components/ui/GlucoseChartCard";
import { HeroGlucoseRing } from "@/components/ui/HeroGlucoseRing";
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
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const nome = authData?.nome ?? "Paciente";
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

  const dynamicGlicoMessage = useMemo(() => {
    if (!ultimaMedicao) {
      return "Seja bem-vindo(a)! Adicione sua primeira leitura quando se sentir à vontade. Vamos juntos!";
    }
    const val = ultimaMedicao.value;
    if (val < 70) {
      return "Sua última leitura esteve abaixo da meta. Que tal beber um suco ou ingerir algo com carboidrato rápido?";
    }
    if (val <= 140) {
      return "Excelente! Suas medições recentes estão perfeitamente na meta recomendada. Continue no seu ritmo!";
    }
    if (val <= 180) {
      return "Sua leitura esteve ligeiramente acima. Lembre-se de beber bastante água e manter a caminhada em dia.";
    }
    return "Sua leitura esteve um pouco mais alta. Mantenha a hidratação e siga as orientações do seu médico.";
  }, [ultimaMedicao]);

  return (
    <SafeAreaView style={[tw`flex-1`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]} edges={["top", "left", "right"]}>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-5 pb-24`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[(tw.color("blue-600") as string)]}
            tintColor={(tw.color("blue-600") as string)}
          />
        }
      >
        {/* Cabeçalho Acolhedor */}
        <View style={tw`flex-row justify-between items-center mb-2 mt-1`}>
          <View>
            <Text style={[tw`text-[11px] font-bold uppercase tracking-widest`, isDark ? tw`text-slate-400` : tw`text-slate-400`]}>
              Seu Espaço de Saúde
            </Text>
            <Text style={[tw`text-2xl font-black tracking-tight`, isDark ? tw`text-white` : tw`text-slate-900`]}>
              Olá, {nome}
            </Text>
          </View>

          {/* Badge de Dias Acompanhados */}
          <View style={tw`flex-row items-center gap-1.5 bg-blue-50 px-3.5 py-2 rounded-full border border-blue-200 shadow-sm`}>
            <Feather name="heart" size={14} color={(tw.color("blue-600") as string)} />
            <Text style={tw`text-xs font-bold text-blue-700`}>
              {diasOfensiva} {diasOfensiva === 1 ? "Dia Ativo" : "Dias Ativos"}
            </Text>
          </View>
        </View>

        {/* HERO RING BIOLÓGICO CENTRAL (Círculo de Alvo Clínico) */}
        <HeroGlucoseRing
          value={ultimaMedicao ? ultimaMedicao.value : null}
          dateStr={ultimaMedicao ? ultimaMedicao.date : null}
        />

        {/* PÍLULAS DE AÇÕES RÁPIDAS (Quick Actions Pill) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`py-2 mb-2 gap-2.5`}
        >
          <Pressable
            onPress={() => router.push("/(tabs)/medir")}
            style={({ pressed }) => [
              tw`flex-row items-center gap-2 bg-blue-600 px-4 py-2.5 rounded-full shadow-md shadow-blue-200`,
              pressed && tw`bg-blue-700`,
            ]}
          >
            <Feather name="plus-circle" size={16} color="white" />
            <Text style={tw`text-xs font-bold text-white`}>+ Nova Glicemia</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/historico")}
            style={({ pressed }) => [
              tw`flex-row items-center gap-2 px-4 py-2.5 rounded-full border shadow-sm`,
              isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
              pressed && (isDark ? tw`bg-slate-800` : tw`bg-slate-100`),
            ]}
          >
            <Feather name="file-text" size={16} color={(tw.color("blue-600") as string)} />
            <Text style={[tw`text-xs font-bold`, isDark ? tw`text-white` : tw`text-slate-700`]}>Histórico & PDF</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/lembretes")}
            style={({ pressed }) => [
              tw`flex-row items-center gap-2 px-4 py-2.5 rounded-full border shadow-sm`,
              isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
              pressed && (isDark ? tw`bg-slate-800` : tw`bg-slate-100`),
            ]}
          >
            <Feather name="clock" size={16} color={(tw.color("blue-600") as string)} />
            <Text style={[tw`text-xs font-bold`, isDark ? tw`text-white` : tw`text-slate-700`]}>Lembretes</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/dicas")}
            style={({ pressed }) => [
              tw`flex-row items-center gap-2 px-4 py-2.5 rounded-full border shadow-sm`,
              isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
              pressed && (isDark ? tw`bg-slate-800` : tw`bg-slate-100`),
            ]}
          >
            <Feather name="book-open" size={16} color={(tw.color("blue-600") as string)} />
            <Text style={[tw`text-xs font-bold`, isDark ? tw`text-white` : tw`text-slate-700`]}>Dicas de Saúde</Text>
          </Pressable>
        </ScrollView>

        {/* BALÃO FLUTUANTE DO MASCOTE GLICO (Speech Bubble) */}
        <GlicoBubbleCard message={dynamicGlicoMessage} />

        {/* GRÁFICO E TENDÊNCIAS CLÍNICAS (eA1c / TIR) */}
        <View style={tw`my-2`}>
          <GlucoseChartCard measurements={measurements} />
        </View>

        {/* HISTÓRICO RECENTE EM CARTÕES CERÂMICOS */}
        <View style={tw`mt-3`}>
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={[tw`text-base font-bold`, isDark ? tw`text-white` : tw`text-slate-900`]}>
              Histórico Recente
            </Text>
            <Pressable onPress={() => router.push("/historico")}>
              <Text style={tw`text-xs font-bold text-blue-600`}>Ver completo →</Text>
            </Pressable>
          </View>

          <View
            style={[
              tw`rounded-3xl border shadow-sm overflow-hidden mb-4`,
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
                    <View style={isDark ? tw`bg-blue-500/20 p-2.5 rounded-2xl` : tw`bg-blue-50 p-2.5 rounded-2xl`}>
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