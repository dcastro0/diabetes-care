import { GlucoseBadge } from "@/components/ui/GlucoseBadge"
import { useTheme } from "@/contexts/ThemeContext"
import {
  deleteMeasurement,
  getMeasurements,
  initMeasurementTable,
  Measurement,
} from "@/services/orm/entities/measurement"
import { exportHistoryPdf, previewHistoryPdf } from "@/services/pdfService"
import { getGlucoseLevelInfo, GlucoseLevel } from "@/utils/glucoseLevels"
import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import tw from "twrnc"

const ITEM_HEIGHT = 76

interface ItemRowProps {
  item: Measurement
  onDelete: (id: number) => void
  isDark: boolean
}

const ItemRow: React.FC<ItemRowProps> = ({ item, onDelete, isDark }) => {
  const formattedDate = item.date
    ? new Date(item.date).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Data inválida"

  const handleDeletePress = () => {
    if (item.id !== undefined) {
      onDelete(item.id)
    }
  }

  return (
    <View style={[
      tw`flex-row items-center justify-between px-4 py-3 rounded-2xl mb-2.5 border shadow-sm`,
      isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-100`
    ]}>
      <View style={tw`flex-row items-center gap-3 flex-1 mr-2`}>
        <View style={isDark ? tw`bg-slate-800 p-2.5 rounded-2xl` : tw`bg-slate-100 p-2.5 rounded-2xl`}>
          <Feather name="droplet" size={16} color={isDark ? (tw.color("blue-400") as string) : (tw.color("blue-600") as string)} />
        </View>
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center gap-2 mb-0.5`}>
            <Text style={[tw`text-base font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
              {item.value} mg/dL
            </Text>
            <GlucoseBadge value={item.value} size="sm" />
          </View>
          <Text style={tw`text-xs text-slate-400`} numberOfLines={1}>
            {formattedDate} {item.note ? `• ${item.note}` : ""}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={handleDeletePress}
        style={({ pressed }) => [
          tw`p-2 rounded-xl`,
          pressed && (isDark ? tw`bg-slate-800` : tw`bg-red-50`),
        ]}
        hitSlop={8}
      >
        <Feather name="trash-2" size={18} color={(tw.color("red-500") as string)} />
      </Pressable>
    </View>
  )
}

const MemoizedItemRow = React.memo(ItemRow)

const EmptyList = ({ filterActive, isDark }: { filterActive: boolean; isDark: boolean }) => (
  <View style={tw`items-center justify-center py-16 px-4`}>
    <View style={isDark ? tw`bg-slate-800 p-4 rounded-full mb-3` : tw`bg-slate-100 p-4 rounded-full mb-3`}>
      <Feather name="file-text" size={32} color={(tw.color("slate-400") as string)} />
    </View>
    <Text style={[tw`text-base font-bold text-center`, isDark ? tw`text-slate-300` : tw`text-slate-700`]}>
      {filterActive
        ? "Nenhum registro com este filtro"
        : "Nenhuma medição cadastrada"}
    </Text>
    <Text style={tw`text-xs text-slate-400 text-center mt-1`}>
      {filterActive
        ? "Tente selecionar outra categoria de glicemia."
        : "As medições salvas serão listadas aqui no seu ritmo."}
    </Text>
  </View>
)

export default function HistoricoScreen() {
  const { isDark } = useTheme()
  const [allMeasurements, setAllMeasurements] = useState<Measurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [activeFilter, setActiveFilter] = useState<GlucoseLevel | "todos">("todos")

  const loadData = useCallback(async () => {
    try {
      await initMeasurementTable()
      const rows = await getMeasurements()
      const sorted = rows.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      setAllMeasurements(sorted)
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
      Alert.alert("Erro", "Não foi possível carregar o histórico.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    loadData()
  }, [loadData])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    loadData()
  }, [loadData])

  const handleDelete = useCallback(
    (idToDelete: number) => {
      Alert.alert(
        "Confirmar Exclusão",
        "Tem certeza que deseja remover este registro do histórico?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Remover",
            style: "destructive",
            onPress: async () => {
              const previousMeasurements = allMeasurements
              setAllMeasurements((current) =>
                current.filter((m) => m.id !== idToDelete),
              )
              try {
                await deleteMeasurement(idToDelete)
              } catch (error) {
                console.error("Erro ao deletar medição:", error)
                setAllMeasurements(previousMeasurements)
                Alert.alert("Erro", "Não foi possível remover o registro.")
              }
            },
          },
        ],
        { cancelable: true },
      )
    },
    [allMeasurements],
  )

  const filteredMeasurements = useMemo(() => {
    if (activeFilter === "todos") {
      return allMeasurements
    }
    return allMeasurements.filter(
      (m) => getGlucoseLevelInfo(m.value).level === activeFilter,
    )
  }, [allMeasurements, activeFilter])

  const handlePreviewPdf = async () => {
    setIsGeneratingPdf(true)
    await previewHistoryPdf(filteredMeasurements)
    setIsGeneratingPdf(false)
  }

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true)
    await exportHistoryPdf(filteredMeasurements)
    setIsGeneratingPdf(false)
  }

  const keyExtractor = useCallback((item: Measurement) => item.id!.toString(), [])
  const renderItem = useCallback(
    ({ item }: { item: Measurement }) => (
      <MemoizedItemRow item={item} onDelete={handleDelete} isDark={isDark} />
    ),
    [handleDelete, isDark],
  )
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  )

  const filterOptions: { label: string; value: GlucoseLevel | "todos"; color: string }[] = [
    { label: "Todos", value: "todos", color: "bg-slate-200 text-slate-700 border-slate-300" },
    { label: "Bom", value: "bom", color: "bg-green-100 text-green-700 border-green-200" },
    { label: "Atenção", value: "atencao", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { label: "Risco", value: "risco", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { label: "Alto Risco", value: "alto_risco", color: "bg-red-100 text-red-700 border-red-200" },
  ]

  if (isLoading && allMeasurements.length === 0) {
    return (
      <SafeAreaView style={[tw`flex-1 justify-center items-center`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
        <ActivityIndicator size="large" color={(tw.color("blue-600") as string)} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
      {/* Cabeçalho */}
      <View style={[tw`p-4 border-b shadow-sm`, isDark ? tw`bg-slate-900 border-slate-800` : tw`bg-white border-slate-200/80`]}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <View style={tw`flex-row items-center gap-3`}>
            <Pressable onPress={() => router.back()} style={tw`p-2 rounded-full`}>
              <Feather name="arrow-left" size={20} color={isDark ? (tw.color("slate-200") as string) : (tw.color("slate-700") as string)} />
            </Pressable>
            <View>
              <Text style={[tw`text-xs font-semibold uppercase tracking-wider`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
                Relatório Médico
              </Text>
              <Text style={[tw`text-2xl font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>Histórico</Text>
            </View>
          </View>

          {/* Botões de Ação para Visualizar e Exportar PDF */}
          <View style={tw`flex-row items-center gap-2`}>
            <Pressable
              onPress={handlePreviewPdf}
              disabled={isGeneratingPdf || filteredMeasurements.length === 0}
              style={({ pressed }) => [
                tw`flex-row items-center gap-1.5 px-3 py-2 rounded-2xl border`,
                isDark ? tw`bg-slate-800 border-slate-700` : tw`bg-slate-50 border-slate-300`,
                pressed && (isDark ? tw`bg-slate-700` : tw`bg-slate-100`),
                (isGeneratingPdf || filteredMeasurements.length === 0) && tw`opacity-50`,
              ]}
            >
              {isGeneratingPdf ? (
                <ActivityIndicator size="small" color={isDark ? "white" : (tw.color("slate-600") as string)} />
              ) : (
                <Feather name="eye" size={15} color={isDark ? "white" : (tw.color("slate-700") as string)} />
              )}
              <Text style={[tw`font-bold text-xs`, isDark ? tw`text-white` : tw`text-slate-700`]}>
                Ver
              </Text>
            </Pressable>

            <Pressable
              onPress={handleExportPdf}
              disabled={isGeneratingPdf || filteredMeasurements.length === 0}
              style={({ pressed }) => [
                tw`flex-row items-center gap-1.5 px-3 py-2 rounded-2xl bg-blue-600 shadow-sm`,
                pressed && tw`bg-blue-700`,
                (isGeneratingPdf || filteredMeasurements.length === 0) && tw`opacity-50 bg-slate-400`,
              ]}
            >
              <Feather name="share-2" size={15} color="white" />
              <Text style={tw`font-bold text-xs text-white`}>
                Exportar PDF
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Filtros de Categoria */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-1`}>
          {filterOptions.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setActiveFilter(opt.value)}
              style={[
                tw`px-3.5 py-1.5 rounded-full border mr-2`,
                activeFilter === opt.value
                  ? tw`${opt.color.split(" ")[0]} border-transparent`
                  : isDark
                  ? tw`bg-slate-800 border-slate-700`
                  : tw`bg-white border-slate-200`,
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-bold`,
                  activeFilter === opt.value
                    ? tw`${opt.color.split(" ")[1]}`
                    : isDark
                    ? tw`text-slate-300`
                    : tw`text-slate-500`,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Registros */}
      <FlatList
        data={filteredMeasurements}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<EmptyList filterActive={activeFilter !== "todos"} isDark={isDark} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[(tw.color("blue-600") as string)]}
            tintColor={(tw.color("blue-600") as string)}
          />
        }
        getItemLayout={getItemLayout}
        contentContainerStyle={tw`p-4`}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={11}
      />
    </SafeAreaView>
  )
}