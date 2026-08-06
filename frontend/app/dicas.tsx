import { TipCard, TipItem } from "@/components/ui/TipCard";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

const HEALTH_TIPS: TipItem[] = [
  {
    id: "1",
    category: "Alimentação",
    title: "Entendendo o Índice Glicêmico",
    summary: "Como alimentos de baixo índice glicêmico evitam picos súbitos de glicose no sangue.",
    content: "Alimentos com baixo Índice Glicêmico (IG), como aveia, grãos integrais, leguminosas e vegetais, são digeridos mais lentamente. Isso permite uma liberação gradual da glicose na corrente sanguínea, prevenindo picos glicêmicos indesejados.",
    icon: "pie-chart",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "2",
    category: "Sinais de Alerta",
    title: "Hipoglicemia vs. Hiperglicemia",
    summary: "Reconheça os sintomas e saiba como agir imediatamente em cada caso.",
    content: "Sintomas de Hipoglicemia (< 70 mg/dL): Tontura, suor frio, tremores e palpitações. Regra dos 15: Consuma 15g de carboidrato rápido (ex: 1 colher de açúcar em água) e meça novamente em 15 minutos.\n\nSintomas de Hiperglicemia (> 180 mg/dL): Sede excessiva, visão turva e boca seca. Mantenha-se hidratado e siga a orientação de medicação do seu médico.",
    icon: "alert-triangle",
    color: "bg-amber-100 text-amber-800",
  },
  {
    id: "3",
    category: "Exercício",
    title: "Atividade Física com Segurança",
    summary: "Como a prática regular de exercícios melhora a sensibilidade à insulina.",
    content: "O exercício físico ajuda os músculos a utilizarem a glicose como fonte de energia, reduzindo a resistência à insulina. Dica clínica: Meça a glicemia antes e após o treino. Se estiver abaixo de 100 mg/dL antes do exercício, faça um pequeno lanche rico em carboidratos.",
    icon: "activity",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "4",
    category: "Cuidados",
    title: "A Importância da Hidratação",
    summary: "Por que beber água regularmente ajuda a equilibrar os níveis de açúcar no sangue.",
    content: "A desidratação pode concentrar a glicose no sangue, elevando temporariamente as leituras do glicosímetro. Manter uma ingestão diária de 2 a 3 litros de água auxilia os rins a eliminarem o excesso de glicose na urina.",
    icon: "droplet",
    color: "bg-cyan-100 text-cyan-800",
  },
  {
    id: "5",
    category: "Alimentação",
    title: "Contagem de Carboidratos",
    summary: "Princípios fundamentais para um planejamento alimentar consciente e flexível.",
    content: "A contagem de carboidratos é uma estratégia nutricional em que se soma a quantidade em gramas de carboidrato das refeições. Isso possibilita maior flexibilidade nas escolhas mantendo o controle das metas diárias de glicose.",
    icon: "check-square",
    color: "bg-purple-100 text-purple-800",
  },
];

export default function DicasScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [activeTip, setActiveTip] = useState<TipItem | null>(null);

  const categories = ["Todos", "Alimentação", "Sinais de Alerta", "Exercício", "Cuidados"];

  const filteredTips = useMemo(() => {
    return HEALTH_TIPS.filter((tip) => {
      const matchCat = selectedCategory === "Todos" || tip.category === selectedCategory;
      const matchSearch =
        tip.title.toLowerCase().includes(search.toLowerCase()) ||
        tip.summary.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, selectedCategory]);

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Cabeçalho */}
      <View style={tw`p-4 border-b border-slate-200/80 bg-white`}>
        <View style={tw`flex-row items-center justify-between mb-3`}>
          <Pressable onPress={() => router.back()} style={tw`p-2 rounded-full`}>
            <Feather name="arrow-left" size={20} color={(tw.color("slate-700") as string)} />
          </Pressable>
          <View style={tw`items-center flex-1`}>
            <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest`}>
              Guia Clínico do Paciente
            </Text>
            <Text style={tw`text-lg font-bold text-slate-800`}>
              Dicas & Educação em Saúde
            </Text>
          </View>
          <View style={tw`w-8`} />
        </View>

        {/* Campo de Busca */}
        <View style={tw`flex-row items-center bg-slate-100 px-3.5 py-2.5 rounded-2xl border border-slate-200/80 mb-3`}>
          <Feather name="search" size={18} color={(tw.color("slate-400") as string)} style={tw`mr-2`} />
          <TextInput
            style={tw`flex-1 text-sm font-medium text-slate-800`}
            placeholder="Buscar por alimento, sintomas, exercícios..."
            placeholderTextColor={(tw.color("slate-400") as string)}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x-circle" size={16} color={(tw.color("slate-400") as string)} />
            </Pressable>
          ) : null}
        </View>

        {/* Filtro por Categoria */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-1`}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                tw`px-3.5 py-1.5 rounded-full border mr-2`,
                selectedCategory === cat
                  ? tw`bg-blue-600 border-blue-600`
                  : tw`bg-white border-slate-200`,
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-bold`,
                  selectedCategory === cat ? tw`text-white` : tw`text-slate-600`,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Dicas */}
      <FlatList
        data={filteredTips}
        renderItem={({ item }) => <TipCard item={item} onPress={setActiveTip} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`p-6`}
        ListEmptyComponent={
          <View style={tw`items-center justify-center py-16 bg-white rounded-3xl border border-slate-200/80 p-6`}>
            <Feather name="book-open" size={32} color={(tw.color("slate-300") as string)} style={tw`mb-2`} />
            <Text style={tw`text-sm font-bold text-slate-700`}>Nenhum artigo encontrado</Text>
            <Text style={tw`text-xs text-slate-400 text-center mt-1`}>
              Tente buscar por termos diferentes ou selecione outra categoria.
            </Text>
          </View>
        }
      />

      {/* Modal de Detalhe do Artigo com o Mascote Glico */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeTip !== null}
        onRequestClose={() => setActiveTip(null)}
      >
        <View style={tw`flex-1 justify-end bg-slate-900/60`}>
          <View style={tw`bg-white rounded-t-3xl p-6 max-h-[85%] border-t border-slate-200`}>
            <View style={tw`flex-row justify-between items-start mb-4`}>
              <View style={tw`flex-row items-center gap-3`}>
                <Image
                  source={require("../assets/images/glico_mascot.png")}
                  style={tw`w-12 h-12 rounded-full border border-blue-200`}
                />
                <View>
                  <Text style={tw`text-xs font-bold text-blue-600 uppercase tracking-wider`}>
                    Dica do Glico
                  </Text>
                  <Text style={tw`text-lg font-bold text-slate-800`} numberOfLines={1}>
                    {activeTip?.title}
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => setActiveTip(null)} style={tw`p-2 bg-slate-100 rounded-full`}>
                <Feather name="x" size={20} color={(tw.color("slate-600") as string)} />
              </Pressable>
            </View>

            <ScrollView style={tw`mb-6`}>
              <Text style={tw`text-base text-slate-700 leading-6 font-medium mb-4`}>
                {activeTip?.content}
              </Text>
              <View style={tw`bg-blue-50 border border-blue-200 rounded-2xl p-4 flex-row items-center gap-3`}>
                <Feather name="info" size={20} color={(tw.color("blue-600") as string)} />
                <Text style={tw`text-xs text-blue-800 font-semibold flex-1 leading-4`}>
                  Esta orientação é informativa e não substitui a consulta individual com seu médico endocrinologista ou nutricionista.
                </Text>
              </View>
            </ScrollView>

            <Pressable
              onPress={() => setActiveTip(null)}
              style={({ pressed }) => [
                tw`bg-blue-600 py-3.5 rounded-2xl`,
                pressed && tw`bg-blue-700`,
              ]}
            >
              <Text style={tw`text-white font-bold text-center text-sm`}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
