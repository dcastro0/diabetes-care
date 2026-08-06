import { GlucoseBadge } from "@/components/ui/GlucoseBadge"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/hooks/useAuth"
import { syncMeasurements } from "@/services/measurementService"
import {
  addMeasurement,
  getUnsyncedMeasurements,
  initMeasurementTable,
  markMeasurementsAsSynced,
} from "@/services/orm/entities/measurement"
import { getGlucoseLevelInfo } from "@/utils/glucoseLevels"
import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import React, { useState } from "react"
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import tw from "twrnc"

export default function MedirScreen() {
  const { authData } = useAuth()
  const { isDark } = useTheme()
  const [value, setValue] = useState(110)
  const [note, setNote] = useState("")
  const [tag, setTag] = useState("Jejum")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const tags = ["Jejum", "Pré-refeição", "Pós-refeição", "Antes de dormir", "Madrugada"]

  const adjustValue = (delta: number) => {
    setValue((prev) => Math.max(20, Math.min(600, prev + delta)))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await initMeasurementTable()
      const noteWithTag = tag ? `[${tag}] ${note}`.trim() : note

      const newId = await addMeasurement(value, noteWithTag)

      if (authData?.token) {
        try {
          const unsynced = await getUnsyncedMeasurements()
          if (unsynced.length > 0) {
            await syncMeasurements(authData.token, unsynced)
            await markMeasurementsAsSynced([newId])
          }
        } catch (syncErr) {
          console.warn("Falha na sincronização online:", syncErr)
        }
      }

      setShowSuccessModal(true)
    } catch (err) {
      console.error("Erro ao salvar medição:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const levelInfo = getGlucoseLevelInfo(value)

  return (
    <SafeAreaView style={[tw`flex-1`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={tw`p-6 pb-24`} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={tw`mb-4 items-center`}>
          <Text style={[tw`text-[11px] font-bold uppercase tracking-widest`, isDark ? tw`text-slate-400` : tw`text-slate-400`]}>
            Novo Registro
          </Text>
          <Text style={[tw`text-2xl font-black`, isDark ? tw`text-white` : tw`text-slate-900`]}>
            Medir Glicemia
          </Text>
        </View>

        {/* Mostrador Circular do Dial Biológico */}
        <View style={tw`items-center my-4`}>
          <View
            style={[
              tw`w-64 h-64 rounded-full items-center justify-center border-4 border-blue-500/40 p-4 shadow-xl`,
              isDark ? tw`bg-slate-900/60` : tw`bg-blue-50/50`,
            ]}
          >
            <View
              style={[
                tw`w-full h-full rounded-full items-center justify-center border p-4 shadow-inner`,
                isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-100`,
              ]}
            >
              <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest mb-1`}>
                Valor Atual
              </Text>

              <View style={tw`flex-row items-baseline gap-1 my-1`}>
                <Text style={[tw`text-6xl font-black tracking-tight`, isDark ? tw`text-white` : tw`text-slate-900`]}>
                  {value}
                </Text>
                <Text style={tw`text-base font-bold text-slate-400`}>mg/dL</Text>
              </View>

              <View style={tw`my-1`}>
                <GlucoseBadge value={value} size="md" />
              </View>
            </View>
          </View>
        </View>

        {/* Botões Táticos do Polegar (+/-) */}
        <View style={tw`flex-row justify-center items-center gap-3 mb-6`}>
          <Pressable
            onPress={() => adjustValue(-10)}
            style={({ pressed }) => [
              tw`w-12 h-12 rounded-2xl border items-center justify-center shadow-sm`,
              isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
              pressed && tw`bg-blue-50`,
            ]}
          >
            <Text style={[tw`text-base font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>-10</Text>
          </Pressable>

          <Pressable
            onPress={() => adjustValue(-1)}
            style={({ pressed }) => [
              tw`w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center shadow-md`,
              pressed && tw`bg-blue-700`,
            ]}
          >
            <Feather name="minus" size={24} color="white" />
          </Pressable>

          <Pressable
            onPress={() => adjustValue(1)}
            style={({ pressed }) => [
              tw`w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center shadow-md`,
              pressed && tw`bg-blue-700`,
            ]}
          >
            <Feather name="plus" size={24} color="white" />
          </Pressable>

          <Pressable
            onPress={() => adjustValue(10)}
            style={({ pressed }) => [
              tw`w-12 h-12 rounded-2xl border items-center justify-center shadow-sm`,
              isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
              pressed && tw`bg-blue-50`,
            ]}
          >
            <Text style={[tw`text-base font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>+10</Text>
          </Pressable>
        </View>

        {/* Seleção de Contexto (Tags) */}
        <View style={tw`mb-5`}>
          <Text style={[tw`text-xs font-bold uppercase tracking-wider mb-2.5`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
            Contexto da Medição
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`gap-2 pb-1`}>
            {tags.map((t) => (
              <Pressable
                key={t}
                onPress={() => setTag(t)}
                style={[
                  tw`px-4 py-2 rounded-full border`,
                  tag === t
                    ? tw`bg-blue-600 border-blue-600`
                    : isDark
                    ? tw`bg-slate-900 border-slate-800`
                    : tw`bg-white border-slate-200/80`,
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-bold`,
                    tag === t ? tw`text-white` : isDark ? tw`text-slate-300` : tw`text-slate-600`,
                  ]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Nota Opcional */}
        <View style={tw`mb-6`}>
          <Text style={[tw`text-xs font-bold uppercase tracking-wider mb-1.5`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
            Observação (Opcional)
          </Text>
          <View
            style={[
              tw`rounded-2xl p-3.5 border shadow-sm flex-row items-center`,
              isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`,
            ]}
          >
            <Feather name="edit-3" size={16} color={(tw.color("slate-400") as string)} style={tw`mr-2`} />
            <TextInput
              style={[tw`flex-1 text-sm font-medium`, isDark ? tw`text-white` : tw`text-slate-800`]}
              placeholder="Ex: após 30min de caminhada..."
              placeholderTextColor={(tw.color("slate-400") as string)}
              value={note}
              onChangeText={setNote}
            />
          </View>
        </View>

        {/* Botão de Confirmação Principal */}
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={({ pressed }) => [
            tw`bg-blue-600 py-4 rounded-2xl flex-row justify-center items-center gap-2 shadow-lg shadow-blue-200`,
            pressed && tw`bg-blue-700`,
            isSaving && tw`opacity-70`,
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Feather name="check" size={20} color="white" />
              <Text style={tw`text-white text-center font-bold text-base`}>
                Salvar Leitura
              </Text>
            </>
          )}
        </Pressable>

        {/* Modal de Sucesso com o Mascote Glico */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSuccessModal}
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={tw`flex-1 justify-center items-center bg-slate-900/70 p-6`}>
            <View
              style={[
                tw`w-full rounded-3xl p-6 border shadow-2xl items-center`,
                isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200`,
              ]}
            >
              <View style={tw`w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-3`}>
                <Feather name="check-circle" size={36} color={(tw.color("emerald-600") as string)} />
              </View>
              <Text style={[tw`text-xl font-bold text-center mb-1`, isDark ? tw`text-white` : tw`text-slate-800`]}>
                Registro Salvo!
              </Text>
              <Text style={[tw`text-sm text-center mb-4 leading-5`, isDark ? tw`text-slate-300` : tw`text-slate-600`]}>
                {levelInfo.feedback}
              </Text>

              <Pressable
                onPress={() => {
                  setShowSuccessModal(false)
                  router.replace("/(tabs)")
                }}
                style={tw`bg-blue-600 py-3.5 px-8 rounded-2xl w-full items-center`}
              >
                <Text style={tw`text-white font-bold text-sm`}>Voltar ao Painel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  )
}