"use client"

import { Stack } from "expo-router"
import { ThemeProvider } from "../context/ThemeContext"
import { AuthProvider } from "../context/AuthContext"
import ErrorBoundary from "../components/ErrorBoundary"
import { View, Text, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import * as SplashScreen from "expo-splash-screen"

// Keep the splash screen visible while we initialize
SplashScreen.preventAutoHideAsync()

export default function AppLayout() {
  const [appIsReady, setAppIsReady] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  // Skip font loading to simplify the app
  const [fontsLoaded] = useState(true)

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any data or resources here
        await new Promise((resolve) => setTimeout(resolve, 500)) // Artificial delay for smoother transition
      } catch (e) {
        console.warn("Error during app initialization:", e)
        setInitError("Failed to initialize app resources")
      } finally {
        // Tell the application to render
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  useEffect(() => {
    if (appIsReady) {
      // Hide the splash screen once everything is ready
      SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null // Keep showing the splash screen
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Startup Error</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
        <Text style={styles.errorHint}>Please restart the application</Text>
      </View>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>The application encountered an unexpected error</Text>
          <Text style={styles.errorHint}>Please restart the application</Text>
        </View>
      }
    >
      <AuthProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(root)" />
            <Stack.Screen name="(driver)" />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ff3b30",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  errorHint: {
    fontSize: 14,
    color: "#666",
  },
})

