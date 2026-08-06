import { useTheme } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import tw from "twrnc";

interface HeroGlucoseRingProps {
  value: number | null;
  dateStr?: string | null;
}

export const HeroGlucoseRing: React.FC<HeroGlucoseRingProps> = ({ value, dateStr }) => {
  const { isDark } = useTheme();

  const status = useMemo(() => {
    if (value === null) {
      return {
        label: "Sem Registro Hoje",
        sub: "Sua saúde no seu tempo",
        ringColor: "border-slate-300",
        glowBg: isDark ? "bg-slate-800/40" : "bg-slate-100",
        textColor: "text-slate-400",
        badgeBg: "bg-slate-200/80 text-slate-700",
      };
    }
    if (value < 70) {
      return {
        label: "Abaixo da Meta Recomendada",
        sub: "Leitura registrada",
        ringColor: "border-amber-400",
        glowBg: isDark ? "bg-amber-950/40" : "bg-amber-50/80",
        textColor: "text-amber-500",
        badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
      };
    }
    if (value <= 140) {
      return {
        label: "Dentro da Faixa Alvo",
        sub: "Excelente controle",
        ringColor: "border-emerald-500",
        glowBg: isDark ? "bg-emerald-950/40" : "bg-emerald-50/80",
        textColor: "text-emerald-500",
        badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    }
    if (value <= 180) {
      return {
        label: "Ligeiramente Elevada",
        sub: "Acompanhamento preventivo",
        ringColor: "border-amber-500",
        glowBg: isDark ? "bg-amber-950/40" : "bg-amber-50/80",
        textColor: "text-amber-500",
        badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
      };
    }
    return {
      label: "Acima da Faixa Alvo",
      sub: "Atenção médica preventiva",
      ringColor: "border-purple-500",
      glowBg: isDark ? "bg-purple-950/40" : "bg-purple-50/80",
      textColor: "text-purple-500",
      badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
    };
  }, [value, isDark]);

  const formattedTime = dateStr
    ? new Date(dateStr).toLocaleString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <View style={tw`items-center my-4`}>
      {/* Outer Glowing Halo Circle */}
      <View
        style={[
          tw`w-56 h-56 rounded-full items-center justify-center border-4 ${status.ringColor} p-3 shadow-lg`,
          tw`${status.glowBg}`,
        ]}
      >
        {/* Inner Ring Body */}
        <View
          style={[
            tw`w-full h-full rounded-full items-center justify-center border shadow-inner p-4`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-100`,
          ]}
        >
          {value !== null ? (
            <>
              <View style={tw`flex-row items-baseline justify-center mb-1`}>
                <Text style={[tw`text-5xl font-black tracking-tight`, isDark ? tw`text-white` : tw`text-slate-900`]}>
                  {value}
                </Text>
                <Text style={tw`text-sm font-bold text-slate-400 ml-1`}>mg/dL</Text>
              </View>

              {/* Status Badge */}
              <View style={tw`px-3 py-1 rounded-full border ${status.badgeBg} my-1`}>
                <Text style={tw`text-[10px] font-bold uppercase tracking-wider text-center`}>
                  {status.label}
                </Text>
              </View>

              {formattedTime ? (
                <View style={tw`flex-row items-center gap-1 mt-1`}>
                  <Feather name="clock" size={11} color={(tw.color("slate-400") as string)} />
                  <Text style={tw`text-[11px] font-medium text-slate-400`}>
                    Hoje às {formattedTime}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <View style={tw`items-center text-center p-2`}>
              <Feather name="activity" size={32} color={(tw.color("slate-400") as string)} style={tw`mb-2`} />
              <Text style={[tw`text-sm font-bold text-center mb-1`, isDark ? tw`text-white` : tw`text-slate-800`]}>
                Sem Leitura
              </Text>
              <Text style={tw`text-xs text-slate-400 text-center leading-4`}>
                Registre sua medição quando puder
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
