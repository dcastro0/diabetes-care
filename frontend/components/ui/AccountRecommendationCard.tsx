import { useTheme } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

interface AccountRecommendationCardProps {
  compact?: boolean;
  title?: string;
  description?: string;
}

export const AccountRecommendationCard: React.FC<
  AccountRecommendationCardProps
> = ({
  compact = false,
  title = "Proteja seu histórico na nuvem",
  description = "Você está usando o modo offline. Crie uma conta gratuita para fazer backup automático das suas medições, desbloquear conquistas e acessar seus dados em qualquer dispositivo.",
}) => {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        tw`rounded-3xl p-5 border shadow-sm`,
        compact ? tw`mb-4` : tw`mb-6`,
        isDark
          ? tw`bg-slate-900 border-blue-500/30`
          : tw`bg-blue-50/70 border-blue-200`,
      ]}
    >
      <View style={tw`flex-row items-start gap-3.5`}>
        <View
          style={
            isDark
              ? tw`bg-blue-500/20 p-2.5 rounded-2xl`
              : tw`bg-blue-100 p-2.5 rounded-2xl`
          }
        >
          <Feather
            name="cloud"
            size={20}
            color={
              isDark
                ? (tw.color("blue-400") as string)
                : (tw.color("blue-600") as string)
            }
          />
        </View>

        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center gap-2 mb-1`}>
            <Text
              style={[
                tw`text-sm font-bold flex-1`,
                isDark ? tw`text-white` : tw`text-slate-800`,
              ]}
            >
              {title}
            </Text>
            <View
              style={
                isDark
                  ? tw`bg-amber-500/20 px-2 py-0.5 rounded-full`
                  : tw`bg-amber-100 px-2 py-0.5 rounded-full`
              }
            >
              <Text
                style={
                  isDark
                    ? tw`text-[10px] font-bold text-amber-300`
                    : tw`text-[10px] font-bold text-amber-800`
                }
              >
                Recomendado
              </Text>
            </View>
          </View>

          <Text
            style={[
              tw`text-xs leading-4.5 mb-3.5`,
              isDark ? tw`text-slate-300` : tw`text-slate-600`,
            ]}
          >
            {description}
          </Text>

          <View style={tw`flex-row gap-2.5`}>
            <Pressable
              onPress={() => router.push("/register")}
              style={({ pressed }) => [
                tw`flex-1 bg-blue-600 py-2.5 px-3 rounded-2xl flex-row items-center justify-center gap-1.5 shadow-sm`,
                pressed && tw`bg-blue-700`,
              ]}
            >
              <Feather name="user-plus" size={14} color="white" />
              <Text style={tw`text-white text-xs font-bold`}>
                Criar Conta Grátis
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/login")}
              style={({ pressed }) => [
                tw`py-2.5 px-3.5 rounded-2xl border items-center justify-center`,
                isDark
                  ? tw`bg-slate-800 border-slate-700`
                  : tw`bg-white border-slate-200`,
                pressed && tw`opacity-80`,
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-bold`,
                  isDark ? tw`text-slate-200` : tw`text-slate-700`,
                ]}
              >
                Entrar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};
