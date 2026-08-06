// app/historico.tsx

import { Feather } from "@expo/vector-icons"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import tw from "twrnc"

import {
  deleteMeasurement,
  getMeasurements,
  initMeasurementTable,
  Measurement,
} from "@/services/orm/entities/measurement"
import { generateHistoryPdf } from "@/services/pdfService"
import { getGlucoseLevelInfo, GlucoseLevel } from "@/utils/glucoseLevels"

const ITEM_HEIGHT = 72

interface ItemRowProps {
  item: Measurement
  onDelete: (id: number) => void
}

const ItemRow: React.FC<ItemRowProps> = ({ item, onDelete }) => {
  const levelInfo = getGlucoseLevelInfo(item.value)

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
    <View
      style={tw`flex-row items-center justify-between px-4 py-3 h-[${ITEM_HEIGHT}px]`}
    >
      <View style={tw`flex-row items-center gap-3 flex-1 mr-2`}>
        <View style={[tw`p-2 rounded-full`, tw`${levelInfo.bgColorClass}`]}>
          <Feather name="droplet" size={18} color={(tw.color(levelInfo.colorClass.replace('text-', '')) as string) || "blue"} />
        </View>
        <View style={tw`flex-1`}>
          <Text style={[tw`text-lg font-semibold`, tw`${levelInfo.colorClass}`]}>
            {item.value} mg/dL
          </Text>
          <Text style={tw`text-sm text-slate-500`} numberOfLines={1}>
            {formattedDate}
          </Text>
          {item.note && (
            <Text style={tw`text-xs text-slate-400 mt-0.5`} numberOfLines={1}>
              {item.note}
            </Text>
          )}
        </View>
      </View>
      <Pressable
        onPress={handleDeletePress}
        style={({ pressed }) => [
          tw`p-2 rounded-full`,
          pressed && tw`bg-red-100`,
        ]}
        hitSlop={10}
      >
        <Feather name="trash-2" size={20} color={(tw.color("red-500") as string)} />
      </Pressable>
    </View>
  )
}

const MemoizedItemRow = React.memo(ItemRow)

const ItemSeparator = () => <View style={styles.separator} />

const EmptyList = ({ filterActive }: { filterActive: boolean }) => (
  <View style={tw`items-center justify-center py-16 px-4`}>
    <Feather name="info" size={40} color={(tw.color("slate-400") as string)} />
    <Text style={tw`mt-4 text-lg text-slate-500 text-center`}>
      {filterActive
        ? "Nenhuma medição encontrada para este filtro."
        : "Nenhuma medição registrada ainda."}
    </Text>
  </View>
)

export default function HistoricoScreen() {
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
        "Tem certeza que deseja remover este registro?",
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

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true)
    await generateHistoryPdf(filteredMeasurements)
    setIsGeneratingPdf(false)
  }

  const keyExtractor = useCallback((item: Measurement) => item.id!.toString(), [])
  const renderItem = useCallback(
    ({ item }: { item: Measurement }) => (
      <MemoizedItemRow item={item} onDelete={handleDelete} />
    ),
    [handleDelete],
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
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-slate-50`}>
        <ActivityIndicator size="large" color={(tw.color("blue-600") as string)} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      <View style={tw`p-4 bg-white border-b border-slate-200 shadow-sm`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-2xl font-bold text-slate-800`}>Histórico</Text>
          <Pressable
            onPress={handleGeneratePdf}
            disabled={isGeneratingPdf || filteredMeasurements.length === 0}
            style={({ pressed }) => [
              tw`flex-row items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500`,
              pressed && tw`bg-blue-50`,
              (isGeneratingPdf || filteredMeasurements.length === 0) &&
                tw`opacity-50 border-slate-300`,
            ]}
          >
            {isGeneratingPdf ? (
              <ActivityIndicator size="small" color={(tw.color("blue-600") as string)} />
            ) : (
              <Feather name="share" size={16} color={(tw.color("blue-600") as string)} />
            )}
            <Text
              style={[
                tw`font-semibold text-blue-600`,
                (isGeneratingPdf || filteredMeasurements.length === 0) && tw`text-slate-400`,
              ]}
            >
              Gerar PDF
            </Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-1`}>
          {filterOptions.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setActiveFilter(opt.value)}
              style={[
                tw`px-4 py-2 rounded-full border mr-2`,
                activeFilter === opt.value
                  ? tw`${opt.color.split(' ')[0]} border-transparent`
                  : tw`bg-white border-slate-300`,
              ]}
            >
              <Text style={[
                tw`font-semibold`,
                activeFilter === opt.value
                  ? tw`${opt.color.split(' ')[1]}`
                  : tw`text-slate-600`,
              ]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredMeasurements}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={<EmptyList filterActive={activeFilter !== 'todos'} />}
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

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: (tw.color("slate-200") as string),
  },
})