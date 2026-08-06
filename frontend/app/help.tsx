import { useTheme } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function AjudaScreen() {
  const { isDark } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Não foi possível abrir o link", err));
  };

  return (
    <SafeAreaView style={[tw`flex-1`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
      {/* Cabeçalho */}
      <View
        style={[
          tw`flex-row items-center justify-between p-4 border-b`,
          isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
        ]}
      >
        <Pressable onPress={() => router.back()} style={tw`p-2 rounded-full`}>
          <Feather name="arrow-left" size={20} color={isDark ? (tw.color("slate-200") as string) : (tw.color("slate-700") as string)} />
        </Pressable>
        <Text style={[tw`text-lg font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
          Central de Ajuda & Suporte
        </Text>
        <View style={tw`w-8`} />
      </View>

      <ScrollView contentContainerStyle={tw`p-6`}>
        {/* Seção Sobre */}
        <View
          style={[
            tw`p-5 rounded-3xl border shadow-sm mb-6`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
          ]}
        >
          <Text style={[tw`text-base font-bold mb-2`, isDark ? tw`text-white` : tw`text-slate-800`]}>
            Sobre o Diabetes Care
          </Text>
          <Text style={[tw`text-sm leading-6`, isDark ? tw`text-slate-300` : tw`text-slate-600`]}>
            O aplicativo Diabetes Care é uma solução clínica moderna e empática projetada para o monitoramento contínuo dos níveis de glicose no sangue, acompanhamento da HbA1c estimada e geração de relatórios para sua equipe médica.
          </Text>
        </View>

        {/* Seção Como Usar */}
        <View
          style={[
            tw`p-5 rounded-3xl border shadow-sm mb-6`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
          ]}
        >
          <Text style={[tw`text-base font-bold mb-3`, isDark ? tw`text-white` : tw`text-slate-800`]}>
            Como Utilizar
          </Text>

          <View style={tw`flex-row gap-3 mb-3.5 items-start`}>
            <View style={isDark ? tw`bg-blue-500/20 p-2 rounded-xl mt-0.5` : tw`bg-blue-50 p-2 rounded-xl mt-0.5`}>
              <Feather name="plus-circle" size={16} color={(tw.color("blue-600") as string)} />
            </View>
            <Text style={[tw`text-sm flex-1 leading-5`, isDark ? tw`text-slate-300` : tw`text-slate-600`]}>
              <Text style={isDark ? tw`font-bold text-white` : tw`font-bold text-slate-800`}>Registrar Glicemia:</Text> Utilize a aba Medir para inserir seu nível de glicose no seu ritmo.
            </Text>
          </View>

          <View style={tw`flex-row gap-3 mb-3.5 items-start`}>
            <View style={isDark ? tw`bg-blue-500/20 p-2 rounded-xl mt-0.5` : tw`bg-blue-50 p-2 rounded-xl mt-0.5`}>
              <Feather name="trending-up" size={16} color={(tw.color("blue-600") as string)} />
            </View>
            <Text style={[tw`text-sm flex-1 leading-5`, isDark ? tw`text-slate-300` : tw`text-slate-600`]}>
              <Text style={isDark ? tw`font-bold text-white` : tw`font-bold text-slate-800`}>Tendências & HbA1c:</Text> Acompanhe a estimativa de Hemoglobina Glicada e o Tempo na Faixa (TIR).
            </Text>
          </View>

          <View style={tw`flex-row gap-3 mb-3.5 items-start`}>
            <View style={isDark ? tw`bg-blue-500/20 p-2 rounded-xl mt-0.5` : tw`bg-blue-50 p-2 rounded-xl mt-0.5`}>
              <Feather name="award" size={16} color={(tw.color("blue-600") as string)} />
            </View>
            <Text style={[tw`text-sm flex-1 leading-5`, isDark ? tw`text-slate-300` : tw`text-slate-600`]}>
              <Text style={isDark ? tw`font-bold text-white` : tw`font-bold text-slate-800`}>Conquistas Clínicas:</Text> Desbloqueie marcos de acompanhamento conforme mantém a consistência.
            </Text>
          </View>

          <View style={tw`flex-row gap-3 items-start`}>
            <View style={isDark ? tw`bg-blue-500/20 p-2 rounded-xl mt-0.5` : tw`bg-blue-50 p-2 rounded-xl mt-0.5`}>
              <Feather name="file-text" size={16} color={(tw.color("blue-600") as string)} />
            </View>
            <Text style={[tw`text-sm flex-1 leading-5`, isDark ? tw`text-slate-300` : tw`text-slate-600`]}>
              <Text style={isDark ? tw`font-bold text-white` : tw`font-bold text-slate-800`}>Relatório PDF:</Text> Visualize e exporte relatórios em formato A4 para apresentar na sua próxima consulta.
            </Text>
          </View>
        </View>

        {/* Seção Desenvolvedor */}
        <View
          style={[
            tw`p-5 rounded-3xl border shadow-sm`,
            isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
          ]}
        >
          <Text style={[tw`text-base font-bold mb-1`, isDark ? tw`text-white` : tw`text-slate-800`]}>
            Desenvolvimento
          </Text>
          <Text style={[tw`text-sm mb-4`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
            Projeto mantido por Caio Corrêa de Castro.
          </Text>

          <Pressable
            onPress={() => openLink("https://github.com/dcastro0/diabetes-care")}
            style={({ pressed }) => [
              tw`flex-row items-center justify-between p-3.5 rounded-2xl border`,
              isDark ? tw`bg-slate-800 border-slate-700` : tw`bg-slate-50 border-slate-200`,
              pressed && (isDark ? tw`bg-slate-700` : tw`bg-slate-100`),
            ]}
          >
            <View style={tw`flex-row items-center gap-3`}>
              <Feather name="github" size={18} color={isDark ? "white" : (tw.color("slate-800") as string)} />
              <Text style={[tw`text-sm font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>Repositório GitHub</Text>
            </View>
            <Feather name="external-link" size={16} color={(tw.color("slate-400") as string)} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}