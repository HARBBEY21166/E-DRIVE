"use client"

import { useState, useEffect, useRef } from "react"
import { StyleSheet, View, Text, Dimensions } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
import * as Location from "expo-location"
import { MapPin, Navigation } from "lucide-react-native"

const { width, height } = Dimensions.get("window")
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

const Map = ({
  markers = [],
  showUserLocation = true,
  initialRegion = null,
  onRegionChange = null,
  onPress = null,
  children,
}) => {
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const mapRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    })()
  }, [])

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    )
  }

  const region =
    initialRegion ||
    (location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }
      : null)

  if (!region) {
    return (
      <View style={styles.container}>
        <Text>Loading map...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT} // This uses the default map provider (OSM on Android)
        initialRegion={region}
        onRegionChangeComplete={onRegionChange}
        onPress={onPress}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
      >
        {markers.map((marker, index) => (
          <Marker key={index} coordinate={marker.coordinate} title={marker.title} description={marker.description}>
            {marker.type === "pickup" ? (
              <MapPin color="#4a80f5" size={24} />
            ) : marker.type === "dropoff" ? (
              <Navigation color="#f54a80" size={24} />
            ) : null}
          </Marker>
        ))}
        {children}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  errorText: {
    color: "red",
  },
})

export default Map

