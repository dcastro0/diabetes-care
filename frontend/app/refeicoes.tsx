import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteMealOnServer,
  fetchMealsFromServer,
  syncMeals,
} from "@/services/mealService";
import {
  deleteMeal,
  getMeals,
  getUnsyncedMeals,
  initMealTable,
  markMealsAsSynced,
  Meal,
  saveMeal,
  upsertMealsFromServer,
} from "@/services/orm/entities/meal";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function RefeicoesScreen() {
  const { isDark } = useTheme();
  const { authData } = useAuth();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [carbs, setCarbs] = useState("");
  const [insulin, setInsulin] = useState("");
  const [notes, setNotes] = useState("");

  const loadMeals = useCallback(async () => {
    try {
      await initMealTable();
      if (authData?.token) {
        try {
          const unsynced = await getUnsyncedMeals();
          if (unsynced.length > 0) {
            await syncMeals(authData.token, unsynced);
            const ids = unsynced
              .map((m) => m.id)
              .filter((id): id is number => typeof id === "number");
            await markMealsAsSynced(ids);
          }
          const serverMeals = await fetchMealsFromServer(authData.token);
          await upsertMealsFromServer(serverMeals);
        } catch (err) {
          console.warn("Sincronização de refeições adiada:", err);
        }
      }
      const rows = await getMeals();
      rows.sort(
        (a, b) => new Date(b.eaten_at).getTime() - new Date(a.eaten_at).getTime(),
      );
      setMeals(rows);
    } catch (err) {
      console.error("Erro ao carregar refeições:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authData?.token]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Campo obrigatório", "Informe o nome da refeição (ex.: Almoço).");
      return;
    }

    const carbsNum = carbs.trim() ? parseFloat(carbs.replace(",", ".")) : 0;
    const insulinNum = insulin.trim()
      ? parseFloat(insulin.replace(",", "."))
      : 0;

    if (
      isNaN(carbsNum) ||
      carbsNum < 0 ||
      isNaN(insulinNum) ||
      insulinNum < 0
    ) {
      Alert.alert(
        "Valores inválidos",
        "Carboidratos e insulina devem ser números válidos maiores ou iguais a zero.",
      );
      return;
    }

    setSaving(true);
    try {
      await initMealTable();
      await saveMeal(
        trimmedName,
        carbsNum,
        insulinNum,
        new Date().toISOString(),
        notes.trim() || null,
      );

      setName("");
      setCarbs("");
      setInsulin("");
      setNotes("");

      await loadMeals();
      Alert.alert("Refeição Registrada", "Seus dados de alimentação e insulina foram salvos.");
    } catch (err) {
      console.error("Erro ao salvar refeição:", err);
      Alert.alert("Erro", "Não foi possível salvar a refeição.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Meal) => {
    if (item.id === undefined) return;
    Alert.alert("Excluir Refeição", `Deseja remover "${item.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          await deleteMeal(item.id!);
          if (authData?.token && item.server_id) {
            deleteMealOnServer(authData.token, item.server_id).catch((err) =>
              console.warn("Falha ao remover refeição no servidor:", err),
            );
          }
          setMeals((prev) => prev.filter((m) => m.id !== item.id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[tw`flex-1`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}
    >
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Cabeçalho */}
        <View
          style={[
            tw`flex-row items-center justify-between p-4 border-b`,
            isDark
              ? tw`bg-slate-900 border-slate-800`
              : tw`bg-white border-slate-200/80`,
          ]}
        >
          <Pressable onPress={() => router.back()} style={tw`p-2 rounded-full`}>
            <Feather
              name="arrow-left"
              size={20}
              color={
                isDark
                  ? (tw.color("slate-200") as string)
                  : (tw.color("slate-700") as string)
              }
            />
          </Pressable>
          <Text
            style={[
              tw`text-lg font-bold`,
              isDark ? tw`text-white` : tw`text-slate-800`,
            ]}
          >
            Refeições & Insulina
          </Text>
          <View style={tw`w-8`} />
        </View>

        <FlatList
          data={meals}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          contentContainerStyle={tw`p-5 pb-16`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadMeals();
              }}
              colors={[tw.color("blue-600") as string]}
            />
          }
          ListHeaderComponent={
            <View
              style={[
                tw`rounded-3xl p-5 border shadow-sm mb-6`,
                isDark
                  ? tw`bg-slate-900 border-slate-800`
                  : tw`bg-white border-slate-200/80`,
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-bold uppercase tracking-wider mb-3`,
                  isDark ? tw`text-slate-400` : tw`text-slate-500`,
                ]}
              >
                Registrar Refeição
              </Text>

              <TextInput
                placeholder="Nome da refeição (ex.: Almoço, Café da Manhã)"
                placeholderTextColor={tw.color("slate-400") as string}
                value={name}
                onChangeText={setName}
                style={[
                  tw`px-4 py-3 rounded-2xl border mb-3 text-sm font-medium`,
                  isDark
                    ? tw`bg-slate-800 border-slate-700 text-white`
                    : tw`bg-slate-50 border-slate-200 text-slate-800`,
                ]}
              />

              <View style={tw`flex-row gap-3 mb-3`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-[11px] font-bold text-slate-400 uppercase mb-1`}>
                    Carboidratos (g)
                  </Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={tw.color("slate-400") as string}
                    value={carbs}
                    onChangeText={setCarbs}
                    style={[
                      tw`px-4 py-3 rounded-2xl border text-sm font-bold`,
                      isDark
                        ? tw`bg-slate-800 border-slate-700 text-white`
                        : tw`bg-slate-50 border-slate-200 text-slate-800`,
                    ]}
                  />
                </View>

                <View style={tw`flex-1`}>
                  <Text style={tw`text-[11px] font-bold text-slate-400 uppercase mb-1`}>
                    Insulina (UI)
                  </Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={tw.color("slate-400") as string}
                    value={insulin}
                    onChangeText={setInsulin}
                    style={[
                      tw`px-4 py-3 rounded-2xl border text-sm font-bold`,
                      isDark
                        ? tw`bg-slate-800 border-slate-700 text-white`
                        : tw`bg-slate-50 border-slate-200 text-slate-800`,
                    ]}
                  />
                </View>
              </View>

              <TextInput
                placeholder="Observações (opcional)"
                placeholderTextColor={tw.color("slate-400") as string}
                value={notes}
                onChangeText={setNotes}
                style={[
                  tw`px-4 py-3 rounded-2xl border mb-4 text-sm`,
                  isDark
                    ? tw`bg-slate-800 border-slate-700 text-white`
                    : tw`bg-slate-50 border-slate-200 text-slate-800`,
                ]}
              />

              <Pressable
                onPress={handleSave}
                disabled={saving}
                style={({ pressed }) => [
                  tw`bg-blue-600 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm`,
                  pressed && tw`bg-blue-700`,
                  saving && tw`bg-blue-400`,
                ]}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Feather name="plus-circle" size={18} color="white" />
                    <Text style={tw`text-white font-bold text-sm`}>
                      Salvar Refeição
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                color={tw.color("blue-600") as string}
                style={tw`mt-8`}
              />
            ) : (
              <View
                style={[
                  tw`p-8 rounded-3xl items-center border`,
                  isDark
                    ? tw`bg-slate-900 border-slate-800`
                    : tw`bg-white border-slate-200/80`,
                ]}
              >
                <Feather
                  name="coffee"
                  size={32}
                  color={tw.color("slate-400") as string}
                  style={tw`mb-2`}
                />
                <Text
                  style={[
                    tw`text-sm font-bold`,
                    isDark ? tw`text-slate-300` : tw`text-slate-700`,
                  ]}
                >
                  Nenhuma refeição registrada
                </Text>
                <Text style={tw`text-xs text-slate-400 text-center mt-1`}>
                  Acompanhe seus carboidratos e doses de insulina acima.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <View
              style={[
                tw`p-4 rounded-2xl border shadow-sm mb-3 flex-row items-center justify-between`,
                isDark
                  ? tw`bg-slate-900 border-slate-800`
                  : tw`bg-white border-slate-100`,
              ]}
            >
              <View style={tw`flex-1 mr-3`}>
                <Text
                  style={[
                    tw`text-base font-bold`,
                    isDark ? tw`text-white` : tw`text-slate-800`,
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={tw`text-xs font-semibold text-blue-600 mt-0.5`}>
                  {item.carbs_grams}g carbo • {item.insulin_units} UI insulina
                </Text>
                <Text style={tw`text-xs text-slate-400 mt-0.5`}>
                  {new Date(item.eaten_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {item.notes ? ` • ${item.notes}` : ""}
                </Text>
              </View>

              <Pressable
                onPress={() => handleDelete(item)}
                style={({ pressed }) => [
                  tw`p-2 rounded-xl`,
                  pressed && (isDark ? tw`bg-slate-800` : tw`bg-red-50`),
                ]}
                hitSlop={8}
              >
                <Feather
                  name="trash-2"
                  size={18}
                  color={tw.color("red-500") as string}
                />
              </Pressable>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
