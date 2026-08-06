import {
  addReminder,
  cancelAllReminders,
  getReminders,
  Reminder,
  removeReminder,
} from "@/services/notificationService";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function LembretesScreen() {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadReminders = async () => {
        setIsLoadingList(true);
        const storedReminders = await getReminders();
        setReminders(storedReminders);
        setIsLoadingList(false);
      };
      loadReminders();
    }, []),
  );

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAddReminder = async () => {
    setIsScheduling(true);
    try {
      const hour = date.getHours();
      const minute = date.getMinutes();

      const exists = reminders.find((r) => r.hour === hour && r.minute === minute);
      if (exists) {
        Alert.alert("Lembrete Duplicado", "Você já possui um lembrete configurado para este horário.");
        setIsScheduling(false);
        return;
      }

      const updatedList = await addReminder(hour, minute, "Hora de medir a glicemia");
      setReminders(updatedList);
      Alert.alert(
        "Lembrete Adicionado!",
        `Você será notificado diariamente às ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}.`,
      );
    } catch (error) {
      console.error("Erro ao adicionar lembrete:", error);
      Alert.alert("Erro", "Não foi possível agendar o lembrete.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleRemoveReminder = async (id: string) => {
    const updatedList = await removeReminder(id);
    setReminders(updatedList);
  };

  const handleCancelAllReminders = async () => {
    Alert.alert(
      "Remover Todos",
      "Tem certeza que deseja apagar todos os lembretes agendados?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover Todos",
          style: "destructive",
          onPress: async () => {
            await cancelAllReminders();
            setReminders([]);
          },
        },
      ],
    );
  };

  const renderReminderItem = ({ item }: { item: Reminder }) => (
    <View style={tw`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-row justify-between items-center mb-3`}>
      <View style={tw`flex-row items-center gap-3`}>
        <View style={tw`bg-blue-50 p-2.5 rounded-xl`}>
          <Feather name="clock" size={18} color={(tw.color("blue-600") as string)} />
        </View>
        <View>
          <Text style={tw`text-xl font-black text-slate-800`}>
            {item.hour.toString().padStart(2, "0")}:{item.minute.toString().padStart(2, "0")}
          </Text>
          <Text style={tw`text-xs text-slate-400`}>{item.title}</Text>
        </View>
      </View>
      <Pressable
        onPress={() => handleRemoveReminder(item.id)}
        style={({ pressed }) => [
          tw`p-2 rounded-xl`,
          pressed && tw`bg-red-50`,
        ]}
        hitSlop={8}
      >
        <Feather name="trash-2" size={18} color={(tw.color("red-500") as string)} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Cabeçalho */}
      <View style={tw`flex-row items-center justify-between p-4 border-b border-slate-200/80 bg-white`}>
        <Pressable onPress={() => router.back()} style={tw`p-2 rounded-full`}>
          <Feather name="arrow-left" size={20} color={(tw.color("slate-700") as string)} />
        </Pressable>
        <Text style={tw`text-lg font-bold text-slate-800`}>Lembretes Diários</Text>
        <View style={tw`w-8`} />
      </View>

      {/* Form de Adicionar */}
      <View style={tw`p-6 border-b border-slate-200/80 bg-white`}>
        <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-3`}>
          Agendar Novo Horário
        </Text>

        {Platform.OS === "android" && (
          <Pressable
            onPress={() => setShowPicker(true)}
            style={tw`bg-slate-50 rounded-2xl p-4 border border-slate-200 flex-row justify-between items-center mb-3`}
          >
            <Text style={tw`text-sm font-semibold text-slate-600`}>Selecionar Horário</Text>
            <Feather name="clock" size={18} color={(tw.color("blue-600") as string)} />
          </Pressable>
        )}

        {(showPicker || Platform.OS === "ios") && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChange}
          />
        )}

        <View style={tw`items-center my-2`}>
          <Text style={tw`text-4xl font-black text-slate-900`}>
            {date.getHours().toString().padStart(2, "0")}:{date.getMinutes().toString().padStart(2, "0")}
          </Text>
        </View>

        <Pressable
          onPress={handleAddReminder}
          disabled={isScheduling}
          style={({ pressed }) => [
            tw`bg-blue-600 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 mt-2 shadow-sm`,
            pressed && tw`bg-blue-700`,
            isScheduling && tw`bg-blue-300`,
          ]}
        >
          {isScheduling ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Feather name="plus-circle" size={18} color="white" />
              <Text style={tw`text-white font-bold text-sm`}>Adicionar Lembrete</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Lista de Lembretes */}
      <View style={tw`p-6 flex-1`}>
        <Text style={tw`text-base font-bold text-slate-800 mb-3`}>Meus Lembretes Configurados</Text>

        {isLoadingList ? (
          <ActivityIndicator size="large" color={(tw.color("blue-600") as string)} style={tw`mt-6`} />
        ) : (
          <FlatList
            data={reminders}
            renderItem={renderReminderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={() => (
              <View style={tw`p-8 bg-white rounded-3xl items-center border border-slate-200/80`}>
                <Feather name="bell-off" size={32} color={(tw.color("slate-300") as string)} style={tw`mb-2`} />
                <Text style={tw`text-sm font-bold text-slate-600`}>Nenhum lembrete cadastrado</Text>
                <Text style={tw`text-xs text-slate-400 text-center mt-1`}>
                  Escolha um horário acima para ser notificado diariamente.
                </Text>
              </View>
            )}
            ListFooterComponent={() => (
              <>
                {reminders.length > 0 && (
                  <Pressable
                    onPress={handleCancelAllReminders}
                    style={({ pressed }) => [
                      tw`bg-white mt-4 py-3 rounded-2xl border border-red-200 items-center justify-center flex-row gap-2`,
                      pressed && tw`bg-red-50`,
                    ]}
                  >
                    <Feather name="trash-2" size={16} color={(tw.color("red-500") as string)} />
                    <Text style={tw`text-red-500 font-bold text-xs`}>Remover Todos os Lembretes</Text>
                  </Pressable>
                )}
              </>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}