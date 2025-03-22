import * as Location from "expo-location"

// Location types
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationDetails {
  coordinates: Coordinates
  address: string
  name?: string
}

/**
 * Get current location with error handling
 */
export const getCurrentLocation = async (): Promise<LocationDetails | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== "granted") {
      throw new Error("Location permission denied")
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    })
    const { latitude, longitude } = location.coords

    // Get address from coordinates
    const address = await getAddressFromCoordinates(latitude, longitude)

    return {
      coordinates: { latitude, longitude },
      address,
      name: "Current Location",
    }
  } catch (error) {
    console.error("Error getting current location:", error)
    return null
  }
}

/**
 * Get address from coordinates using a simplified approach
 */
export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Try to get the address using Expo's Location API
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    })

    if (reverseGeocode && reverseGeocode.length > 0) {
      const location = reverseGeocode[0]
      const addressParts = [location.street, location.city, location.region, location.country].filter(Boolean)

      return addressParts.join(", ")
    }

    // Fallback to coordinates if reverse geocoding fails
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  } catch (error) {
    console.error("Error getting address from coordinates:", error)
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  }
}

/**
 * Search for places using a simplified approach
 */
export const searchPlaces = async (
  query: string,
  near?: Coordinates,
): Promise<
  Array<{
    id: string
    name: string
    address: string
    coordinates: Coordinates
  }>
> => {
  try {
    if (!query || query.trim().length < 3) {
      return []
    }

    // For simplicity, we'll use mock data for places
    // In a real app, you would integrate with a geocoding service
    const mockPlaces = [
      {
        id: `place_${Math.random().toString(36).substring(2, 10)}`,
        name: `${query} Street`,
        address: `${query} Street, Johannesburg, South Africa`,
        coordinates: {
          latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
          longitude: 28.0473 + (Math.random() - 0.5) * 0.1,
        },
      },
      {
        id: `place_${Math.random().toString(36).substring(2, 10)}`,
        name: `${query} Avenue`,
        address: `${query} Avenue, Sandton, Johannesburg, South Africa`,
        coordinates: {
          latitude: -26.1076 + (Math.random() - 0.5) * 0.1,
          longitude: 28.0567 + (Math.random() - 0.5) * 0.1,
        },
      },
      {
        id: `place_${Math.random().toString(36).substring(2, 10)}`,
        name: `${query} Road`,
        address: `${query} Road, Soweto, Johannesburg, South Africa`,
        coordinates: {
          latitude: -26.2227 + (Math.random() - 0.5) * 0.1,
          longitude: 27.8898 + (Math.random() - 0.5) * 0.1,
        },
      },
    ]

    return mockPlaces
  } catch (error) {
    console.error("Error searching places:", error)
    return []
  }
}

/**
 * Calculate route between two points using a simplified approach
 */
export const calculateRoute = async (
  origin: Coordinates,
  destination: Coordinates,
): Promise<{
  distance: number
  duration: number
  polyline: Coordinates[]
}> => {
  try {
    // Calculate a straight line distance
    const distance = calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude)

    // Estimate duration (2 minutes per km)
    const duration = distance * 2

    // Generate a simple polyline (straight line with some randomness)
    const polyline = generateSimplePolyline(origin, destination)

    return {
      distance,
      duration,
      polyline,
    }
  } catch (error) {
    console.error("Error calculating route:", error)

    // Fallback to a simple straight line
    const polyline = [origin, destination]
    const distance = calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude)
    const duration = distance * 2

    return {
      distance,
      duration,
      polyline,
    }
  }
}

/**
 * Generate a simple polyline with some randomness to simulate a real route
 */
const generateSimplePolyline = (origin: Coordinates, destination: Coordinates): Coordinates[] => {
  const polyline: Coordinates[] = []
  const steps = 10

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps

    // Add some randomness to make it look more like a real route
    const randomLat = (Math.random() - 0.5) * 0.005 * (i > 0 && i < steps ? 1 : 0)
    const randomLng = (Math.random() - 0.5) * 0.005 * (i > 0 && i < steps ? 1 : 0)

    polyline.push({
      latitude: origin.latitude + (destination.latitude - origin.latitude) * fraction + randomLat,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * fraction + randomLng,
    })
  }

  return polyline
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

/**
 * Convert degrees to radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180)
}

/**
 * Get coordinates from address (simplified mock implementation)
 */
export const getCoordinatesFromAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    // In a real app, you would use a geocoding service
    // For now, return random coordinates near Johannesburg
    return {
      latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
      longitude: 28.0473 + (Math.random() - 0.5) * 0.1,
    }
  } catch (error) {
    console.error("Error getting coordinates from address:", error)
    return null
  }
}

