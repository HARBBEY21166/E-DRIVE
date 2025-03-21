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

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    })
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
    // Use Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "RidesharingApp/1.0",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

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
 * Search for places using Photon API (better for Johannesburg)
 * @param query The search query
 * @param near Optional coordinates to search near
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

    const encodedQuery = encodeURIComponent(query)

    // Johannesburg bounding box (approximate)
    const joburg_bbox = "27.85,-26.35,28.25,-26.05"

    // Use Photon API which has better coverage for Johannesburg
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodedQuery}&bbox=${joburg_bbox}&limit=5`, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "RidesharingApp/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Photon API error: ${response.status}`)
    }

    const data = await response.json()

    // Filter results to Johannesburg area
    const results = data.features
      .filter((feature: any) => {
        const properties = feature.properties
        return (
          properties.city === "Johannesburg" || properties.name === "Johannesburg" || properties.state === "Gauteng"
        )
      })
      .map((feature: any) => {
        const properties = feature.properties
        const coordinates = feature.geometry.coordinates

        // Format the display address
        let address = properties.name || ""

        if (properties.street) {
          address += address ? `, ${properties.street}` : properties.street
        }

        if (properties.district) {
          address += address ? `, ${properties.district}` : properties.district
        }

        if (properties.city) {
          address += address ? `, ${properties.city}` : properties.city
        }

        return {
          id: `place_${Math.random().toString(36).substring(2, 10)}`,
          name: properties.name || address.split(",")[0],
          address: address,
          coordinates: {
            latitude: coordinates[1],
            longitude: coordinates[0],
          },
        }
      })

    return results
  } catch (error) {
    console.error("Error searching places:", error)

    // Fallback to Nominatim if Photon fails
    return searchPlacesWithNominatim(query, near)
  }
}

/**
 * Fallback search using Nominatim
 */
const searchPlacesWithNominatim = async (
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
    const encodedQuery = encodeURIComponent(query)

    // Build the URL with parameters
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&countrycodes=za`

    // Add viewbox parameter to focus search on Johannesburg area
    const johannesburgViewbox = "27.85,-26.35,28.25,-26.05"
    url += `&viewbox=${johannesburgViewbox}&bounded=1`

    const response = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "RidesharingApp/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()

    return data.map((item: any) => ({
      id: item.place_id.toString(),
      name: item.display_name.split(",")[0],
      address: item.display_name,
      coordinates: {
        latitude: Number.parseFloat(item.lat),
        longitude: Number.parseFloat(item.lon),
      },
    }))
  } catch (error) {
    console.error("Error searching places with Nominatim:", error)
    return []
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
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`)
    }

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

/**
 * Calculate ride price based on distance and duration
 */
export const calculateRidePrice = (
  distance: number,
  duration: number,
  rideType: "standard" | "xl" | "premium" = "standard",
): number => {
  // Base price in Rand
  const basePrice = 50

  // Price per km
  const pricePerKm = 10

  // Calculate standard price
  const standardPrice = basePrice + distance * pricePerKm

  // Apply multiplier based on ride type
  switch (rideType) {
    case "xl":
      return standardPrice * 1.5
    case "premium":
      return standardPrice * 2
    case "standard":
    default:
      return standardPrice
  }
}

/**
 * Get coordinates from address using Nominatim (OpenStreetMap)
 */
export const getCoordinatesFromAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "RidesharingApp/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.length > 0) {
      const { lat, lon } = data[0]
      return {
        latitude: Number.parseFloat(lat),
        longitude: Number.parseFloat(lon),
      }
    }

    return null
  } catch (error) {
    console.error("Error getting coordinates from address:", error)
    return null
  }
}

