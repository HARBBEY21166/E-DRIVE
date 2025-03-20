"use client"

import { useEffect } from "react"
import { Stack } from "expo-router"
import { useRouter } from "expo-router"
import useStore from "../../store"

const RootLayout = () => {
  const router = useRouter()
  const { isAuthenticated, initialize, isLoading } = useStore()

  useEffect(() => {
    const init = async () => {
      await initialize()

      if (!isAuthenticated) {
        router.replace("/(auth)/welcome")
      }
    }

    init()
  }, [isAuthenticated])

  if (isLoading) {
    // You could return a loading screen here
    return null
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book-ride" />
      <Stack.Screen name="find-ride" />
      <Stack.Screen name="confirm-ride" />
    </Stack>
  )
}

export default RootLayout

