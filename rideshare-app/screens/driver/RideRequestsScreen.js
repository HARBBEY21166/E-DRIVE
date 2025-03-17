"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MapPin, Navigation, Clock, DollarSign, Star } from "lucide-react-native"
import Map from "../../components/common/Map"

const RideRequestsScreen = ({ navigation }) => {
  const [timeLeft, setTimeLeft] = useState(15) // Seconds to accept/decline

  // Mock ride request data
  const rideRequest = {
    id: "123456",
    rider: {
      name: "Jane Smith",
      rating: 4.7,
      photo: "/placeholder.svg?height=100&width=100",
    },
    pickup: "123 Main St, San Francisco",
    dropoff: "456 Market St, San Francisco",
    distance: 3.2, // miles
    duration: 12, // minutes
    fare: 15.5,
  }

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

  React.useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          // Auto-decline after time expires
          navigation.navigate("DriverHome")
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigation])

  const handleAccept = () => {
    navigation.navigate("CurrentRide", { rideRequest })
  }

  const handleDecline = () => {
    navigation.navigate("DriverHome")
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Ride Request</Text>
        <View style={styles.timerContainer}>
          <Clock size={16} color="#f54a4a" />
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <Map markers={markers} />
      </View>

      <View style={styles.rideDetailsContainer}>
        <View style={styles.riderInfo}>
          <Image source={{ uri: rideRequest.rider.photo }} style={styles.riderPhoto} />
          <View style={styles.riderDetails}>
            <Text style={styles.riderName}>{rideRequest.rider.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{rideRequest.rider.rating}</Text>
            </View>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <MapPin size={20} color="#4a80f5" />
            <Text style={styles.routeText}>{rideRequest.pickup}</Text>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routePoint}>
            <Navigation size={20} color="#f54a80" />
            <Text style={styles.routeText}>{rideRequest.dropoff}</Text>
          </View>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.tripDetail}>
            <Clock size={16} color="#666" />
            <Text style={styles.tripDetailText}>{rideRequest.duration} min</Text>
          </View>
          <View style={styles.tripDetail}>
            <MapPin size={16} color="#666" />
            <Text style={styles.tripDetailText}>{rideRequest.distance} mi</Text>
          </View>
          <View style={styles.tripDetail}>
            <DollarSign size={16} color="#666" />
            <Text style={styles.tripDetailText}>${rideRequest.fare.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.declineButton]} onPress={handleDecline}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={handleAccept}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 74, 74, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  timerText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: "#f54a4a",
  },
  mapContainer: {
    height: "40%",
  },
  rideDetailsContainer: {
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
    justifyContent: "center",
  },
  riderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
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
  routeText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  routeDivider: {
    height: 20,
    width: 1,
    backgroundColor: "#ddd",
    marginLeft: 10,
  },
  tripDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tripDetail: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tripDetailText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f54a4a",
    marginRight: 8,
  },
  declineButtonText: {
    color: "#f54a4a",
    fontSize: 16,
    fontWeight: "bold",
  },
  acceptButton: {
    backgroundColor: "#4a80f5",
    marginLeft: 8,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default RideRequestsScreen

