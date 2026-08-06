import { useTheme } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function OnboardingScreen() {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [diabetesType, setDiabetesType] = useState<string>("Tipo 2");

  const types = ["Tipo 1", "Tipo 2", "Gestacional", "Pré-diabetes", "Acompanhamento Preventivo"];

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        await AsyncStorage.setItem("@DiabetesCare:hasSeenOnboarding", "true");
        await AsyncStorage.setItem("@DiabetesCare:diabetesType", diabetesType);
      } catch (err) {
        console.warn("Erro ao salvar dados de onboarding:", err);
      }
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={[tw`flex-1 justify-between p-6`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
      {/* Indicadores de Progresso */}
      <View style={tw`flex-row justify-center gap-2 mt-4`}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              tw`h-2 rounded-full transition-all`,
              i === step
                ? tw`w-8 bg-blue-600`
                : isDark
                ? tw`w-2 bg-slate-800`
                : tw`w-2 bg-slate-200`,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={tw`flex-grow justify-center items-center py-6`}>
        {step === 1 && (
          <View style={tw`items-center text-center`}>
            <Image
              source={require("../assets/images/glico_mascot.png")}
              style={tw`w-52 h-52 rounded-3xl mb-6 shadow-lg`}
              resizeMode="contain"
            />
            <View style={tw`bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full mb-3`}>
              <Text style={tw`text-xs font-bold text-blue-700 uppercase tracking-wider`}>
                Seu Par de Saúde
              </Text>
            </View>
            <Text style={[tw`text-3xl font-black text-center mb-3`, isDark ? tw`text-white` : tw`text-slate-800`]}>
              Olá! Eu sou o Glico.
            </Text>
            <Text style={[tw`text-base text-center leading-6 px-4`, isDark ? tw`text-slate-300` : tw`text-slate-600`]}>
              Estou aqui para te acompanhar no seu controle de glicemia de forma simples, no seu ritmo e sem complicações.
            </Text>
          </View>
        )}

        {step === 2 && (
          <View style={tw`w-full items-center`}>
            <View style={tw`bg-blue-100/60 p-4 rounded-full mb-4`}>
              <Feather name="heart" size={36} color={(tw.color("blue-600") as string)} />
            </View>
            <Text style={[tw`text-2xl font-bold text-center mb-2`, isDark ? tw`text-white` : tw`text-slate-800`]}>
              Qual o seu objetivo principal?
            </Text>
            <Text style={[tw`text-sm text-center mb-6`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
              Isso nos ajuda a adaptar as dicas e informações para você.
            </Text>

            <View style={tw`w-full gap-2.5`}>
              {types.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setDiabetesType(type)}
                  style={({ pressed }) => [
                    tw`p-4 rounded-2xl border-2 flex-row justify-between items-center shadow-sm`,
                    isDark
                      ? diabetesType === type
                        ? tw`border-blue-500 bg-slate-900`
                        : tw`border-slate-800 bg-slate-900/60`
                      : diabetesType === type
                      ? tw`border-blue-600 bg-blue-50/50`
                      : tw`border-slate-200 bg-white`,
                    pressed && tw`opacity-80`,
                  ]}
                >
                  <Text style={[tw`text-base font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>{type}</Text>
                  {diabetesType === type ? (
                    <Feather name="check-circle" size={20} color={(tw.color("blue-600") as string)} />
                  ) : (
                    <View style={tw`w-5 h-5 rounded-full border border-slate-400`} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={tw`items-center text-center`}>
            <Image
              source={require("../assets/images/glico_tips.png")}
              style={tw`w-52 h-52 rounded-3xl mb-6 shadow-lg`}
              resizeMode="contain"
            />
            <Text style={[tw`text-2xl font-bold text-center mb-3`, isDark ? tw`text-white` : tw`text-slate-800`]}>
              Você no controle, sem estresse
            </Text>
            <Text style={[tw`text-base text-center leading-6 px-4 mb-4`, isDark ? tw`text-slate-300` : tw`text-slate-600`]}>
              Registre quando puder, veja estimativas de HbA1c e compartilhe relatórios completos com seu médico.
            </Text>
            <View style={tw`bg-emerald-50 border border-emerald-200 rounded-2xl p-4 w-full flex-row items-center gap-3`}>
              <Feather name="shield-check" size={24} color={(tw.color("emerald-600") as string)} />
              <Text style={tw`text-xs font-semibold text-emerald-800 flex-1 leading-5`}>
                Seus dados pertencem a você: salvos localmente e seguros na nuvem.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botões de Ação */}
      <View style={tw`w-full pb-4`}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            tw`bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-blue-200`,
            pressed && tw`bg-blue-700`,
          ]}
        >
          <Text style={tw`text-white font-bold text-base`}>
            {step === 3 ? "Entrar no Aplicativo" : "Continuar"}
          </Text>
          <Feather name="arrow-right" size={20} color="white" />
        </Pressable>

        {step < 3 && (
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={tw`py-3 items-center mt-1`}
          >
            <Text style={tw`text-xs font-bold text-slate-400`}>Pular Introdução</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
