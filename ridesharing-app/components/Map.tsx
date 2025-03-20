"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { WebView } from "react-native-webview"
import * as Location from "expo-location"

interface Marker {
  id: string
  coordinate: {
    latitude: number
    longitude: number
  }
  title?: string
  description?: string
  isSelected?: boolean
}

interface MapProps {
  initialRegion?: {
    latitude: number
    longitude: number
    latitudeDelta: number
    longitudeDelta: number
  }
  markers?: Marker[]
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

  const [webViewKey, setWebViewKey] = useState(1)

  useEffect(() => {
    if (!initialRegion) {
      ;(async () => {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          console.error("Permission to access location was denied")
          return
        }

        const location = await Location.getCurrentPositionAsync({})
        const { latitude, longitude } = location.coords

        setCurrentLocation({ latitude, longitude })
      })()
    } else {
      setCurrentLocation({
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
      })
    }
  }, [initialRegion])

  // Force WebView refresh when markers or polyline change
  useEffect(() => {
    setWebViewKey((prev) => prev + 1)
  }, [markers, polyline])

  // Create the HTML content for the Leaflet map
  const createLeafletHTML = () => {
    const center = currentLocation ? [currentLocation.latitude, currentLocation.longitude] : [0, 0]

    const markersJS = markers
      .map((marker) => {
        return `
        L.marker([${marker.coordinate.latitude}, ${marker.coordinate.longitude}], {
          icon: ${
            marker.isSelected
              ? 'L.divIcon({className: "selected-marker", html: "<div></div>", iconSize: [20, 20]})'
              : 'L.icon({iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41]})'
          }
        })
        .addTo(map)
        .bindPopup("${(marker.title || "") + (marker.description ? ": " + marker.description : "")}")
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerPress',
            id: '${marker.id}'
          }));
        });
      `
      })
      .join("\n")

    // Add polyline if provided
    const polylineJS = polyline
      ? `
      var polylinePath = [
        ${polyline.map((point) => `[${point.latitude}, ${point.longitude}]`).join(",")}
      ];
      L.polyline(polylinePath, {color: '#4285F4', weight: 5}).addTo(map);
    `
      : ""

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <style>
            body, html, #map {
              height: 100%;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            .selected-marker {
              background-color: #4285F4;
              border-radius: 50%;
              border: 2px solid white;
            }
            .selected-marker div {
              width: 100%;
              height: 100%;
            }
            .pickup-marker {
              background-color: #3B82F6;
              border-radius: 50%;
              border: 2px solid white;
            }
            .destination-marker {
              background-color: #EF4444;
              border-radius: 50%;
              border: 2px solid white;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map').setView([${center[0]}, ${center[1]}], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            ${
              showUserLocation && currentLocation
                ? `
              L.circle([${currentLocation.latitude}, ${currentLocation.longitude}], {
                color: '#4285F4',
                fillColor: '#4285F4',
                fillOpacity: 0.3,
                radius: 50
              }).addTo(map);
            `
                : ""
            }
            
            ${markersJS}
            
            ${polylineJS}
            
            map.on('moveend', function() {
              var center = map.getCenter();
              var bounds = map.getBounds();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'regionChange',
                region: {
                  latitude: center.lat,
                  longitude: center.lng,
                  latitudeDelta: bounds.getNorth() - bounds.getSouth(),
                  longitudeDelta: bounds.getEast() - bounds.getWest()
                }
              }));
            });

            // Handle map click for location selection
            map.on('click', function(e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapClick',
                coordinate: {
                  latitude: e.latlng.lat,
                  longitude: e.latlng.lng
                }
              }));
            });
          </script>
        </body>
      </html>
    `
  }

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)

      if (data.type === "regionChange" && onRegionChange) {
        onRegionChange(data.region)
      } else if (data.type === "markerPress" && onMarkerPress) {
        onMarkerPress(data.id)
      } else if (data.type === "mapClick" && onRegionChange) {
        // Handle map click for location selection
        onRegionChange(data.coordinate)
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error)
    }
  }

  if (!currentLocation) {
    return <View style={styles.loadingContainer} />
  }

  return (
    <View style={styles.container}>
      <WebView
        key={webViewKey}
        originWhitelist={["*"]}
        source={{ html: createLeafletHTML() }}
        style={styles.map}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
})

export default Map

