import { useGlucoseTarget } from "@/contexts/GlucoseTargetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { UNIVERSAL_GLUCOSE_TARGET } from "@/utils/glucoseLevels";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

interface TargetModeBannerProps {
  compact?: boolean;
  allowCustomizeLink?: boolean;
}

export const TargetModeBanner: React.FC<TargetModeBannerProps> = ({
  compact = false,
  allowCustomizeLink = true,
}) => {
  const { isDark } = useTheme();
  const {
    hasCustomTarget,
    customTarget,
    isViewingCustom,
    toggleViewMode,
    activeTarget,
  } = useGlucoseTarget();

  if (!hasCustomTarget) {
    return (
      <View
        style={[
          tw`flex-row items-center justify-between px-3.5 py-2 rounded-2xl border`,
          compact ? tw`mb-2` : tw`mb-3`,
          isDark
            ? tw`bg-slate-900/80 border-slate-800`
            : tw`bg-slate-100/80 border-slate-200`,
        ]}
      >
        <View style={tw`flex-row items-center gap-2 flex-1`}>
          <Feather
            name="target"
            size={14}
            color={
              isDark
                ? (tw.color("slate-400") as string)
                : (tw.color("slate-600") as string)
            }
          />
          <Text
            style={[
              tw`text-xs font-semibold`,
              isDark ? tw`text-slate-300` : tw`text-slate-600`,
            ]}
          >
            Padrão Universal ({UNIVERSAL_GLUCOSE_TARGET.min}–
            {UNIVERSAL_GLUCOSE_TARGET.max} mg/dL)
          </Text>
        </View>
        {allowCustomizeLink && (
          <Pressable onPress={() => router.push("/config")}>
            <Text style={tw`text-[11px] font-bold text-blue-600`}>
              Personalizar
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        tw`flex-row items-center justify-between px-3.5 py-2.5 rounded-2xl border`,
        compact ? tw`mb-2` : tw`mb-3`,
        isViewingCustom
          ? isDark
            ? tw`bg-purple-950/40 border-purple-500/40`
            : tw`bg-purple-50 border-purple-200`
          : isDark
          ? tw`bg-blue-950/40 border-blue-500/40`
          : tw`bg-blue-50 border-blue-200`,
      ]}
    >
      <View style={tw`flex-row items-center gap-2 flex-1 mr-2`}>
        <Feather
          name={isViewingCustom ? "sliders" : "globe"}
          size={14}
          color={
            isViewingCustom
              ? (tw.color("purple-600") as string)
              : (tw.color("blue-600") as string)
          }
        />
        <View style={tw`flex-1`}>
          <Text
            style={[
              tw`text-[11px] font-extrabold uppercase tracking-wider`,
              isViewingCustom ? tw`text-purple-600` : tw`text-blue-600`,
            ]}
          >
            {isViewingCustom ? "Meta Personalizada" : "Padrão Universal"}
          </Text>
          <Text
            style={[
              tw`text-xs font-semibold`,
              isDark ? tw`text-slate-200` : tw`text-slate-700`,
            ]}
          >
            Faixa ativa: {activeTarget.min}–{activeTarget.max} mg/dL
          </Text>
        </View>
      </View>

      <Pressable
        onPress={toggleViewMode}
        style={({ pressed }) => [
          tw`px-3 py-1.5 rounded-xl border flex-row items-center gap-1`,
          isDark
            ? tw`bg-slate-900 border-slate-700`
            : tw`bg-white border-slate-200 shadow-sm`,
          pressed && tw`opacity-80`,
        ]}
      >
        <Feather
          name="repeat"
          size={12}
          color={
            isDark
              ? (tw.color("slate-200") as string)
              : (tw.color("slate-700") as string)
          }
        />
        <Text
          style={[
            tw`text-[11px] font-bold`,
            isDark ? tw`text-slate-200` : tw`text-slate-700`,
          ]}
        >
          {isViewingCustom
            ? `Ver Padrão (${UNIVERSAL_GLUCOSE_TARGET.min}–${UNIVERSAL_GLUCOSE_TARGET.max})`
            : `Minha Meta (${customTarget?.min}–${customTarget?.max})`}
        </Text>
      </Pressable>
    </View>
  );
};
