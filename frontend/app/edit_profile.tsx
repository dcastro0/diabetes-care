import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

export default function EditarPerfilScreen() {
  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Cabeçalho */}
      <View style={tw`flex-row items-center p-4 border-b border-slate-200 bg-white`}>
        <Pressable onPress={() => router.back()} style={tw`p-2`}>
          <Feather name="chevron-left" size={24} color={tw.color('slate-700')} />
        </Pressable>
        <Text style={tw`text-xl font-bold text-slate-800 ml-4`}>
          Editar Perfil
        </Text>
      </View>

      {/* Conteúdo */}
      <View style={tw`p-6 justify-center items-center flex-1`}>
        <Feather name="user" size={60} color={tw.color('slate-400')} />
        <Text style={tw`text-lg text-slate-500 mt-4`}>
          Em breve...
        </Text>
        <Text style={tw`text-base text-slate-400 mt-1 text-center`}>
          Aqui o usuário poderá alterar seu nome e avatar (foto de perfil).
        </Text>
      </View>
    </SafeAreaView>
  );
}