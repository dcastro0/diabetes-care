import { useAuth } from "@/hooks/useAuth";
import { EditProfileFormData, editProfileSchema } from "@/schemas/authSchema";
import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

export default function EditarPerfilScreen() {
  const { authData, updateAuthData } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      nome: authData?.nome ?? "",
      email: authData?.email ?? "",
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      await updateAuthData({
        nome: data.nome,
        email: data.email,
      });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      router.back();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível atualizar o perfil.");
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Cabeçalho */}
        <View style={tw`flex-row items-center justify-between p-4 border-b border-slate-200/80 bg-white`}>
          <Pressable onPress={() => router.back()} style={tw`p-2 rounded-full`}>
            <Feather name="arrow-left" size={20} color={(tw.color("slate-700") as string)} />
          </Pressable>
          <Text style={tw`text-lg font-bold text-slate-800`}>
            Editar Perfil
          </Text>
          <View style={tw`w-8`} />
        </View>

        <ScrollView contentContainerStyle={tw`p-6`}>
          {/* Avatar com Badge de Edição */}
          <View style={tw`items-center my-6`}>
            <View style={tw`w-24 h-24 rounded-full bg-blue-100 items-center justify-center border-2 border-blue-200 mb-2`}>
              <Text style={tw`text-4xl font-bold text-blue-600`}>
                {authData?.nome?.[0] ?? "U"}
              </Text>
            </View>
            <Text style={tw`text-xs font-semibold text-slate-400`}>
              Edição de Dados Pessoais
            </Text>
          </View>

          {/* Campo Nome */}
          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-4`}>
                <Text style={tw`text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5`}>
                  Nome Completo
                </Text>
                <View
                  style={[
                    tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm border-2`,
                    errors.nome ? tw`border-red-500` : tw`border-slate-200/80`,
                  ]}
                >
                  <Feather name="user" size={18} color={(tw.color("slate-400") as string)} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base text-slate-800`}
                    placeholder="Seu nome"
                    placeholderTextColor={(tw.color("slate-400") as string)}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.nome && (
                  <Text style={tw`text-red-500 mt-1 ml-2 text-xs font-semibold`}>
                    {errors.nome.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Campo Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-8`}>
                <Text style={tw`text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5`}>
                  Endereço de E-mail
                </Text>
                <View
                  style={[
                    tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm border-2`,
                    errors.email ? tw`border-red-500` : tw`border-slate-200/80`,
                  ]}
                >
                  <Feather name="mail" size={18} color={(tw.color("slate-400") as string)} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base text-slate-800`}
                    placeholder="seu@email.com"
                    placeholderTextColor={(tw.color("slate-400") as string)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.email && (
                  <Text style={tw`text-red-500 mt-1 ml-2 text-xs font-semibold`}>
                    {errors.email.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Botão Salvar Alterações */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={({ pressed }) => [
              tw`bg-blue-600 py-4 rounded-2xl flex-row justify-center items-center gap-2 shadow-lg shadow-blue-200`,
              pressed && tw`opacity-90`,
              isSubmitting && tw`bg-blue-400`,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="check" size={18} color="white" />
                <Text style={tw`text-white text-center font-bold text-base`}>
                  Salvar Alterações
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}