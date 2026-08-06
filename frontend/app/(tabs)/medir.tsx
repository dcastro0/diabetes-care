import { ContextChip } from "@/components/ui/ContextChip";
import { GlucoseBadge } from "@/components/ui/GlucoseBadge";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Achievement } from "@/services/achievementsServices";
import { syncMeasurements } from "@/services/measurementService";
import {
  getUnsyncedMeasurements,
  markMeasurementsAsSynced,
  saveMeasurement,
} from "@/services/orm/entities/measurement";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function MedirScreen() {
  const router = useRouter();
  const { authData } = useAuth();
  const { isDark } = useTheme();

  const [valor, setValor] = useState("100");
  const [tagSelecionada, setTagSelecionada] = useState<string | null>("Em jejum");
  const [modalVisivel, setModalVisivel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unlockedReward, setUnlockedReward] = useState<Achievement | null>(null);

  const tags = ["Em jejum", "Pós-refeição", "Ao acordar", "Antes de dormir", "Exercício"];

  const numValor = useMemo(() => {
    const raw = valor.trim().replace(",", ".");
    const parsed = parseFloat(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }, [valor]);

  const handleStep = (delta: number) => {
    const current = numValor ?? 100;
    const next = Math.max(20, Math.min(600, current + delta));
    setValor(next.toString());
  };

  const attemptSync = async () => {
    if (!authData?.token) return null;

    try {
      const unsyncedMeasurements = await getUnsyncedMeasurements();
      if (unsyncedMeasurements.length === 0) return null;

      const response = await syncMeasurements(authData.token, unsyncedMeasurements);

      const idsToUpdate = unsyncedMeasurements.map((m) => m.id!);
      await markMeasurementsAsSynced(idsToUpdate);

      if (response.unlocked_achievements && response.unlocked_achievements.length > 0) {
        return response.unlocked_achievements[0];
      }
    } catch (error) {
      console.error("Falha na sincronização em background:", error);
    }
    return null;
  };

  const handleSalvar = async () => {
    if (!numValor) {
      Alert.alert("Valor inválido", "Informe um número válido para a medição.");
      return;
    }

    setSaving(true);
    setUnlockedReward(null);

    try {
      const iso = new Date().toISOString();
      await saveMeasurement(numValor, iso, tagSelecionada ?? null);

      const reward = await attemptSync();
      if (reward) {
        setUnlockedReward(reward);
      }

      setModalVisivel(true);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível salvar a medição. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleFecharModal = () => {
    setModalVisivel(false);
    setValor("100");
    setTagSelecionada("Em jejum");
    router.push("/");
  };

  return (
    <SafeAreaView style={[tw`flex-1`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
      <ScrollView contentContainerStyle={tw`p-6 flex-grow justify-between`}>
        <View>
          {/* Cabeçalho */}
          <View style={tw`mb-6 items-center mt-2`}>
            <Text style={[tw`text-xs font-bold uppercase tracking-widest`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
              Novo Registro
            </Text>
            <Text style={[tw`text-2xl font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
              Adicionar Medição
            </Text>
          </View>

          {/* Visor Médico Digital (Medical LCD/OLED Display) */}
          <View style={tw`bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl mb-6 items-center`}>
            <View style={tw`flex-row items-center gap-2 mb-3 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700`}>
              <View style={tw`w-2 h-2 rounded-full bg-emerald-400`} />
              <Text style={tw`text-slate-300 text-xs font-semibold uppercase tracking-wider`}>
                Visor Digital de Glicemia
              </Text>
            </View>

            {/* Input Central com Grande Tipografia */}
            <View style={tw`flex-row items-baseline my-2 justify-center`}>
              <TextInput
                style={tw`text-6xl font-black text-white text-center min-w-[140px]`}
                placeholder="100"
                placeholderTextColor={(tw.color("slate-600") as string)}
                keyboardType="numeric"
                value={valor}
                onChangeText={setValor}
              />
              <Text style={tw`text-lg font-bold text-slate-400 ml-2`}>mg/dL</Text>
            </View>

            {/* Classificação com Badge */}
            <View style={tw`mt-2 mb-4`}>
              {numValor !== null ? (
                <GlucoseBadge value={numValor} size="md" />
              ) : (
                <Text style={tw`text-xs text-slate-500`}>Digite o valor para visualizar o status</Text>
              )}
            </View>

            {/* Botões Rápidos de Incremento com o Polegar */}
            <View style={tw`flex-row justify-between w-full pt-4 border-t border-slate-800 gap-2`}>
              {[
                { label: "-10", val: -10 },
                { label: "-5", val: -5 },
                { label: "+5", val: 5 },
                { label: "+10", val: 10 },
              ].map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => handleStep(item.val)}
                  style={({ pressed }) => [
                    tw`flex-1 bg-slate-800/90 py-2.5 rounded-xl items-center border border-slate-700`,
                    pressed && tw`bg-slate-700`,
                  ]}
                >
                  <Text style={tw`text-white font-bold text-sm`}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Contexto da Medição */}
          <View style={tw`mb-6`}>
            <Text style={[tw`text-xs font-bold mb-3 uppercase tracking-wider`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
              Momento do Registro
            </Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {tags.map((tag) => (
                <ContextChip
                  key={tag}
                  label={tag}
                  selected={tagSelecionada === tag}
                  onPress={() =>
                    setTagSelecionada(tagSelecionada === tag ? null : tag)
                  }
                />
              ))}
            </View>
          </View>
        </View>

        {/* Botão de Gravação */}
        <View style={tw`pt-4 mb-2`}>
          <Pressable
            onPress={handleSalvar}
            disabled={!valor.trim() || saving}
            style={({ pressed }) => [
              tw`bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-blue-200`,
              pressed && tw`bg-blue-700 opacity-90`,
              (!valor.trim() || saving) && tw`bg-slate-300 shadow-none`,
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Feather name="check-circle" size={20} color="white" />
                <Text style={tw`text-white text-center text-base font-bold`}>
                  Salvar Leitura
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal de Sucesso */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={handleFecharModal}
      >
        <View style={tw`flex-1 justify-center items-center bg-slate-900/70 p-6`}>
          <View style={[tw`w-full max-w-sm rounded-3xl p-6 items-center shadow-xl border`, isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-100`]}>
            <View style={tw`bg-emerald-100 p-4 rounded-full mb-4`}>
              <Feather name="check" size={32} color={(tw.color("emerald-600") as string)} />
            </View>
            <Text style={[tw`text-xl font-bold mb-1`, isDark ? tw`text-white` : tw`text-slate-800`]}>Medição Salva</Text>
            <Text style={[tw`text-sm text-center mb-6`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
              Registro clínico adicionado ao seu histórico com sucesso.
            </Text>

            {unlockedReward ? (
              <View style={tw`bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 w-full items-center`}>
                <View style={tw`flex-row items-center gap-1.5 mb-1`}>
                  <Feather name="award" size={16} color={(tw.color("blue-600") as string)} />
                  <Text style={tw`text-xs font-bold text-blue-700 uppercase tracking-wider`}>
                    Conquista Clínica Desbloqueada
                  </Text>
                </View>
                <Text style={tw`text-base font-bold text-slate-800 text-center`}>
                  {unlockedReward.title}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleFecharModal}
              style={({ pressed }) => [
                tw`bg-blue-600 w-full py-3.5 rounded-2xl`,
                pressed && tw`bg-blue-700`,
              ]}
            >
              <Text style={tw`text-white text-center font-bold text-sm`}>Voltar ao Painel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}