import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

export default function AjudaScreen() {
  
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Não foi possível abrir o link", err));
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Cabeçalho */}
      <View style={tw`flex-row items-center p-4 border-b border-slate-200 bg-white`}>
        <Pressable onPress={() => router.back()} style={tw`p-2`}>
          <Feather name="chevron-left" size={24} color={tw.color('slate-700')} />
        </Pressable>
        <Text style={tw`text-xl font-bold text-slate-800 ml-4`}>
          Ajuda e Suporte
        </Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-6`}>
        {/* Seção Sobre */}
        <View style={tw`bg-white p-5 rounded-2xl shadow-md shadow-slate-200 mb-6`}>
          <Text style={tw`text-lg font-bold text-slate-800 mb-3`}>
            Sobre o Diabetes Care
          </Text>
          <Text style={tw`text-base text-slate-600 leading-6`}>
            Este aplicativo foi desenvolvido como parte de um Trabalho de Conclusão de Curso (TCC) com o objetivo de auxiliar no monitoramento e tratamento da diabetes. 
            Ele utiliza conceitos de gamificação (pontos e conquistas) para incentivar o registro consistente dos níveis de glicemia.
          </Text>
        </View>

        {/* Seção Como Usar */}
        <View style={tw`bg-white p-5 rounded-2xl shadow-md shadow-slate-200 mb-6`}>
          <Text style={tw`text-lg font-bold text-slate-800 mb-3`}>
            Como Usar
          </Text>
          
          <View style={tw`flex-row gap-3 mb-3`}>
            <Feather name="check-circle" size={20} color={tw.color('blue-600')} style={tw`mt-1`} />
            <Text style={tw`text-base text-slate-600 flex-1`}>
              <Text style={tw`font-bold`}>Medir:</Text> Use a aba central para registrar rapidamente seus níveis de glicemia.
            </Text>
          </View>
          
          <View style={tw`flex-row gap-3 mb-3`}>
            <Feather name="bar-chart-2" size={20} color={tw.color('blue-600')} style={tw`mt-1`} />
            <Text style={tw`text-base text-slate-600 flex-1`}>
              <Text style={tw`font-bold`}>Home:</Text> Veja um resumo dos seus dados e puxe para baixo para sincronizar com o servidor.
            </Text>
          </View>

          <View style={tw`flex-row gap-3 mb-3`}>
            <Feather name="award" size={20} color={tw.color('blue-600')} style={tw`mt-1`} />
            <Text style={tw`text-base text-slate-600 flex-1`}>
              <Text style={tw`font-bold`}>Conquistas:</Text> Ganhe pontos e medalhas por manter a consistência nos registros.
            </Text>
          </View>

          <View style={tw`flex-row gap-3`}>
            <Feather name="file-text" size={20} color={tw.color('blue-600')} style={tw`mt-1`} />
            <Text style={tw`text-base text-slate-600 flex-1`}>
              <Text style={tw`font-bold`}>Histórico:</Text> Exporte seu histórico completo como PDF para compartilhar com seu médico.
            </Text>
          </View>
        </View>

        {/* Seção Contato */}
        <View style={tw`bg-white p-5 rounded-2xl shadow-md shadow-slate-200`}>
          <Text style={tw`text-lg font-bold text-slate-800 mb-3`}>
            Desenvolvedor
          </Text>
          <Text style={tw`text-base text-slate-600 leading-6 mb-4`}>
            Caio Corrêa de Castro
          </Text>
          
          {/* Você pode adicionar links reais aqui se quiser */}
          <Pressable 
            onPress={() => openLink('https://github.com/dcastro0')}
            style={({pressed}) => [tw`flex-row items-center gap-3 p-3 rounded-lg`, pressed && tw`bg-slate-100`]}
          >
            <Feather name="github" size={20} color={tw.color('slate-700')} />
            <Text style={tw`text-base text-slate-700 font-semibold`}>GitHub</Text>
          </Pressable>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}