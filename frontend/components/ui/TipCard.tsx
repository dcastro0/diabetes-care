import { useTheme } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

export interface TipItem {
  id: string;
  category: "Alimentação" | "Sinais de Alerta" | "Exercício" | "Cuidados";
  title: string;
  summary: string;
  content: string;
  icon: string;
  color: string;
}

interface TipCardProps {
  item: TipItem;
  onPress: (item: TipItem) => void;
}

export const TipCard: React.FC<TipCardProps> = ({ item, onPress }) => {
  const { isDark } = useTheme();

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        tw`rounded-3xl p-5 mb-4 border shadow-sm flex-row items-center justify-between`,
        isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
        pressed && (isDark ? tw`bg-slate-800` : tw`bg-slate-50`),
      ]}
    >
      <View style={tw`flex-row items-center gap-4 flex-1 mr-3`}>
        <View style={tw`${item.color} p-3 rounded-2xl`}>
          <Feather name={item.icon as any} size={22} color={(tw.color("slate-700") as string)} />
        </View>
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center gap-2 mb-1`}>
            <Text style={tw`text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full`}>
              {item.category}
            </Text>
          </View>
          <Text style={[tw`text-base font-bold mb-0.5`, isDark ? tw`text-white` : tw`text-slate-800`]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[tw`text-xs leading-4`, isDark ? tw`text-slate-400` : tw`text-slate-500`]} numberOfLines={2}>
            {item.summary}
          </Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={(tw.color("slate-400") as string)} />
    </Pressable>
  );
};
