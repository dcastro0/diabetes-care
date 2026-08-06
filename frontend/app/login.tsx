import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/hooks/useAuth"
import { LoginFormData, loginSchema } from "@/schemas/authSchema"
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

export default function LoginScreen() {
  const { signIn } = useAuth()
  const { isDark } = useTheme()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data)
      Alert.alert(
        "Bem-vindo de volta!",
        "Seu painel de acompanhamento de glicemia está pronto.",
      )
      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert(
        "Não foi possível entrar",
        error.message || "Verifique suas credenciais e tente novamente.",
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
          contentContainerStyle={tw`flex-grow justify-center p-6`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Identidade do App — Logo + Mascote */}
          <View style={tw`items-center mb-10`}>
            <Image
              source={require("../assets/images/glico_mascot.png")}
              style={tw`w-24 h-24 rounded-3xl mb-4 shadow-lg border-2 border-blue-400/30`}
              resizeMode="cover"
            />
            <Text style={[tw`text-3xl font-black tracking-tight`, isDark ? tw`text-white` : tw`text-slate-900`]}>
              Diabetes Care
            </Text>
            <Text style={[tw`text-sm font-medium mt-1`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
              Seu companheiro de saúde diário
            </Text>
          </View>

          {/* Título da seção */}
          <Text style={[tw`text-xl font-bold mb-5`, isDark ? tw`text-white` : tw`text-slate-800`]}>
            Entrar na sua conta
          </Text>

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
              <View style={tw`mb-2`}>
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
                    placeholder="••••••••"
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

          {/* Esqueci a senha */}
          <View style={tw`items-end mb-6`}>
            <Pressable>
              <Text style={tw`text-blue-600 font-semibold text-xs`}>
                Esqueceu a senha?
              </Text>
            </Pressable>
          </View>

          {/* Botão Entrar */}
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
                <Feather name="log-in" size={18} color="white" />
                <Text style={tw`text-white text-center font-bold text-base`}>Entrar</Text>
              </>
            )}
          </Pressable>

          {/* Link para Cadastro */}
          <View style={tw`flex-row justify-center mt-7`}>
            <Text style={[tw`text-sm font-medium`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
              Não tem uma conta?{" "}
            </Text>
            <Pressable onPress={() => router.replace("/register")}>
              <Text style={tw`text-blue-600 font-bold text-sm`}>Cadastre-se</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}