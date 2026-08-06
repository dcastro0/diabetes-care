import { GlucoseBadge } from "@/components/ui/GlucoseBadge";
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
import React, { useCallback, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const nome = authData?.nome ?? "Usuário";
  const pontosTotais = authData?.pontos ?? 0;
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

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
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
        {/* Cabeçalho */}
        <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
          <View>
            <Text style={tw`text-sm font-semibold text-slate-400 uppercase tracking-wider`}>
              Painel Clínico
            </Text>
            <Text style={tw`text-2xl font-bold text-slate-800`}>
              {nome}
            </Text>
          </View>

          {/* Badge de Sequência Clínica (Sem Emojis) */}
          <View style={tw`flex-row items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200`}>
            <Feather name="shield" size={14} color={(tw.color("blue-600") as string)} />
            <Text style={tw`text-xs font-bold text-blue-700`}>
              {diasOfensiva} {diasOfensiva === 1 ? "Dia Ativo" : "Dias Ativos"}
            </Text>
          </View>
        </View>

        {/* Card Principal - Controle Diário */}
        <View style={tw`bg-slate-900 rounded-3xl p-6 shadow-xl mb-6`}>
          <View style={tw`flex-row items-start justify-between mb-4`}>
            <View>
              <Text style={tw`text-lg font-bold text-white`}>Controle Diário</Text>
              <Text style={tw`text-slate-400 text-xs mt-0.5`}>Monitoramento Contínuo</Text>
            </View>
            <View style={tw`flex-row items-center gap-1.5 bg-slate-800 rounded-full px-3 py-1 border border-slate-700`}>
              <Feather name="zap" size={14} color={(tw.color("amber-400") as string)} />
              <Text style={tw`text-white font-bold text-xs`}>{pontosTotais} pts</Text>
            </View>
          </View>

          <Text style={tw`text-slate-400 text-xs uppercase tracking-wider mb-2`}>
            Última Medição
          </Text>

          {loading && !refreshing ? (
            <View style={tw`py-6 items-center`}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : ultimaMedicao ? (
            <View style={tw`mb-6`}>
              <View style={tw`flex-row items-baseline gap-2 mb-2`}>
                <Text style={tw`text-white text-4xl font-black`}>
                  {ultimaMedicao.value}
                </Text>
                <Text style={tw`text-slate-400 text-base font-semibold`}>mg/dL</Text>
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
              <Text style={tw`text-white text-xl font-semibold mb-1`}>Nenhum registro hoje</Text>
              <Text style={tw`text-slate-400 text-xs`}>Registre sua medição para manter o histórico atualizado.</Text>
            </View>
          )}

          <Pressable
            onPress={() => router.push("/(tabs)/medir")}
            style={({ pressed }) => [
              tw`bg-blue-600 py-3.5 rounded-2xl flex-row items-center justify-center gap-2`,
              pressed && tw`bg-blue-700 opacity-90`,
            ]}
          >
            <Feather name="plus-circle" size={18} color="white" />
            <Text style={tw`text-white text-center text-sm font-bold`}>
              Registrar Nova Medição
            </Text>
          </Pressable>
        </View>

        {/* Módulos Rápidos */}
        <View style={tw`flex-row gap-4 mb-6`}>
          <View style={tw`flex-1 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm justify-between`}>
            <View style={tw`bg-blue-50 p-2.5 rounded-2xl w-10 h-10 items-center justify-center mb-3`}>
              <Feather name="activity" size={20} color={(tw.color("blue-600") as string)} />
            </View>
            <View>
              <Text style={tw`text-xl font-bold text-slate-800`}>{diasOfensiva} Dias</Text>
              <Text style={tw`text-xs font-semibold text-slate-400 uppercase`}>Frequência Diária</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/(tabs)/achievements")}
            style={({ pressed }) => [
              tw`flex-1 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm justify-between`,
              pressed && tw`bg-slate-50`,
            ]}
          >
            <View style={tw`bg-amber-50 p-2.5 rounded-2xl w-10 h-10 items-center justify-center mb-3`}>
              <Feather name="award" size={20} color={(tw.color("amber-600") as string)} />
            </View>
            <View>
              <Text style={tw`text-xl font-bold text-slate-800`}>Metas</Text>
              <Text style={tw`text-xs font-semibold text-slate-400 uppercase`}>Ver Conquistas</Text>
            </View>
          </Pressable>
        </View>

        {/* Histórico Recente */}
        <View>
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={tw`text-base font-bold text-slate-800`}>Histórico Recente</Text>
            <Pressable onPress={() => router.push("/historico")}>
              <Text style={tw`text-xs font-bold text-blue-600`}>Ver tudo</Text>
            </Pressable>
          </View>

          <View style={tw`bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden`}>
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
                    pressed && tw`bg-slate-50`,
                    index < lastThree.length - 1 && tw`border-b border-slate-100`,
                  ]}
                >
                  <View style={tw`flex-row items-center gap-3`}>
                    <View style={tw`bg-slate-100 p-2.5 rounded-2xl`}>
                      <Feather name="droplet" size={16} color={(tw.color("slate-600") as string)} />
                    </View>
                    <View>
                      <Text style={tw`text-base font-bold text-slate-800`}>
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