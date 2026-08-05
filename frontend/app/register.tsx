import { useAuth } from "@/hooks/useAuth"
import { RegisterFormValues, registerSchema } from "@/schema/registerSchema"
import { registerService } from "@/services/registerService"
import { Feather } from "@expo/vector-icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from "expo-router"
import React from "react"
import { Controller, useForm } from "react-hook-form"
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
} from "react-native"
// 1. IMPORT CORRIGIDO
import { SafeAreaView } from "react-native-safe-area-context"
import tw from "twrnc"

export default function RegisterScreen() {
  const { signIn } = useAuth() // 2. Não precisamos do authData aqui

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: "", email: "", password: "", confirmPassword: "" },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // 1. Registra o usuário
      await registerService.signUp(data)

      // 2. Faz o auto-login e captura os dados retornados
      const userData = await signIn({ email: data.email, password: data.password })

      // 3. Usa os dados retornados (userData) para checar a streak
      const streak = (userData as { streak_count?: number } | undefined)?.streak_count ?? 0
      if (streak && streak > 0) {
        Alert.alert(
          "Registro concluído!",
          `Bem-vindo! Sua sequência atual é de ${streak} dia(s).`,
        )
      } else {
        Alert.alert(
          "Registro concluído!",
          "Bem-vindo! Comece registrando sua primeira medição.",
        )
      }
      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert(
        "Erro no Cadastro",
        error.message || "Não foi possível se cadastrar.",
      )
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow justify-center p-8`}
          keyboardShouldPersistTaps="handled"
        >
          <View style={tw`items-center mb-10`}>
            <Text style={tw`text-3xl font-bold text-slate-800`}>Crie sua Conta</Text>
            <Text style={tw`text-base text-slate-500`}>É rápido e fácil</Text>
          </View>

          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-4`}>
                <View
                  style={tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm ${
                    errors.nome
                      ? "border-2 border-red-500"
                      : "border-2 border-transparent"
                  }`}
                >
                  <Feather name="user" size={20} color={tw.color("slate-400")} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base text-slate-800`}
                    placeholder="Digite seu nome completo"
                    placeholderTextColor={tw.color("slate-400")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.nome && (
                  <Text style={tw`text-red-500 mt-1 ml-2`}>{errors.nome.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-4`}>
                <View
                  style={tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm ${
                    errors.email
                      ? "border-2 border-red-500"
                      : "border-2 border-transparent"
                  }`}
                >
                  <Feather name="mail" size={20} color={tw.color("slate-400")} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base text-slate-800`}
                    placeholder="Digite seu email"
                    placeholderTextColor={tw.color("slate-400")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.email && (
                  <Text style={tw`text-red-500 mt-1 ml-2`}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-4`}>
                <View
                  style={tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm ${
                    errors.password
                      ? "border-2 border-red-500"
                      : "border-2 border-transparent"
                  }`}
                >
                  <Feather name="lock" size={20} color={tw.color("slate-400")} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base text-slate-800`}
                    placeholder="Crie uma senha"
                    placeholderTextColor={tw.color("slate-400")}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.password && (
                  <Text style={tw`text-red-500 mt-1 ml-2`}>{errors.password.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-6`}>
                <View
                  style={tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm ${
                    errors.confirmPassword
                      ? "border-2 border-red-500"
                      : "border-2 border-transparent"
                  }`}
                >
                  <Feather name="lock" size={20} color={tw.color("slate-400")} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base text-slate-800`}
                    placeholder="Confirme sua senha"
                    placeholderTextColor={tw.color("slate-400")}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={tw`text-red-500 mt-1 ml-2`}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={({ pressed }) =>
              tw.style(
                "bg-blue-600 py-4 rounded-2xl shadow-lg shadow-blue-200 flex-row justify-center",
                pressed && "scale-98 opacity-90",
                isSubmitting && "bg-blue-400",
              )
            }
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-white text-center font-bold text-base`}>Cadastrar</Text>
            )}
          </Pressable>

          <View style={tw`flex-row justify-center mt-8`}>
            <Text style={tw`text-slate-500`}>Já tem uma conta? </Text>
            <Pressable onPress={() => router.replace("/login")}>
              <Text style={tw`text-blue-600 font-bold`}>Faça Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}