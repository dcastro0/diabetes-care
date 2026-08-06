import { Measurement } from "@/services/orm/entities/measurement";
import { getGlucoseLevelInfo } from "@/utils/glucoseLevels";
import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";
import { StatCard } from "./StatCard";

interface GlucoseChartCardProps {
  measurements: Measurement[];
}

export const GlucoseChartCard: React.FC<GlucoseChartCardProps> = ({
  measurements,
}) => {
  const [period, setPeriod] = useState<7 | 14 | 30>(7);

  const filteredMeasurements = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);
    return measurements.filter((m) => new Date(m.date) >= cutoff);
  }, [measurements, period]);

  const stats = useMemo(() => {
    if (filteredMeasurements.length === 0) {
      return {
        avg: 0,
        estimatedHbA1c: "—",
        timeInRange: 0,
        min: 0,
        max: 0,
        total: 0,
      };
    }

    const values = filteredMeasurements.map((m) => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / values.length);

    // Formula da HbA1c estimada: (Media + 46.7) / 28.7
    const hba1c = ((avg + 46.7) / 28.7).toFixed(1);

    const inRange = filteredMeasurements.filter(
      (m) => getGlucoseLevelInfo(m.value).level === "bom",
    ).length;
    const tir = Math.round((inRange / filteredMeasurements.length) * 100);

    return {
      avg,
      estimatedHbA1c: `${hba1c}%`,
      timeInRange: tir,
      min: Math.min(...values),
      max: Math.max(...values),
      total: filteredMeasurements.length,
    };
  }, [filteredMeasurements]);

  // Pegar ate as ultimas 7 medicoes para exibir no visualizador de barras
  const recentBars = useMemo(() => {
    return filteredMeasurements.slice(0, 7).reverse();
  }, [filteredMeasurements]);

  const maxBarValue = useMemo(() => {
    if (recentBars.length === 0) return 200;
    const maxVal = Math.max(...recentBars.map((b) => b.value));
    return Math.max(maxVal, 180);
  }, [recentBars]);

  return (
    <View style={tw`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-6`}>
      {/* Topo do Card com Seletor de Periodo */}
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <View style={tw`flex-row items-center gap-2`}>
          <View style={tw`bg-blue-50 p-2 rounded-xl`}>
            <Feather name="trending-up" size={18} color={(tw.color("blue-600") as string)} />
          </View>
          <View>
            <Text style={tw`text-base font-bold text-slate-800`}>Tendência Clínica</Text>
            <Text style={tw`text-xs text-slate-400`}>{stats.total} leituras analisadas</Text>
          </View>
        </View>

        {/* Chips de Filtro (7d, 14d, 30d) */}
        <View style={tw`flex-row bg-slate-100 p-1 rounded-full border border-slate-200`}>
          {([7, 14, 30] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[
                tw`px-2.5 py-1 rounded-full`,
                period === p && tw`bg-white shadow-sm`,
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-bold`,
                  period === p ? tw`text-blue-600` : tw`text-slate-500`,
                ]}
              >
                {p}d
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Visualizacao das Barras de Leitura */}
      <View style={tw`h-36 bg-slate-50 rounded-2xl p-4 mb-4 justify-end border border-slate-100`}>
        {recentBars.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <Text style={tw`text-xs text-slate-400`}>Sem dados para os últimos {period} dias</Text>
          </View>
        ) : (
          <View style={tw`flex-row items-end justify-between h-full pt-4`}>
            {recentBars.map((bar, i) => {
              const heightPercent = Math.min(
                Math.max((bar.value / maxBarValue) * 100, 15),
                100,
              );
              const info = getGlucoseLevelInfo(bar.value);

              let barBg = tw`bg-emerald-500`;
              if (info.level === "atencao") barBg = tw`bg-amber-500`;
              if (info.level === "risco" || info.level === "alto_risco") barBg = tw`bg-rose-500`;

              return (
                <View key={bar.id ?? i} style={tw`items-center flex-1 mx-1 h-full justify-end`}>
                  <Text style={tw`text-[10px] font-bold text-slate-600 mb-1`}>
                    {bar.value}
                  </Text>
                  <View
                    style={[
                      tw`w-full rounded-t-lg`,
                      barBg,
                      { height: `${heightPercent}%` },
                    ]}
                  />
                  <Text style={tw`text-[9px] text-slate-400 mt-1`} numberOfLines={1}>
                    {new Date(bar.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Grid de Cards de Estatisticas Clinicas */}
      <View style={tw`flex-row gap-3`}>
        <StatCard
          label="eA1c Estimada"
          value={stats.estimatedHbA1c}
          subtitle="Meta < 7.0%"
          highlightColor="text-blue-600"
        />
        <StatCard
          label="Tempo na Faixa"
          value={`${stats.timeInRange}%`}
          unit="TIR"
          subtitle="Meta > 70%"
          highlightColor={stats.timeInRange >= 70 ? "text-emerald-600" : "text-amber-600"}
        />
      </View>
    </View>
  );
};
