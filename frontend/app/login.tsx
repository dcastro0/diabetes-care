import { useAuth } from "@/hooks/useAuth"
import { LoginFormValues, loginSchema } from "@/schema/loginSchema"
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

export default function LoginScreen() {
  const { signIn } = useAuth() 

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // 3. signIn agora retorna os dados do usuário
      const userData = (await signIn(data)) as { streak_count?: number } | undefined

      // 4. Usamos os dados retornados, e não o estado
      const streak = userData?.streak_count ?? 0
      if (streak && streak > 0) {
        Alert.alert(
          "Bem-vindo de volta!",
          `Sua sequência atual é de ${streak} dia(s). Continue assim!`,
        )
      } else {
        Alert.alert(
          "Bem-vindo!",
          "Boa sorte no seu controle. Registre sua primeira medição hoje!",
        )
      }
      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert(
        "Erro no Login",
        error.message || "Não foi possível entrar.",
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
            <View style={tw`bg-blue-100 p-5 rounded-full mb-4`}>
              <Feather name="droplet" size={48} color={tw.color("blue-600")} />
            </View>
            <Text style={tw`text-3xl font-bold text-slate-800`}>Diabetes Care</Text>
            <Text style={tw`text-base text-slate-500`}>Controle na palma da mão</Text>
          </View>

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
                    placeholder="Digite sua senha"
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

          <View style={tw`items-end mb-6`}>
            {/* TODO: Implementar recuperação de senha */}
            <Pressable>
              <Text style={tw`text-blue-600 font-semibold`}>Esqueceu a senha?</Text>
            </Pressable>
          </View>

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
              <Text style={tw`text-white text-center font-bold text-base`}>Entrar</Text>
            )}
          </Pressable>

          <View style={tw`flex-row justify-center mt-8`}>
            <Text style={tw`text-slate-500`}>Não tem uma conta? </Text>
            <Pressable onPress={() => router.replace("/register")}>
              <Text style={tw`text-blue-600 font-bold`}>Cadastre-se</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}