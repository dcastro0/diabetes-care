import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import tw from "twrnc";

interface GlicoBubbleCardProps {
  message?: string;
}

export const GlicoBubbleCard: React.FC<GlicoBubbleCardProps> = ({
  message = "Estou aqui acompanhando você no seu tempo. O autocuidado é um passo de cada vez!",
}) => {
  const { isDark } = useTheme();

  return (
    <View style={tw`my-3 px-1`}>
      <View style={tw`flex-row items-end gap-3`}>
        {/* Mascote Glico Circular */}
        <Image
          source={require("../../assets/images/glico_mascot.png")}
          style={tw`w-13 h-13 rounded-full border-2 border-blue-400 shadow-md mb-1`}
        />

        {/* Balão de Fala Empático (Organic Speech Bubble) */}
        <View
          style={[
            tw`flex-1 p-4 rounded-3xl rounded-bl-sm border shadow-sm relative`,
            isDark
              ? tw`bg-slate-900 border-slate-800`
              : tw`bg-white border-blue-100`,
          ]}
        >
          <View style={tw`flex-row items-center justify-between mb-1`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <Text style={tw`text-xs font-black text-blue-600 uppercase tracking-wider`}>
                Glico
              </Text>
              <View style={tw`bg-blue-100 px-2 py-0.2 rounded-full`}>
                <Text style={tw`text-[10px] font-bold text-blue-800`}>Acolhimento</Text>
              </View>
            </View>
            <Pressable onPress={() => router.push("/dicas")}>
              <Text style={tw`text-[11px] font-bold text-blue-600`}>Ver Dicas →</Text>
            </Pressable>
          </View>

          <Text style={[tw`text-xs font-semibold leading-5`, isDark ? tw`text-slate-200` : tw`text-slate-700`]}>
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
};
