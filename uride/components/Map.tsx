"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { StyleSheet, View, Text, ActivityIndicator } from "react-native"
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps"
import * as Location from "expo-location"

// Interface for map markers
interface MapMarker {
  id: string
  coordinate: {
    latitude: number
    longitude: number
  }
  title?: string
  description?: string
  isSelected?: boolean
}

// Main Map component props
interface MapProps {
  initialRegion?: {
    latitude: number
    longitude: number
    latitudeDelta: number
    longitudeDelta: number
  }
  markers?: MapMarker[]
  onRegionChange?: (region: any) => void
  onMarkerPress?: (markerId: string) => void
  showUserLocation?: boolean
  polyline?: Array<{ latitude: number; longitude: number }>
}

const Map: React.FC<MapProps> = ({
  initialRegion,
  markers = [],
  onRegionChange,
  onMarkerPress,
  showUserLocation = true,
  polyline,
}) => {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Default region (Johannesburg)
  const defaultRegion = {
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }

  useEffect(() => {
    if (showUserLocation) {
      ;(async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync()
          if (status !== "granted") {
            setError("Location permission denied")
            setIsLoading(false)
            return
          }

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          })
          const { latitude, longitude } = location.coords

          setCurrentLocation({ latitude, longitude })
          setIsLoading(false)
        } catch (err) {
          console.error("Error getting location:", err)
          setError("Failed to get location")
          setIsLoading(false)
        }
      })()
    } else {
      setIsLoading(false)
    }
  }, [showUserLocation])

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  const region =
    initialRegion ||
    (currentLocation
      ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
      : defaultRegion)

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={onRegionChange}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            identifier={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={
              marker.id === "pickup"
                ? "green"
                : marker.id === "destination"
                  ? "red"
                  : marker.isSelected
                    ? "green"
                    : "blue"
            }
            onPress={() => onMarkerPress && onMarkerPress(marker.id)}
          />
        ))}

        {polyline && polyline.length > 1 && <Polyline coordinates={polyline} strokeWidth={4} strokeColor="#4CAF50" />}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    textAlign: "center",
    padding: 20,
  },
})

export default Map

