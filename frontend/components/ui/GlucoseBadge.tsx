import { getGlucoseLevelInfo } from "@/utils/glucoseLevels";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import tw from "twrnc";

interface GlucoseBadgeProps {
  value: number;
  size?: "sm" | "md" | "lg";
}

export const GlucoseBadge: React.FC<GlucoseBadgeProps> = ({
  value,
  size = "md",
}) => {
  const levelInfo = getGlucoseLevelInfo(value);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <View
      style={[
        tw`flex-row items-center gap-1.5 rounded-full border`,
        tw`${levelInfo.bgColorClass}`,
        tw`${sizeClasses[size]}`,
        { borderColor: (tw.color(levelInfo.colorClass.replace("text-", "")) as string) || "#94A3B8" },
      ]}
    >
      <Feather
        name="activity"
        size={iconSizes[size]}
        color={(tw.color(levelInfo.colorClass.replace("text-", "")) as string) || "#475569"}
      />
      <Text style={[tw`font-semibold`, tw`${levelInfo.colorClass}`]}>
        {levelInfo.text}
      </Text>
    </View>
  );
};
