/**
 * Application configuration
 *
 * This file contains configuration settings for the app.
 * In a production environment, these would be environment variables.
 */

// App information
export const APP_NAME = "URide"
export const APP_VERSION = "1.0.0"

// API Keys (replace with your actual keys in production)
export const API_KEYS = {
  // For production, use a paid plan with higher rate limits
  MAPBOX_ACCESS_TOKEN: "pk.your_mapbox_token_here",

  // No API key needed for OpenStreetMap, but respect usage policy
  // https://operations.osmfoundation.org/policies/tiles/

  // For Photon geocoding API (no key required, but respect rate limits)
  // https://photon.komoot.io/

  // For OSRM routing API (no key required for public API, but consider hosting your own for production)
  // http://project-osrm.org/
}

// API Endpoints
export const API_ENDPOINTS = {
  NOMINATIM: "https://nominatim.openstreetmap.org",
  PHOTON: "https://photon.komoot.io/api",
  OSRM: "https://router.project-osrm.org",
  MAPBOX: "https://api.mapbox.com",
}

// Cache settings
export const CACHE_CONFIG = {
  // How long to keep cached data (in milliseconds)
  SEARCH_RESULTS_TTL: 24 * 60 * 60 * 1000, // 24 hours
  ROUTES_TTL: 60 * 60 * 1000, // 1 hour
  LOCATION_TTL: 5 * 60 * 1000, // 5 minutes
}

// Map settings
export const MAP_CONFIG = {
  // Default center coordinates (Johannesburg)
  DEFAULT_LATITUDE: -26.2041,
  DEFAULT_LONGITUDE: 28.0473,
  DEFAULT_ZOOM: 12,

  // Map boundaries for Johannesburg
  JOBURG_BOUNDS: {
    minLat: -26.35,
    maxLat: -26.05,
    minLng: 27.85,
    maxLng: 28.25,
  },
}

// Ride settings
export const RIDE_CONFIG = {
  BASE_PRICE: 50, // Base price in Rand
  PRICE_PER_KM: 10, // Price per kilometer
  PRICE_PER_MINUTE: 0.5, // Price per minute

  // Ride type multipliers
  RIDE_TYPE_MULTIPLIERS: {
    STANDARD: 1.0,
    XL: 1.5,
    PREMIUM: 2.0,
  },
}

// Theme settings
export const THEME_CONFIG = {
  // Light theme colors
  LIGHT: {
    PRIMARY: "#4CAF50",
    SECONDARY: "#2196F3",
    BACKGROUND: "#FFFFFF",
    SURFACE: "#F8FAFC",
    TEXT: "#1E293B",
    TEXT_SECONDARY: "#64748B",
    BORDER: "#E2E8F0",
    ERROR: "#EF4444",
    SUCCESS: "#10B981",
    WARNING: "#F59E0B",
  },

  // Dark theme colors
  DARK: {
    PRIMARY: "#4CAF50",
    SECONDARY: "#2196F3",
    BACKGROUND: "#121212",
    SURFACE: "#1E1E1E",
    TEXT: "#ECEDEE",
    TEXT_SECONDARY: "#A0A0A0",
    BORDER: "#2C2C2C",
    ERROR: "#EF4444",
    SUCCESS: "#10B981",
    WARNING: "#F59E0B",
  },
}

