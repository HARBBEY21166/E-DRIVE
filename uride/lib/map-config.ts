/**
 * Map configuration for the app
 * This file contains settings for OpenStreetMap integration
 */

// OpenStreetMap tile servers
export const OSM_TILE_SERVERS = [
  "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
]

// Attribution required by OpenStreetMap license
export const OSM_ATTRIBUTION = "© OpenStreetMap contributors"

// Default map center (Johannesburg)
export const DEFAULT_CENTER = {
  latitude: -26.2041,
  longitude: 28.0473,
}

// Default zoom levels
export const DEFAULT_ZOOM = {
  city: 12,
  neighborhood: 15,
  street: 17,
}

// Map style for react-native-maps
export const MAP_STYLE = {
  // No custom styles needed for OpenStreetMap
}

// Photon API for geocoding (free and open source)
export const PHOTON_API = "https://photon.komoot.io/api/"

// OSRM API for routing (free and open source)
export const OSRM_API = "https://router.project-osrm.org/route/v1/driving/"

// Nominatim API for reverse geocoding (free and open source)
export const NOMINATIM_API = "https://nominatim.openstreetmap.org/"

// Usage policy compliance
// Make sure to follow OpenStreetMap usage policy:
// - Include attribution
// - Don't make too many requests in a short time
// - Consider setting up your own tile server for production use
export const USAGE_POLICY = {
  // Maximum requests per minute to avoid being blocked
  MAX_REQUESTS_PER_MINUTE: 60,
  // User agent to identify your app (required by Nominatim)
  USER_AGENT: "URide-App/1.0",
}

