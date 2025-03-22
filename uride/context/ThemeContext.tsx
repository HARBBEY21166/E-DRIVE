"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useColorScheme } from "react-native"
import { THEME_CONFIG } from "../lib/config"
import { getUserPreferences, saveUserPreferences } from "../lib/cache"

// Theme type
export type ThemeType = "light" | "dark" | "system"

// Theme context interface
interface ThemeContextType {
  theme: ThemeType
  isDarkMode: boolean
  colors: typeof THEME_CONFIG.LIGHT | typeof THEME_CONFIG.DARK
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme() as "light" | "dark"
  const [theme, setThemeState] = useState<ThemeType>("system")

  // Determine if dark mode is active
  const isDarkMode = theme === "system" ? systemColorScheme === "dark" : theme === "dark"

  // Get current theme colors
  const colors = isDarkMode ? THEME_CONFIG.DARK : THEME_CONFIG.LIGHT

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const preferences = await getUserPreferences()
        if (preferences && preferences.theme) {
          setThemeState(preferences.theme)
        }
      } catch (error) {
        console.error("Error loading theme preference:", error)
      }
    }

    loadThemePreference()
  }, [])

  // Set theme and save preference
  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme)

    try {
      const preferences = (await getUserPreferences()) || {}
      await saveUserPreferences({
        ...preferences,
        theme: newTheme,
      })
    } catch (error) {
      console.error("Error saving theme preference:", error)
    }
  }

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark"
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, colors, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

