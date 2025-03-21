"use client"

import { useEffect } from "react"
import { Stack } from "expo-router"
import { useRouter } from "expo-router"
import useStore from "../../store"

const AuthLayout = () => {
  const router = useRouter()
  const { isAuthenticated, initialize, isLoading } = useStore()

  useEffect(() => {
    const init = async () => {
      await initialize()

      if (isAuthenticated) {
        router.replace("/(root)/(tabs)/home")
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
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  )
}

export default AuthLayout

