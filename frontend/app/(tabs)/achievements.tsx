import { useTheme } from "@/contexts/ThemeContext"
import { useAchievementsQuery } from "@/hooks/useAchievementsQuery"
import { useAuth } from "@/hooks/useAuth"
import { Achievement } from "@/services/achievementsServices"
import { Feather } from "@expo/vector-icons"
import React from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import tw from "twrnc"

const AchievementCard = ({ item, isDark }: { item: Achievement; isDark: boolean }) => {
  const percent = item.goal ? Math.min(100, Math.round((item.progress / item.goal) * 100)) : 0

  return (
    <View
      style={[
        tw`w-[48%] p-4.5 rounded-3xl mb-4 border shadow-sm flex-col justify-between`,
        isDark
          ? item.unlocked
            ? tw`bg-slate-900 border-emerald-500/40`
            : tw`bg-slate-900/60 border-slate-800 opacity-80`
          : item.unlocked
          ? tw`bg-white border-emerald-200`
          : tw`bg-white border-slate-200/80 opacity-80`,
      ]}
    >
      <View>
        <View style={tw`flex-row justify-between items-start mb-3`}>
          <View
            style={[
              tw`p-3 rounded-2xl border`,
              item.unlocked
                ? tw`bg-emerald-50 border-emerald-200`
                : isDark
                ? tw`bg-slate-800 border-slate-700`
                : tw`bg-slate-100 border-slate-200`,
            ]}
          >
            <Feather
              name={(item.icon || "award") as any}
              size={20}
              color={
                item.unlocked
                  ? (tw.color("emerald-600") as string)
                  : (tw.color("slate-400") as string)
              }
            />
          </View>
          {item.unlocked ? (
            <View style={tw`bg-emerald-100 px-2 py-0.5 rounded-full`}>
              <Text style={tw`text-[10px] font-bold text-emerald-700`}>Concluído</Text>
            </View>
          ) : (
            <View style={isDark ? tw`bg-slate-800 px-2 py-0.5 rounded-full` : tw`bg-slate-100 px-2 py-0.5 rounded-full`}>
              <Text style={isDark ? tw`text-[10px] font-bold text-slate-300` : tw`text-[10px] font-bold text-slate-500`}>{percent}%</Text>
            </View>
          )}
        </View>

        <Text style={[tw`text-sm font-bold mb-1`, isDark ? tw`text-white` : tw`text-slate-800`]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[tw`text-xs mb-3 leading-4 h-9`, isDark ? tw`text-slate-400` : tw`text-slate-500`]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View>
        {!item.unlocked && item.progress !== undefined ? (
          <View>
            <View style={tw`flex-row justify-between mb-1`}>
              <Text style={tw`text-[10px] font-semibold text-slate-400 uppercase`}>Progresso</Text>
              <Text style={isDark ? tw`text-[10px] font-bold text-slate-300` : tw`text-[10px] font-bold text-slate-600`}>
                {item.progress}/{item.goal}
              </Text>
            </View>
            <View style={isDark ? tw`bg-slate-800 rounded-full h-1.5 w-full overflow-hidden` : tw`bg-slate-100 rounded-full h-1.5 w-full overflow-hidden`}>
              <View
                style={[
                  tw`bg-blue-600 h-1.5 rounded-full`,
                  { width: `${percent}%` },
                ]}
              />
            </View>
          </View>
        ) : (
          <View style={tw`flex-row items-center gap-1 mt-1`}>
            <Feather name="check-circle" size={12} color={(tw.color("emerald-600") as string)} />
            <Text style={tw`text-xs font-semibold text-emerald-600`}>Alcançado</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default function AchievementsScreen() {
  const { authData } = useAuth()
  const { isDark } = useTheme()
  const { data: achievements = [], isLoading, error, refetch, isRefetching } = useAchievementsQuery(authData?.token)

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length
  const overallPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  const ListHeader = (
    <View style={tw`mb-6 mt-2`}>
      <View style={tw`items-center mb-4`}>
        <Text style={[tw`text-xs font-bold uppercase tracking-widest`, isDark ? tw`text-slate-400` : tw`text-slate-500`]}>
          Acompanhamento Médico
        </Text>
        <Text style={[tw`text-2xl font-bold`, isDark ? tw`text-white` : tw`text-slate-800`]}>
          Conquistas Clínicas
        </Text>
      </View>

      {/* Banner de Resumo de Progresso */}
      <View style={tw`bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <View style={tw`flex-row items-center gap-2`}>
            <Feather name="shield" size={18} color={(tw.color("blue-400") as string)} />
            <Text style={tw`text-xs font-bold text-slate-300 uppercase tracking-wider`}>
              Progresso do Acompanhamento
            </Text>
          </View>
          <Text style={tw`text-xs font-bold text-blue-400`}>{overallPercent}% Concluído</Text>
        </View>

        <View style={tw`flex-row items-baseline gap-2 mb-2`}>
          <Text style={tw`text-3xl font-black text-white`}>{unlockedCount}</Text>
          <Text style={tw`text-sm font-semibold text-slate-400`}>de {totalCount} metas alcançadas</Text>
        </View>

        <View style={tw`bg-slate-800 rounded-full h-2 w-full overflow-hidden`}>
          <View
            style={[
              tw`bg-blue-500 h-2 rounded-full`,
              { width: `${overallPercent}%` },
            ]}
          />
        </View>
      </View>
    </View>
  )

  if (isLoading && !isRefetching) {
    return (
      <SafeAreaView style={[tw`flex-1 justify-center items-center`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
        <ActivityIndicator size="large" color={(tw.color("blue-600") as string)} />
        <Text style={tw`mt-4 text-xs font-semibold text-slate-500`}>Carregando conquistas clínicas...</Text>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={[tw`flex-1 justify-center items-center p-6`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
        <Text style={tw`text-base font-bold text-red-500 mb-4 text-center`}>
          {error instanceof Error ? error.message : "Erro ao carregar conquistas"}
        </Text>
        <Pressable
          onPress={() => refetch()}
          style={tw`bg-blue-600 px-6 py-3 rounded-2xl`}
        >
          <Text style={tw`text-white font-bold text-sm`}>Tentar Novamente</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, isDark ? tw`bg-slate-950` : tw`bg-slate-50`]}>
      <FlatList
        data={achievements}
        renderItem={({ item }) => <AchievementCard item={item} isDark={isDark} />}
        keyExtractor={(item) => item.achievement_id.toString()}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={tw`p-6`}
        columnWrapperStyle={tw`justify-between`}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[(tw.color("blue-600") as string)]}
            tintColor={(tw.color("blue-600") as string)}
          />
        }
        ListEmptyComponent={
          <View style={tw`flex-1 justify-center items-center mt-12 p-8 bg-white rounded-3xl border border-slate-200/80`}>
            <Feather name="award" size={32} color={(tw.color("slate-300") as string)} style={tw`mb-2`} />
            <Text style={tw`text-sm font-bold text-slate-600`}>Nenhuma conquista registrada</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}