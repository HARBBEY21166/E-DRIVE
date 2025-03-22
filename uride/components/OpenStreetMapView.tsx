"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { View, StyleSheet, Platform, Text, ActivityIndicator, TouchableOpacity } from "react-native"
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

interface OpenStreetMapViewProps {
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

const OpenStreetMapView: React.FC<OpenStreetMapViewProps> = ({
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
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const webViewRef = useRef<WebView>(null)

  useEffect(() => {
    if (showUserLocation) {
      ;(async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync()
          if (status !== "granted") {
            console.error("Permission to access location was denied")
            return
          }

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced, // Lower accuracy to save battery
          })
          const { latitude, longitude } = location.coords

          setCurrentLocation({ latitude, longitude })
        } catch (error) {
          console.error("Error getting location:", error)
          // Use default location if we can't get the user's location
          if (initialRegion) {
            setCurrentLocation({
              latitude: initialRegion.latitude,
              longitude: initialRegion.longitude,
            })
          }
        }
      })()
    }
  }, [showUserLocation, initialRegion])

  // Only update the WebView when necessary to avoid performance issues
  useEffect(() => {
    // Only force refresh when markers or polyline change significantly
    if (markers.length > 0 || polyline?.length > 0) {
      setWebViewKey((prev) => prev + 1)
    }
  }, [markers.length, polyline?.length > 0 ? polyline.length : 0])

  // Create the HTML content for the Leaflet map
  const createLeafletHTML = () => {
    const center = currentLocation
      ? [currentLocation.latitude, currentLocation.longitude]
      : initialRegion
        ? [initialRegion.latitude, initialRegion.longitude]
        : [-26.2041, 28.0473] // Default to Johannesburg

    // Optimize marker rendering - only render up to 10 markers to avoid performance issues
    const limitedMarkers = markers.slice(0, 10)

    const markersJS = limitedMarkers
      .map((marker) => {
        const isPickup = marker.id === "pickup"
        const isDestination = marker.id === "destination"

        let markerColor = marker.isSelected ? "#4CAF50" : "#3388ff"
        if (isPickup) markerColor = "#4CAF50"
        if (isDestination) markerColor = "#ff4500"

        return `
          L.marker([${marker.coordinate.latitude}, ${marker.coordinate.longitude}], {
            icon: L.divIcon({
              className: '${isPickup ? "pickup-marker" : isDestination ? "destination-marker" : "default-marker"}',
              html: '<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
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

    // Add polyline if provided - limit points to improve performance
    let polylineJS = ""
    if (polyline && polyline.length > 0) {
      // Sample the polyline to reduce points if there are too many
      const sampledPolyline =
        polyline.length > 100 ? polyline.filter((_, i) => i % Math.ceil(polyline.length / 100) === 0) : polyline

      polylineJS = `
        var polylinePath = [
          ${sampledPolyline.map((point) => `[${point.latitude}, ${point.longitude}]`).join(",")}
        ];
        L.polyline(polylinePath, {color: '#4CAF50', weight: 5}).addTo(map);
      `
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body, html, #map {
              height: 100%;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            .pickup-marker {
              background-color: #4CAF50;
              border-radius: 50%;
              border: 2px solid white;
            }
            .destination-marker {
              background-color: #ff4500;
              border-radius: 50%;
              border: 2px solid white;
            }
            .default-marker {
              background-color: #3388ff;
              border-radius: 50%;
              border: 2px solid white;
            }
            .selected-marker {
              background-color: #4CAF50;
              border-radius: 50%;
              border: 2px solid white;
            }
            .leaflet-control-attribution {
              font-size: 8px;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            // Create map with lower zoom level for better performance
            var map = L.map('map', {
              zoomControl: false,  // Disable zoom controls for better performance
              attributionControl: false  // Disable attribution for better performance
            }).setView([${center[0]}, ${center[1]}], 12);
            
            // Use a simpler tile layer for better performance
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 18,
              minZoom: 8
            }).addTo(map);
            
            ${
              showUserLocation && currentLocation
                ? `
                L.circle([${currentLocation.latitude}, ${currentLocation.longitude}], {
                  color: '#4CAF50',
                  fillColor: '#4CAF50',
                  fillOpacity: 0.3,
                  radius: 50
                }).addTo(map);
              `
                : ""
            }
            
            ${markersJS}
            
            ${polylineJS}
            
            // Throttle map events for better performance
            var lastMoveEnd = 0;
            map.on('moveend', function() {
              var now = Date.now();
              if (now - lastMoveEnd > 300) { // Only send updates every 300ms
                lastMoveEnd = now;
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
              }
            });

            // Handle map click for location selection - throttled
            var lastClick = 0;
            map.on('click', function(e) {
              var now = Date.now();
              if (now - lastClick > 500) { // Only send clicks every 500ms
                lastClick = now;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'mapClick',
                  coordinate: {
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                  }
                }));
              }
            });
            
            // Signal that the map is loaded
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));
          </script>
        </body>
      </html>
    `
  }

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)

      if (data.type === "mapLoaded") {
        setIsLoading(false)
      } else if (data.type === "regionChange" && onRegionChange) {
        onRegionChange(data.region)
      } else if (data.type === "markerPress" && onMarkerPress) {
        onMarkerPress(data.id)
      } else if (data.type === "mapClick" && onRegionChange) {
        onRegionChange({
          coordinate: data.coordinate,
          action: "click",
        })
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error)
    }
  }

  if (!currentLocation && !initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={[styles.map, styles.webFallback]}>
          <Text>Map is not available in this preview. Please run on a device or emulator.</Text>
        </View>
      ) : (
        <>
          <WebView
            ref={webViewRef}
            key={webViewKey}
            originWhitelist={["*"]}
            source={{ html: createLeafletHTML() }}
            style={styles.map}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={false}
            onError={(error) => {
              console.error("WebView error:", error)
              setHasError(true)
            }}
            onHttpError={(error) => {
              console.error("WebView HTTP error:", error)
              setHasError(true)
            }}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
              </View>
            )}
            cacheEnabled={true}
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          )}
          {hasError && (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorText}>Failed to load map</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setHasError(false)
                  setWebViewKey((prev) => prev + 1)
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
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
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  webFallback: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
  },
})

export default OpenStreetMapView

