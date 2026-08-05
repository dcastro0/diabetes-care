import { useAuth } from "@/hooks/useAuth"
import { Achievement, getAchievements } from "@/services/achievementsServices"
import { Feather } from "@expo/vector-icons"
import { useFocusEffect } from "expo-router"
import React, { useCallback, useState } from "react"
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    SafeAreaView,
    Text,
    View,
} from "react-native"
import tw from "twrnc"

const getIconColor = (unlocked: boolean) => {
    return unlocked ? tw.style("bg-blue-500") : tw.style("bg-slate-300")
}

const AchievementCard = ({ item }: { item: Achievement }) => (
    <View
        style={tw.style(
            `w-[48%] bg-white p-4 rounded-3xl mb-4 shadow-md shadow-slate-200`,
            !item.unlocked && `opacity-60`,
        )}
    >
        <View
            style={tw.style(
                `p-3 self-start rounded-full mb-3`,
                getIconColor(item.unlocked),
            )}
        >
            <Feather
                name={(item.icon || "award") as any}
                size={24}
                color={item.unlocked ? "white" : tw.color("slate-500")}
            />
        </View>

        <Text style={tw`text-base font-bold text-slate-800 mb-1`}>{item.title}</Text>
        <Text style={tw`text-sm text-slate-500 mb-4 h-10`}>{item.description}</Text>

        {item.progress !== undefined && !item.unlocked ? (
            <View>
                <Text style={tw`text-xs text-slate-500 font-medium self-end mb-1`}>
                    {item.progress} / {item.goal}
                </Text>
                <View style={tw`bg-slate-200 rounded-full h-2 w-full`}>
                    <View
                        style={tw.style(`bg-slate-400 rounded-full h-2`, {
                            width: `${item.goal ? (item.progress / item.goal) * 100 : 0}%`,
                        })}
                    />
                </View>
            </View>
        ) : (
            <View style={tw`h-7`} />
        )}
    </View>
)

export default function AchievementsScreen() {
    const { authData } = useAuth()
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchData = useCallback(async () => {
        if (!authData?.token) {
            setError("Usuário não autenticado.")
            setIsLoading(false)
            return
        }

        setError(null)
        try {
            const data = await getAchievements(authData.token)
            setAchievements(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido")
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [authData?.token])

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true)
            fetchData()
        }, [fetchData]),
    )

    const onRefresh = () => {
        setIsRefreshing(true)
        fetchData()
    }

    const ListHeader = (
        <View style={tw`mb-8 mt-8 pt-4`}>
            <Text style={tw`text-3xl font-bold text-slate-800 text-center`}>
                🏆 Minhas Conquistas
            </Text>
        </View>
    )

    if (isLoading && !isRefreshing) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-slate-50`}>
                <ActivityIndicator size="large" color={tw.color("blue-500")} />
                <Text style={tw`mt-4 text-slate-500`}>Carregando conquistas...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-slate-50 p-6`}>
                <Text style={tw`text-lg text-red-500 mb-4 text-center`}>{error}</Text>
                <Pressable
                    onPress={fetchData}
                    style={tw`bg-blue-500 px-6 py-3 rounded-full`}
                >
                    <Text style={tw`text-white font-bold`}>Tentar Novamente</Text>
                </Pressable>
            </View>
        )
    }

    return (
        <SafeAreaView style={tw`flex-1 bg-slate-50`}>
            <FlatList
                data={achievements}
                renderItem={({ item }) => <AchievementCard item={item} />}
                keyExtractor={(item) => item.achievement_id.toString()}
                numColumns={2}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={tw`p-6`}
                columnWrapperStyle={tw`justify-between`}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[tw.color("blue-500") as string]}
                        tintColor={tw.color("blue-500")}
                    />
                }
                ListEmptyComponent={
                    <View style={tw`flex-1 justify-center items-center mt-16`}>
                        <Text style={tw`text-lg text-slate-500`}>
                            Nenhuma conquista encontrada.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    )
}