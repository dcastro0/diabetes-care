import { useTheme } from "@/contexts/ThemeContext"
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
  Image,
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
  const { isDark } = useTheme()

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
        "Bem-vindo ao Diabetes Care!",
        "Sua conta foi criada. O Glico está aqui para te acompanhar!",
      )
      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert(
        "Não foi possível cadastrar",
        error.message || "Verifique os dados e tente novamente.",
      )
    }
  }

  return (
    <SafeAreaView style={[tw`flex-1`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow p-6 pt-8`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho + mascote */}
          <View style={tw`items-center mb-8`}>
            <Image
              source={require("../assets/images/glico_mascot.png")}
              style={tw`w-20 h-20 rounded-2xl mb-3 shadow-md border-2 border-blue-400/30`}
              resizeMode="cover"
            />
            <Text style={[tw`text-2xl font-black tracking-tight`, isDark ? tw`text-white` : tw`text-slate-900`]}>
              Criar sua Conta
            </Text>
            <Text style={[tw`text-sm font-medium mt-1`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
              Comece seu acompanhamento personalizado
            </Text>
          </View>

          {/* Campo Nome */}
          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-3`}>
                <Text style={[tw`text-xs font-bold uppercase tracking-wider mb-1.5`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                  Nome Completo
                </Text>
                <View
                  style={[
                    tw`flex-row items-center rounded-2xl p-4 border-2 shadow-sm`,
                    isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
                    errors.nome ? tw`border-red-500` : null,
                  ]}
                >
                  <Feather name="user" size={18} color={(tw.color("slate-400") as string)} />
                  <TextInput
                    style={[tw`flex-1 ml-3 text-base font-medium`, isDark ? tw`text-white` : tw`text-slate-800`]}
                    placeholder="Seu nome completo"
                    placeholderTextColor={(tw.color("slate-400") as string)}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.nome && (
                  <Text style={tw`text-red-500 mt-1 ml-1 text-xs font-semibold`}>
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
              <View style={tw`mb-3`}>
                <Text style={[tw`text-xs font-bold uppercase tracking-wider mb-1.5`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                  E-mail
                </Text>
                <View
                  style={[
                    tw`flex-row items-center rounded-2xl p-4 border-2 shadow-sm`,
                    isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
                    errors.email ? tw`border-red-500` : null,
                  ]}
                >
                  <Feather name="mail" size={18} color={(tw.color("slate-400") as string)} />
                  <TextInput
                    style={[tw`flex-1 ml-3 text-base font-medium`, isDark ? tw`text-white` : tw`text-slate-800`]}
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
                  <Text style={tw`text-red-500 mt-1 ml-1 text-xs font-semibold`}>
                    {errors.email.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Campo Senha */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-3`}>
                <Text style={[tw`text-xs font-bold uppercase tracking-wider mb-1.5`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                  Senha
                </Text>
                <View
                  style={[
                    tw`flex-row items-center rounded-2xl p-4 border-2 shadow-sm`,
                    isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
                    errors.password ? tw`border-red-500` : null,
                  ]}
                >
                  <Feather name="lock" size={18} color={(tw.color("slate-400") as string)} />
                  <TextInput
                    style={[tw`flex-1 ml-3 text-base font-medium`, isDark ? tw`text-white` : tw`text-slate-800`]}
                    placeholder="Crie uma senha segura"
                    placeholderTextColor={(tw.color("slate-400") as string)}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.password && (
                  <Text style={tw`text-red-500 mt-1 ml-1 text-xs font-semibold`}>
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Confirmar Senha */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-6`}>
                <Text style={[tw`text-xs font-bold uppercase tracking-wider mb-1.5`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                  Confirmar Senha
                </Text>
                <View
                  style={[
                    tw`flex-row items-center rounded-2xl p-4 border-2 shadow-sm`,
                    isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
                    errors.confirmPassword ? tw`border-red-500` : null,
                  ]}
                >
                  <Feather name="shield" size={18} color={(tw.color("slate-400") as string)} />
                  <TextInput
                    style={[tw`flex-1 ml-3 text-base font-medium`, isDark ? tw`text-white` : tw`text-slate-800`]}
                    placeholder="Repita a senha"
                    placeholderTextColor={(tw.color("slate-400") as string)}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={tw`text-red-500 mt-1 ml-1 text-xs font-semibold`}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Botão Cadastrar */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={({ pressed }) => [
              tw`bg-blue-600 py-4 rounded-2xl shadow-lg shadow-blue-200 flex-row justify-center items-center gap-2`,
              pressed && tw`bg-blue-700`,
              isSubmitting && tw`bg-blue-400`,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="user-plus" size={18} color="white" />
                <Text style={tw`text-white text-center font-bold text-base`}>Criar Conta</Text>
              </>
            )}
          </Pressable>

          {/* Link para Login */}
          <View style={tw`flex-row justify-center mt-6 mb-4`}>
            <Text style={[tw`text-sm font-medium`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
              Já tem uma conta?{" "}
            </Text>
            <Pressable onPress={() => router.replace("/login")}>
              <Text style={tw`text-blue-600 font-bold text-sm`}>Fazer Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}