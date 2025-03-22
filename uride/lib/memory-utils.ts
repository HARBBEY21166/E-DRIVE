/**
 * Utility functions for memory management
 */

import { Platform } from "react-native"

// Function to clear WebView cache
export const clearWebViewCache = async () => {
  if (Platform.OS === "android") {
    try {
      const { default: WebViewAndroid } = await import("react-native-webview")
      if (WebViewAndroid.clearCache) {
        WebViewAndroid.clearCache()
      }
    } catch (error) {
      console.error("Failed to clear WebView cache:", error)
    }
  }
}

// Function to check if device is low on memory
export const isLowMemoryDevice = (): boolean => {
  // This is a simple heuristic - in a real app, you might want to use
  // a more sophisticated approach or a library like react-native-device-info
  return Platform.OS === "android" && Platform.Version < 24
}

// Function to optimize map settings based on device capabilities
export const getOptimizedMapSettings = () => {
  const isLowMem = isLowMemoryDevice()

  return {
    maxMarkers: isLowMem ? 5 : 20,
    maxPolylinePoints: isLowMem ? 50 : 200,
    useSimplifiedTiles: isLowMem,
    initialZoom: isLowMem ? 10 : 13,
    disableAnimation: isLowMem,
  }
}

// Function to release memory when app goes to background
export const releaseMemoryOnBackground = (callback?: () => void) => {
  if (Platform.OS === "android") {
    // Clear any caches or references that might be holding memory
    clearWebViewCache()

    // Run garbage collector (this is just a hint to the system)
    if (global.gc) {
      global.gc()
    }

    // Run any additional cleanup provided by the caller
    if (callback) {
      callback()
    }
  }
}

