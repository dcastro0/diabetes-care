import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function AjudaScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Não foi possível abrir o link", err));
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Cabeçalho */}
      <View style={tw`flex-row items-center justify-between p-4 border-b border-slate-200/80 bg-white`}>
        <Pressable onPress={() => router.back()} style={tw`p-2 rounded-full`}>
          <Feather name="arrow-left" size={20} color={(tw.color("slate-700") as string)} />
        </Pressable>
        <Text style={tw`text-lg font-bold text-slate-800`}>
          Central de Ajuda & Suporte
        </Text>
        <View style={tw`w-8`} />
      </View>

      <ScrollView contentContainerStyle={tw`p-6`}>
        {/* Seção Sobre */}
        <View style={tw`bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm mb-6`}>
          <Text style={tw`text-base font-bold text-slate-800 mb-2`}>
            Sobre o Diabetes Care
          </Text>
          <Text style={tw`text-sm text-slate-600 leading-6`}>
            O aplicativo Diabetes Care é uma solução clínica moderna projetada para o monitoramento contínuo dos níveis de glicose no sangue, acompanhamento da HbA1c estimada e geração de relatórios para equipe médica.
          </Text>
        </View>

        {/* Seção Como Usar */}
        <View style={tw`bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm mb-6`}>
          <Text style={tw`text-base font-bold text-slate-800 mb-3`}>
            Como Utilizar
          </Text>

          <View style={tw`flex-row gap-3 mb-3.5 items-start`}>
            <View style={tw`bg-blue-50 p-2 rounded-xl mt-0.5`}>
              <Feather name="plus-circle" size={16} color={(tw.color("blue-600") as string)} />
            </View>
            <Text style={tw`text-sm text-slate-600 flex-1 leading-5`}>
              <Text style={tw`font-bold text-slate-800`}>Registrar Glicemia:</Text> Utilize a aba Medir para inserir seu nível de glicose e tags de contexto (jejum, pós-refeição, etc.).
            </Text>
          </View>

          <View style={tw`flex-row gap-3 mb-3.5 items-start`}>
            <View style={tw`bg-blue-50 p-2 rounded-xl mt-0.5`}>
              <Feather name="trending-up" size={16} color={(tw.color("blue-600") as string)} />
            </View>
            <Text style={tw`text-sm text-slate-600 flex-1 leading-5`}>
              <Text style={tw`font-bold text-slate-800`}>Tendências & HbA1c:</Text> Acompanhe a estimativa de Hemoglobina Glicada e o Tempo na Faixa (TIR) diretamente no Painel Clínico.
            </Text>
          </View>

          <View style={tw`flex-row gap-3 mb-3.5 items-start`}>
            <View style={tw`bg-blue-50 p-2 rounded-xl mt-0.5`}>
              <Feather name="award" size={16} color={(tw.color("blue-600") as string)} />
            </View>
            <Text style={tw`text-sm text-slate-600 flex-1 leading-5`}>
              <Text style={tw`font-bold text-slate-800`}>Conquistas Clínicas:</Text> Desbloqueie marcos de acompanhamento conforme mantém a consistência dos seus registros diários.
            </Text>
          </View>

          <View style={tw`flex-row gap-3 items-start`}>
            <View style={tw`bg-blue-50 p-2 rounded-xl mt-0.5`}>
              <Feather name="file-text" size={16} color={(tw.color("blue-600") as string)} />
            </View>
            <Text style={tw`text-sm text-slate-600 flex-1 leading-5`}>
              <Text style={tw`font-bold text-slate-800`}>Relatório PDF:</Text> Visualize e exporte relatórios em formato A4 para apresentar na sua próxima consulta médica.
            </Text>
          </View>
        </View>

        {/* Seção Desenvolvedor */}
        <View style={tw`bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm`}>
          <Text style={tw`text-base font-bold text-slate-800 mb-1`}>
            Desenvolvimento
          </Text>
          <Text style={tw`text-sm text-slate-500 mb-4`}>
            Projeto mantido por Caio Corrêa de Castro.
          </Text>

          <Pressable
            onPress={() => openLink("https://github.com/dcastro0/diabetes-care")}
            style={({ pressed }) => [
              tw`flex-row items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200`,
              pressed && tw`bg-slate-100`,
            ]}
          >
            <View style={tw`flex-row items-center gap-3`}>
              <Feather name="github" size={18} color={(tw.color("slate-800") as string)} />
              <Text style={tw`text-sm text-slate-800 font-bold`}>Repositório GitHub</Text>
            </View>
            <Feather name="external-link" size={16} color={(tw.color("slate-400") as string)} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}