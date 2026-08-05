import {
  addReminder,
  cancelAllReminders,
  getReminders,
  Reminder,
  removeReminder
} from '@/services/notificationService';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

export default function LembretesScreen() {
  const [date, setDate] = useState(new Date()); 
  const [showPicker, setShowPicker] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  
  // --- (Novos estados para a lista) ---
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  // ---

  // Carrega a lista de lembretes sempre que a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      const loadReminders = async () => {
        setIsLoadingList(true);
        const storedReminders = await getReminders();
        setReminders(storedReminders);
        setIsLoadingList(false);
      };
      loadReminders();
    }, [])
  );

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  const showTimepicker = () => setShowPicker(true);

  // --- (Funções de manipulação atualizadas) ---

  const handleAddReminder = async () => {
    setIsScheduling(true);
    try {
      const hour = date.getHours();
      const minute = date.getMinutes();
      
      // Verifica se já existe um lembrete para este horário
      const exists = reminders.find(r => r.hour === hour && r.minute === minute);
      if (exists) {
        Alert.alert('Lembrete Duplicado', 'Você já possui um lembrete para este horário.');
        setIsScheduling(false);
        return;
      }

      const updatedList = await addReminder(hour, minute);
      if (updatedList) {
        setReminders(updatedList); // Atualiza a lista na UI
        Alert.alert(
          'Lembrete Adicionado!',
          `Você será notificado diariamente às ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}.`
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível agendar o lembrete.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleRemoveReminder = async (id: string) => {
    const updatedList = await removeReminder(id);
    setReminders(updatedList); // Atualiza a lista na UI
  };

  const handleCancelAllReminders = async () => {
    await cancelAllReminders();
    setReminders([]); // Limpa a lista na UI
  };

  // --- (Renderização do item da lista) ---
  const renderReminderItem = ({ item }: { item: Reminder }) => (
    <View style={tw`bg-white p-4 rounded-lg shadow-sm shadow-slate-200 border border-slate-100 flex-row justify-between items-center mb-3`}>
      <View style={tw`flex-row items-center gap-3`}>
        <Feather name="clock" size={20} color={tw.color('blue-600')} />
        <Text style={tw`text-xl font-bold text-slate-700`}>
          {item.hour.toString().padStart(2, '0')}:{item.minute.toString().padStart(2, '0')}
        </Text>
      </View>
      <Pressable 
        onPress={() => handleRemoveReminder(item.id)}
        style={({pressed}) => [tw`p-2 rounded-full`, pressed && tw`bg-red-100`]}
      >
        <Feather name="trash-2" size={20} color={tw.color('red-500')} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Header */}
      <View style={tw`flex-row items-center p-4 border-b border-slate-200 bg-white`}>
        <Pressable onPress={() => router.back()} style={tw`p-2`}>
          <Feather name="chevron-left" size={24} color={tw.color('slate-700')} />
        </Pressable>
        <Text style={tw`text-xl font-bold text-slate-800 ml-4`}>
          Lembretes
        </Text>
      </View>

      {/* --- (Nova Seção: Adicionar Lembrete) --- */}
      <View style={tw`p-6 border-b border-slate-200`}>
        <Text style={tw`text-base text-slate-600 mb-4`}>
          Adicionar novo lembrete diário:
        </Text>
        
        {Platform.OS === 'android' && (
          <Pressable onPress={showTimepicker} style={tw`bg-white rounded-2xl p-4 shadow-sm shadow-slate-200 border border-slate-100 mb-4`}>
            <Text style={tw`text-lg font-semibold text-blue-600 text-center`}>
              Escolher Horário
            </Text>
          </Pressable>
        )}
        
        {Platform.OS === 'android' && showPicker && (
          <DateTimePicker value={date} mode={'time'} is24Hour={true} display={'default'} onChange={onChange} />
        )}
        
        {Platform.OS === 'ios' && (
          <DateTimePicker value={date} mode={'time'} is24Hour={true} display={'spinner'} onChange={onChange} style={tw`my-0`} />
        )}
        
        <Text style={tw`text-center text-4xl font-bold text-slate-700 my-4`}>
          {date.getHours().toString().padStart(2, '0')}:{date.getMinutes().toString().padStart(2, '0')}
        </Text>

        <Pressable
          onPress={handleAddReminder}
          disabled={isScheduling}
          style={({ pressed }) => [
            tw`bg-blue-600 py-4 rounded-2xl`, pressed && tw`bg-blue-700`, isScheduling && tw`bg-blue-300`
          ]}
        >
          {isScheduling ? <ActivityIndicator color="#fff" /> : 
            <Text style={tw`text-white font-bold text-center text-base`}>
              Adicionar Lembrete
            </Text>}
        </Pressable>
      </View>

      {/* --- (Nova Seção: Lista de Lembretes) --- */}
      <View style={tw`p-6 flex-1`}>
        <Text style={tw`text-lg font-bold text-slate-800 mb-4`}>
          Meus Lembretes
        </Text>
        {isLoadingList ? (
          <ActivityIndicator size="large" color={tw.color('blue-600')} style={tw`mt-4`} />
        ) : (
          <FlatList
            data={reminders}
            renderItem={renderReminderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={() => (
              <View style={tw`p-4 bg-white rounded-lg items-center border border-slate-100`}>
                <Text style={tw`text-slate-500`}>Nenhum lembrete definido.</Text>
              </View>
            )}
            ListFooterComponent={() => (
              <>{reminders.length > 0 && (
                <Pressable
                  onPress={handleCancelAllReminders}
                  style={({ pressed }) => [
                    tw`bg-white mt-4 py-4 rounded-2xl border border-red-200`,
                    pressed && tw`bg-red-50`,
                  ]}
                >
                  <Text style={tw`text-red-500 font-bold text-center text-base`}>
                    Remover Todos os Lembretes
                  </Text>
                </Pressable>
              )}</>
            )}
          />
        )}
      </View>

    </SafeAreaView>
  );
}