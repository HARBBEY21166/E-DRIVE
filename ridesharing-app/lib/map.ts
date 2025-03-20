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
 * Get current location
 */
export const getCurrentLocation = async (): Promise<LocationDetails | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== "granted") {
      console.error("Permission to access location was denied")
      return null
    }

    const location = await Location.getCurrentPositionAsync({})
    const { latitude, longitude } = location.coords

    // Get address from coordinates
    const address = await getAddressFromCoordinates(latitude, longitude)

    return {
      coordinates: { latitude, longitude },
      address,
    }
  } catch (error) {
    console.error("Error getting current location:", error)
    return null
  }
}

/**
 * Get address from coordinates using Nominatim (OpenStreetMap)
 */
export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // First try using Expo Location
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })

      if (result.length > 0) {
        const { street, city, region, postalCode, country } = result[0]
        const addressParts = [street, city, region, postalCode, country].filter(Boolean)
        return addressParts.join(", ")
      }
    } catch (error) {
      console.log("Expo reverse geocode failed, trying Nominatim")
    }

    // Fallback to Nominatim API (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "RidesharingApp/1.0",
        },
      },
    )

    const data = await response.json()

    if (data && data.display_name) {
      return data.display_name
    }

    return "Unknown location"
  } catch (error) {
    console.error("Error getting address from coordinates:", error)
    return "Unknown location"
  }
}

/**
 * Get coordinates from address using Nominatim (OpenStreetMap)
 */
export const getCoordinatesFromAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    // First try using Expo Location
    try {
      const result = await Location.geocodeAsync(address)

      if (result.length > 0) {
        const { latitude, longitude } = result[0]
        return { latitude, longitude }
      }
    } catch (error) {
      console.log("Expo geocode failed, trying Nominatim")
    }

    // Fallback to Nominatim API (OpenStreetMap)
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "RidesharingApp/1.0",
      },
    })

    const data = await response.json()

    if (data && data.length > 0) {
      return {
        latitude: Number.parseFloat(data[0].lat),
        longitude: Number.parseFloat(data[0].lon),
      }
    }

    return null
  } catch (error) {
    console.error("Error getting coordinates from address:", error)
    return null
  }
}

/**
 * Calculate route between two points using OSRM (Open Source Routing Machine)
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
    // Use OSRM API for routing
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`,
    )

    const data = await response.json()

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      throw new Error("Failed to calculate route")
    }

    const route = data.routes[0]

    // Convert distance from meters to kilometers
    const distance = route.distance / 1000

    // Convert duration from seconds to minutes
    const duration = route.duration / 60

    // Extract polyline coordinates
    const polyline: Coordinates[] = route.geometry.coordinates.map((coord: [number, number]) => ({
      longitude: coord[0],
      latitude: coord[1],
    }))

    return {
      distance,
      duration,
      polyline,
    }
  } catch (error) {
    console.error("Error calculating route:", error)

    // Fallback to a simple straight line if API fails
    const steps = 10
    const polyline: Coordinates[] = []

    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps
      polyline.push({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * fraction,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * fraction,
      })
    }

    // Calculate mock distance and duration
    const distance = calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude)

    const duration = distance * 2 // Rough estimate: 2 minutes per km

    return {
      distance,
      duration,
      polyline,
    }
  }
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

