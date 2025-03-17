"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Phone, MessageSquare, Navigation, CheckCircle, MapPin } from "lucide-react-native"
import Map from "../../components/common/Map"
import AsyncStorage from "@react-native-async-storage/async-storage"

const CurrentRideScreen = ({ navigation, route }) => {
  const { rideRequest } = route.params
  const [rideStatus, setRideStatus] = useState("drivingToPickup") // drivingToPickup, arrivedAtPickup, inProgress, completed
  const [eta, setEta] = useState(rideRequest.duration)

  // Mock markers for the map
  const markers = [
    {
      coordinate: { latitude: 37.78825, longitude: -122.4324 },
      title: "Pickup",
      description: rideRequest.pickup,
      type: "pickup",
    },
    {
      coordinate: { latitude: 37.7749, longitude: -122.4194 },
      title: "Dropoff",
      description: rideRequest.dropoff,
      type: "dropoff",
    },
  ]

  // Simulate ride flow
  useEffect(() => {
    if (rideStatus === "drivingToPickup") {
      // Simulate arriving at pickup
      const timer = setTimeout(() => {
        setRideStatus("arrivedAtPickup")
      }, 5000)
      return () => clearTimeout(timer)
    }

    if (rideStatus === "arrivedAtPickup") {
      // No automatic transition - driver must confirm pickup
    }

    if (rideStatus === "inProgress") {
      // Simulate ride completion
      const timer = setTimeout(() => {
        setRideStatus("completed")
      }, 5000)
      return () => clearTimeout(timer)
    }

    if (rideStatus === "completed") {
      // Update driver stats
      const updateStats = async () => {
        try {
          // Get current stats
          const currentEarnings = await AsyncStorage.getItem("driverEarnings")
          const currentRides = await AsyncStorage.getItem("driverRides")
          const currentHours = await AsyncStorage.getItem("driverHours")

          // Calculate new stats
          const newEarnings = (Number.parseFloat(currentEarnings) || 0) + rideRequest.fare
          const newRides = (Number.parseInt(currentRides) || 0) + 1
          const newHours = (Number.parseFloat(currentHours) || 0) + rideRequest.duration / 60

          // Save updated stats
          await AsyncStorage.setItem("driverEarnings", newEarnings.toString())
          await AsyncStorage.setItem("driverRides", newRides.toString())
          await AsyncStorage.setItem("driverHours", newHours.toString())
        } catch (e) {
          console.log("Failed to update driver stats", e)
        }
      }

      updateStats()
    }
  }, [rideStatus, rideRequest])

  const handlePickupRider = () => {
    setRideStatus("inProgress")
    setEta(rideRequest.duration)
  }

  const handleCompleteRide = () => {
    navigation.navigate("DriverHome")
  }

  const renderStatusContent = () => {
    switch (rideStatus) {
      case "drivingToPickup":
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Driving to pickup location</Text>
            <Text style={styles.statusDescription}>Navigate to the rider's pickup location</Text>
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>ETA:</Text>
              <Text style={styles.etaTime}>{eta} min</Text>
            </View>
          </View>
        )
      case "arrivedAtPickup":
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Arrived at pickup location</Text>
            <Text style={styles.statusDescription}>Wait for {rideRequest.rider.name} to arrive</Text>
            <TouchableOpacity style={styles.actionButton} onPress={handlePickupRider}>
              <Text style={styles.actionButtonText}>Start Ride</Text>
            </TouchableOpacity>
          </View>
        )
      case "inProgress":
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Ride in progress</Text>
            <Text style={styles.statusDescription}>Navigate to the destination</Text>
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>ETA:</Text>
              <Text style={styles.etaTime}>{eta} min</Text>
            </View>
          </View>
        )
      case "completed":
        return (
          <View style={styles.completedContainer}>
            <CheckCircle size={48} color="#4CAF50" />
            <Text style={styles.completedTitle}>Ride Completed</Text>
            <Text style={styles.completedDescription}>You've earned ${rideRequest.fare.toFixed(2)}</Text>
            <TouchableOpacity style={styles.actionButton} onPress={handleCompleteRide}>
              <Text style={styles.actionButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Current Ride</Text>
      </View>

      <View style={styles.mapContainer}>
        <Map markers={markers} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.riderInfo}>
          <Image source={{ uri: rideRequest.rider.photo }} style={styles.riderPhoto} />
          <View style={styles.riderDetails}>
            <Text style={styles.riderName}>{rideRequest.rider.name}</Text>
            <Text style={styles.fareText}>${rideRequest.fare.toFixed(2)}</Text>
          </View>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton}>
              <Phone size={20} color="#4a80f5" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <MessageSquare size={20} color="#4a80f5" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <View style={styles.routeIconContainer}>
              <MapPin size={20} color="#4a80f5" />
            </View>
            <Text style={styles.routeText}>{rideRequest.pickup}</Text>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routePoint}>
            <View style={styles.routeIconContainer}>
              <Navigation size={20} color="#f54a80" />
            </View>
            <Text style={styles.routeText}>{rideRequest.dropoff}</Text>
          </View>
        </View>

        {renderStatusContent()}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  mapContainer: {
    height: "40%",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  riderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  riderPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  fareText: {
    fontSize: 14,
    color: "#4a80f5",
    fontWeight: "bold",
  },
  contactButtons: {
    flexDirection: "row",
  },
  contactButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  routeInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  routeIconContainer: {
    width: 36,
    alignItems: "center",
  },
  routeText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  routeDivider: {
    height: 20,
    width: 1,
    backgroundColor: "#ddd",
    marginLeft: 18,
  },
  statusContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginTop: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  etaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  etaLabel: {
    fontSize: 14,
    color: "#666",
  },
  etaTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  actionButton: {
    backgroundColor: "#4a80f5",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  completedContainer: {
    alignItems: "center",
    padding: 20,
    marginTop: 16,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#333",
  },
  completedDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
})

export default CurrentRideScreen

