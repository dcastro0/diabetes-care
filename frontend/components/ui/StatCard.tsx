import React from "react";
import { Text, View } from "react-native";
import tw from "twrnc";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  subtitle?: string;
  highlightColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  highlightColor = "text-blue-600",
}) => {
  return (
    <View style={tw`bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex-1`}>
      <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-1`}>
        {label}
      </Text>
      <View style={tw`flex-row items-baseline gap-1`}>
        <Text style={[tw`text-2xl font-black`, tw`${highlightColor}`]}>
          {value}
        </Text>
        {unit ? (
          <Text style={tw`text-xs font-semibold text-slate-400`}>{unit}</Text>
        ) : null}
      </View>
      {subtitle ? (
        <Text style={tw`text-xs font-medium text-slate-400 mt-1`}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};
