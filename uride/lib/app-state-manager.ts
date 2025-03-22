"use client"

import { useEffect } from "react"
import { AppState, type AppStateStatus } from "react-native"
import { clearWebViewCache, releaseMemoryOnBackground } from "./memory-utils"

/**
 * Hook to manage app state changes and optimize resource usage
 */
export function useAppStateManager() {
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "background") {
        // App is going to background, release resources
        console.log("App going to background, releasing resources")
        releaseMemoryOnBackground()
      } else if (nextAppState === "active") {
        // App is coming to foreground
        console.log("App coming to foreground")
      }
    }

    // Subscribe to app state changes
    const subscription = AppState.addEventListener("change", handleAppStateChange)

    // Clean up on unmount
    return () => {
      subscription.remove()
    }
  }, [])

  // Return any methods that might be useful to components
  return {
    clearCache: clearWebViewCache,
  }
}

