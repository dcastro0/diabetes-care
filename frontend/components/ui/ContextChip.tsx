import React from "react";
import { Pressable, Text } from "react-native";
import tw from "twrnc";

interface ContextChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const ContextChip: React.FC<ContextChipProps> = ({
  label,
  selected,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        tw`px-4 py-2.5 rounded-2xl border mr-2.5 mb-2.5`,
        selected
          ? tw`bg-blue-600 border-blue-600 shadow-sm`
          : tw`bg-white border-slate-200`,
        pressed && tw`opacity-80`,
      ]}
    >
      <Text
        style={[
          tw`text-sm font-semibold`,
          selected ? tw`text-white` : tw`text-slate-600`,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};
