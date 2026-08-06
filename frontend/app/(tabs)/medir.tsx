import { ContextChip } from "@/components/ui/ContextChip";
import { GlucoseBadge } from "@/components/ui/GlucoseBadge";
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
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function MedirScreen() {
  const router = useRouter();
  const { authData } = useAuth();
  const [valor, setValor] = useState("");
  const [tagSelecionada, setTagSelecionada] = useState<string | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unlockedReward, setUnlockedReward] = useState<Achievement | null>(null);

  const tags = ["Em jejum", "Pós-refeição", "Ao acordar", "Exercício"];

  const numValor = useMemo(() => {
    const raw = valor.trim().replace(",", ".");
    const parsed = parseFloat(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }, [valor]);

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
    setValor("");
    setTagSelecionada(null);
    router.push("/");
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <View style={tw`flex-1 p-6`}>
        {/* Cabeçalho */}
        <View style={tw`mb-6 mt-2 items-center`}>
          <Text style={tw`text-sm font-semibold text-slate-400 uppercase tracking-wider`}>
            Novo Registro
          </Text>
          <Text style={tw`text-2xl font-bold text-slate-800`}>
            Nível de Glicemia
          </Text>
        </View>

        {/* Card do Input com Feedback Instantâneo de Status */}
        <View style={tw`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-6 items-center`}>
          <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-4`}>
            Valor Medido (mg/dL)
          </Text>

          <View style={tw`flex-row items-baseline mb-4 justify-center`}>
            <TextInput
              style={tw`text-5xl font-black text-slate-900 text-center min-w-[120px]`}
              placeholder="105"
              placeholderTextColor={(tw.color("slate-300") as string)}
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
              autoFocus={true}
            />
            <Text style={tw`text-lg font-bold text-slate-400 ml-2`}>mg/dL</Text>
          </View>

          {numValor !== null ? (
            <GlucoseBadge value={numValor} size="md" />
          ) : (
            <Text style={tw`text-xs text-slate-400`}>Digite o valor para ver a classificação</Text>
          )}
        </View>

        {/* Contexto da Medição */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider`}>
            Momento da Leitura
          </Text>
          <View style={tw`flex-row flex-wrap`}>
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

        {/* Botão Principal */}
        <View style={tw`mt-auto`}>
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
                  Salvar Leitura Clínicas
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Modal de Sucesso sem Emojis */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={handleFecharModal}
      >
        <View style={tw`flex-1 justify-center items-center bg-slate-900/60 p-6`}>
          <View style={tw`bg-white w-full max-w-sm rounded-3xl p-6 items-center shadow-xl`}>
            <View style={tw`bg-emerald-100 p-4 rounded-full mb-4`}>
              <Feather name="check" size={32} color={(tw.color("emerald-600") as string)} />
            </View>
            <Text style={tw`text-xl font-bold text-slate-800 mb-1`}>Medição Salva</Text>
            <Text style={tw`text-slate-500 text-sm text-center mb-6`}>
              Registro clínico adicionado ao seu histórico com sucesso.
            </Text>

            {unlockedReward ? (
              <View style={tw`bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 w-full items-center`}>
                <View style={tw`flex-row items-center gap-1.5 mb-1`}>
                  <Feather name="award" size={16} color={(tw.color("amber-600") as string)} />
                  <Text style={tw`text-xs font-bold text-amber-700 uppercase tracking-wider`}>
                    Meta Concluída
                  </Text>
                </View>
                <Text style={tw`text-base font-bold text-slate-800 text-center`}>
                  {unlockedReward.title}
                </Text>
                <Text style={tw`text-xs font-bold text-amber-600 mt-1`}>
                  +{unlockedReward.points_reward} Pontos
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