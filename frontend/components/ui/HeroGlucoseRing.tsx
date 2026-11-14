import { useGlucoseTarget } from "@/contexts/GlucoseTargetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { UNIVERSAL_GLUCOSE_TARGET } from "@/utils/glucoseLevels";
import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

interface HeroGlucoseRingProps {
  value: number | null;
  dateStr?: string | null;
}

function formatMeasurementDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const timePart = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Hoje às ${timePart}`;
  if (diffDays === 1) return `Ontem às ${timePart}`;
  const datePart = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  return `${datePart} às ${timePart}`;
}

export const HeroGlucoseRing: React.FC<HeroGlucoseRingProps> = ({
  value,
  dateStr,
}) => {
  const { isDark } = useTheme();
  const {
    activeTarget,
    hasCustomTarget,
    isViewingCustom,
    toggleViewMode,
    customTarget,
  } = useGlucoseTarget();

  const status = useMemo(() => {
    if (value === null) {
      return {
        label: "Sem Registro",
        sub: "Sua saúde no seu tempo",
        ringColor: "border-slate-300",
        glowBg: isDark ? "bg-slate-800/40" : "bg-slate-100",
        textColor: "text-slate-400",
        badgeBg: "bg-slate-200/80 text-slate-700",
      };
    }
    if (value < activeTarget.min) {
      return {
        label: "Abaixo da Meta",
        sub: "Leitura registrada",
        ringColor: "border-amber-400",
        glowBg: isDark ? "bg-amber-950/40" : "bg-amber-50/80",
        textColor: "text-amber-500",
        badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
      };
    }
    if (value <= activeTarget.max) {
      return {
        label: "Dentro da Faixa Alvo",
        sub: "Excelente controle",
        ringColor: "border-emerald-500",
        glowBg: isDark ? "bg-emerald-950/40" : "bg-emerald-50/80",
        textColor: "text-emerald-500",
        badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    }
    if (value <= activeTarget.max + 40) {
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
  }, [value, isDark, activeTarget]);

  const formattedDate = useMemo(
    () => formatMeasurementDate(dateStr),
    [dateStr],
  );

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
            isDark
              ? tw`bg-slate-900 border-slate-800`
              : tw`bg-white border-slate-100`,
          ]}
        >
          {value !== null ? (
            <>
              <View style={tw`flex-row items-baseline justify-center mb-1`}>
                <Text
                  style={[
                    tw`text-5xl font-black tracking-tight`,
                    isDark ? tw`text-white` : tw`text-slate-900`,
                  ]}
                >
                  {value}
                </Text>
                <Text style={tw`text-sm font-bold text-slate-400 ml-1`}>
                  mg/dL
                </Text>
              </View>

              {/* Status Badge */}
              <View
                style={tw`px-3 py-1 rounded-full border ${status.badgeBg} my-1`}
              >
                <Text
                  style={tw`text-[10px] font-bold uppercase tracking-wider text-center`}
                >
                  {status.label}
                </Text>
              </View>

              {formattedDate ? (
                <View style={tw`flex-row items-center gap-1 mt-1`}>
                  <Feather
                    name="clock"
                    size={11}
                    color={tw.color("slate-400") as string}
                  />
                  <Text style={tw`text-[11px] font-medium text-slate-400`}>
                    {formattedDate}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <View style={tw`items-center text-center p-2`}>
              <Feather
                name="activity"
                size={32}
                color={tw.color("slate-400") as string}
                style={tw`mb-2`}
              />
              <Text
                style={[
                  tw`text-sm font-bold text-center mb-1`,
                  isDark ? tw`text-white` : tw`text-slate-800`,
                ]}
              >
                Sem Leitura
              </Text>
              <Text style={tw`text-xs text-slate-400 text-center leading-4`}>
                Registre sua medição quando puder
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Indicador de Meta Ativa e Alternância Rápida */}
      {hasCustomTarget ? (
        <Pressable
          onPress={toggleViewMode}
          style={({ pressed }) => [
            tw`mt-3 flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full border`,
            isViewingCustom
              ? isDark
                ? tw`bg-purple-950/50 border-purple-500/40`
                : tw`bg-purple-50 border-purple-200`
              : isDark
              ? tw`bg-blue-950/50 border-blue-500/40`
              : tw`bg-blue-50 border-blue-200`,
            pressed && tw`opacity-80`,
          ]}
        >
          <Feather
            name={isViewingCustom ? "sliders" : "globe"}
            size={12}
            color={
              isViewingCustom
                ? (tw.color("purple-600") as string)
                : (tw.color("blue-600") as string)
            }
          />
          <Text
            style={[
              tw`text-[11px] font-bold`,
              isViewingCustom ? tw`text-purple-600` : tw`text-blue-600`,
            ]}
          >
            {isViewingCustom
              ? `Meta Personalizada (${activeTarget.min}–${activeTarget.max}) • Ver Padrão (${UNIVERSAL_GLUCOSE_TARGET.min}–${UNIVERSAL_GLUCOSE_TARGET.max})`
              : `Padrão Universal (${UNIVERSAL_GLUCOSE_TARGET.min}–${UNIVERSAL_GLUCOSE_TARGET.max}) • Voltar à Minha Meta (${customTarget?.min}–${customTarget?.max})`}
          </Text>
        </Pressable>
      ) : (
        <Text style={tw`mt-2 text-[11px] font-semibold text-slate-400`}>
          Meta Padrão Universal: {UNIVERSAL_GLUCOSE_TARGET.min}–
          {UNIVERSAL_GLUCOSE_TARGET.max} mg/dL
        </Text>
      )}
    </View>
  );
};
