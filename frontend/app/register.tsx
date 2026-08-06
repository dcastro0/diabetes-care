import { useAuth } from "@/hooks/useAuth"
import { RegisterFormData, registerSchema } from "@/schemas/authSchema"
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
import { SafeAreaView } from "react-native-safe-area-context"
import tw from "twrnc"

export default function RegisterScreen() {
  const { signIn } = useAuth()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: "", email: "", password: "", confirmPassword: "" },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerService.signUp(data)
      await signIn({ email: data.email, password: data.password })

      Alert.alert(
        "Cadastro concluído com sucesso!",
        "Bem-vindo ao Diabetes Care. Registre sua primeira medição para iniciar o acompanhamento.",
      )
      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert(
        "Erro no Cadastro",
        error.message || "Não foi possível realizar o cadastro.",
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
          <View style={tw`items-center mb-8`}>
            <View style={tw`bg-blue-100 p-4 rounded-full mb-3`}>
              <Feather name="user-plus" size={36} color={(tw.color("blue-600") as string)} />
            </View>
            <Text style={tw`text-2xl font-bold text-slate-800`}>Crie sua Conta</Text>
            <Text style={tw`text-sm text-slate-500`}>Preencha os campos abaixo</Text>
          </View>

          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-4`}>
                <View
                  style={[
                    tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm border-2`,
                    errors.nome ? tw`border-red-500` : tw`border-transparent`,
                  ]}
                >
                  <Feather name="user" size={20} color={(tw.color("slate-400") as string)} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base text-slate-800`}
                    placeholder="Digite seu nome completo"
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

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-4`}>
                <View
                  style={[
                    tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm border-2`,
                    errors.email ? tw`border-red-500` : tw`border-transparent`,
                  ]}
                >
                  <Feather name="mail" size={20} color={(tw.color("slate-400") as string)} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base text-slate-800`}
                    placeholder="Digite seu email"
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-4`}>
                <View
                  style={[
                    tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm border-2`,
                    errors.password ? tw`border-red-500` : tw`border-transparent`,
                  ]}
                >
                  <Feather name="lock" size={20} color={(tw.color("slate-400") as string)} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base text-slate-800`}
                    placeholder="Crie uma senha"
                    placeholderTextColor={(tw.color("slate-400") as string)}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.password && (
                  <Text style={tw`text-red-500 mt-1 ml-2 text-xs font-semibold`}>
                    {errors.password.message}
                  </Text>
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
                  style={[
                    tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm border-2`,
                    errors.confirmPassword ? tw`border-red-500` : tw`border-transparent`,
                  ]}
                >
                  <Feather name="lock" size={20} color={(tw.color("slate-400") as string)} />
                  <TextInput
                    style={tw`flex-1 ml-3 text-base text-slate-800`}
                    placeholder="Confirme sua senha"
                    placeholderTextColor={(tw.color("slate-400") as string)}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={tw`text-red-500 mt-1 ml-2 text-xs font-semibold`}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={({ pressed }) => [
              tw`bg-blue-600 py-4 rounded-2xl shadow-lg shadow-blue-200 flex-row justify-center`,
              pressed && tw`opacity-90`,
              isSubmitting && tw`bg-blue-400`,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-white text-center font-bold text-base`}>Cadastrar</Text>
            )}
          </Pressable>

          <View style={tw`flex-row justify-center mt-8`}>
            <Text style={tw`text-slate-500 text-sm`}>Já tem uma conta? </Text>
            <Pressable onPress={() => router.replace("/login")}>
              <Text style={tw`text-blue-600 font-bold text-sm`}>Faça Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}