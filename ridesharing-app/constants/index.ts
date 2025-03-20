// App constants
export const APP_NAME = "URide"
export const APP_VERSION = "1.0.0"

// API constants
export const API_URL = "https://api.example.com"
export const API_TIMEOUT = 10000 // 10 seconds

// Map constants
export const DEFAULT_LATITUDE = 37.7749
export const DEFAULT_LONGITUDE = -122.4194
export const DEFAULT_LATITUDE_DELTA = 0.0922
export const DEFAULT_LONGITUDE_DELTA = 0.0421

// Ride constants
export const MIN_RIDE_PRICE = 5.0
export const PRICE_PER_KM = 1.5
export const PRICE_PER_MINUTE = 0.2
export const BASE_FARE = 2.5

// Auth constants
export const MIN_PASSWORD_LENGTH = 8

// UI constants
export const PRIMARY_COLOR = "#4285F4"
export const SECONDARY_COLOR = "#34A853"
export const DANGER_COLOR = "#EA4335"
export const WARNING_COLOR = "#FBBC05"
export const SUCCESS_COLOR = "#34A853"
export const BACKGROUND_COLOR = "#F8FAFC"
export const TEXT_COLOR = "#1E293B"
export const BORDER_RADIUS = 8

// Animation constants
export const ANIMATION_DURATION = 300

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user",
  RECENT_LOCATIONS: "recent_locations",
  THEME: "theme",
}

// Navigation routes
export const ROUTES = {
  WELCOME: "/(auth)/welcome",
  SIGN_IN: "/(auth)/sign-in",
  SIGN_UP: "/(auth)/sign-up",
  HOME: "/(root)/(tabs)/home",
  RIDES: "/(root)/(tabs)/rides",
  PROFILE: "/(root)/(tabs)/profile",
  CHAT: "/(root)/(tabs)/chat",
  BOOK_RIDE: "/(root)/book-ride",
  FIND_RIDE: "/(root)/find-ride",
  CONFIRM_RIDE: "/(root)/confirm-ride",
}

