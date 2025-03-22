"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert } from "react-native"
import { useRouter } from "expo-router"
import Map from "../../components/Map"
import CustomButton from "../../components/CustomButton"
import { useTheme } from "../../context/ThemeContext"
import { getCurrentLocation, calculateRoute } from "../../lib/map"

const ActiveRideScreen = () => {
  const router = useRouter()
  const { colors, isDarkMode } = useTheme()

  const [isLoading, setIsLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<any>(null)
  const [rideStatus, setRideStatus] = useState<"to_pickup" | "arrived" | "in_progress" | "completed">("to_pickup")
  const [route, setRoute] = useState<any>(null)
  const [rideTimer, setRideTimer] = useState(0)

  // Mock ride data
  const [ride] = useState({
    id: "ride_" + Math.random().toString(36).substring(2, 10),
    rider: {
      name: "John Smith",
      rating: 4.8,
      phone: "+27 123 456 7890",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    pickup: {
      address: "123 Main St, Johannesburg",
      coordinates: {
        latitude: -26.2041,
        longitude: 28.0473,
      },
    },
    destination: {
      address: "456 Market St, Johannesburg",
      coordinates: {
        latitude: -26.1917,
        longitude: 28.0323,
      },
    },
    fare: 120,
    distance: 5.2,
    duration: 15,
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    // Start timer when ride is in progress
    if (rideStatus === "in_progress") {
      const interval = setInterval(() => {
        setRideTimer((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [rideStatus])

  const loadInitialData = async () => {
    setIsLoading(true)

    try {
      // Get current location
      const location = await getCurrentLocation()
      if (location) {
        setCurrentLocation(location)

        // Calculate route to pickup
        const routeData = await calculateRoute(location.coordinates, ride.pickup.coordinates)

        setRoute(routeData)
      }
    } catch (err) {
      console.error("Error loading ride data:", err)
      Alert.alert("Error", "Failed to load ride data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleArrived = async () => {
    setRideStatus("arrived")

    // Notify rider (in a real app, this would be done through your backend)
    Alert.alert("Rider Notified", "The rider has been notified of your arrival.")
  }

  const handleStartRide = async () => {
    setRideStatus("in_progress")

    try {
      // Calculate route to destination
      if (currentLocation) {
        const routeData = await calculateRoute(currentLocation.coordinates, ride.destination.coordinates)

        setRoute(routeData)
      }
    } catch (err) {
      console.error("Error calculating route:", err)
    }
  }

  const handleCompleteRide = () => {
    setRideStatus("completed")

    // Show fare summary
    Alert.alert(
      "Ride Completed",
      `Fare: R${ride.fare.toFixed(2)}\nDistance: ${ride.distance.toFixed(1)} km\nDuration: ${formatTime(rideTimer)}`,
      [{ text: "OK", onPress: () => router.replace("/(driver)/(tabs)/home") }],
    )
  }

  const handleCancelRide = () => {
    Alert.alert("Cancel Ride", "Are you sure you want to cancel this ride? This may affect your rating.", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => {
          // In a real app, you would call your API to cancel the ride
          router.replace("/(driver)/(tabs)/home")
        },
      },
    ])
  }

  const handleCallRider = () => {
    // In a real app, you would integrate with the device's phone functionality
    Alert.alert("Call Rider", `Would you like to call ${ride.rider.name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => console.log("Calling rider:", ride.rider.phone) },
    ])
  }

  const handleMessageRider = () => {
    // In a real app, you would navigate to a chat screen
    router.push("/(driver)/chat")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const renderRideInfo = () => {
    let title = ""
    let buttonText = ""
    let buttonAction = () => {}

    switch (rideStatus) {
      case "to_pickup":
        title = "Heading to Pickup"
        buttonText = "Arrived at Pickup"
        buttonAction = handleArrived
        break
      case "arrived":
        title = "Waiting for Rider"
        buttonText = "Start Ride"
        buttonAction = handleStartRide
        break
      case "in_progress":
        title = "Ride in Progress"
        buttonText = "Complete Ride"
        buttonAction = handleCompleteRide
        break
      case "completed":
        title = "Ride Completed"
        buttonText = "Return to Home"
        buttonAction = () => router.replace("/(driver)/(tabs)/home")
        break
    }

    return (
      <View style={[styles.rideInfoCard, { backgroundColor: colors.SURFACE }]}>
        <View style={styles.rideInfoHeader}>
          <Text style={[styles.rideInfoTitle, { color: colors.TEXT }]}>{title}</Text>
          {rideStatus === "in_progress" && (
            <View style={styles.timerContainer}>
              <Text style={[styles.timerText, { color: colors.PRIMARY }]}>{formatTime(rideTimer)}</Text>
            </View>
          )}
        </View>

        <View style={styles.riderInfo}>
          <Image source={{ uri: ride.rider.avatar }} style={styles.riderAvatar} />
          <View style={styles.riderDetails}>
            <Text style={[styles.riderName, { color: colors.TEXT }]}>{ride.rider.name}</Text>
            <View style={styles.ratingContainer}>
              <Image source={require("../../assets/icons/star.png")} style={styles.starIcon} />
              <Text style={[styles.ratingText, { color: colors.TEXT }]}>{ride.rider.rating}</Text>
            </View>
          </View>

          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: colors.BORDER }]}
              onPress={handleMessageRider}
            >
              <Image
                source={require("../../assets/icons/chat.png")}
                style={[styles.contactIcon, { tintColor: colors.TEXT }]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: colors.PRIMARY }]}
              onPress={handleCallRider}
            >
              <Image
                source={require("../../assets/icons/phone.svg")}
                style={[styles.contactIcon, { tintColor: "#FFFFFF" }]}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <View style={styles.dotContainer}>
              <View style={[styles.dot, styles.pickupDot]} />
              <View style={styles.dotLine} />
            </View>
            <Text style={[styles.locationText, { color: colors.TEXT }]} numberOfLines={1}>
              {ride.pickup.address}
            </Text>
          </View>

          <View style={styles.locationRow}>
            <View style={styles.dotContainer}>
              <View style={[styles.dot, styles.destinationDot]} />
            </View>
            <Text style={[styles.locationText, { color: colors.TEXT }]} numberOfLines={1}>
              {ride.destination.address}
            </Text>
          </View>
        </View>

        <View style={styles.rideDetailsContainer}>
          <View style={styles.rideDetailItem}>
            <Text style={[styles.rideDetailValue, { color: colors.TEXT }]}>R{ride.fare.toFixed(2)}</Text>
            <Text style={[styles.rideDetailLabel, { color: colors.TEXT_SECONDARY }]}>Fare</Text>
          </View>

          <View style={styles.rideDetailDivider} />

          <View style={styles.rideDetailItem}>
            <Text style={[styles.rideDetailValue, { color: colors.TEXT }]}>{ride.distance.toFixed(1)} km</Text>
            <Text style={[styles.rideDetailLabel, { color: colors.TEXT_SECONDARY }]}>Distance</Text>
          </View>

          <View style={styles.rideDetailDivider} />

          <View style={styles.rideDetailItem}>
            <Text style={[styles.rideDetailValue, { color: colors.TEXT }]}>{ride.duration} min</Text>
            <Text style={[styles.rideDetailLabel, { color: colors.TEXT_SECONDARY }]}>Duration</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {rideStatus !== "completed" && (
            <CustomButton
              title="Cancel Ride"
              onPress={handleCancelRide}
              style={[styles.cancelButton, { backgroundColor: colors.BORDER }]}
              textStyle={{ color: colors.ERROR }}
              primary={false}
            />
          )}
          <CustomButton title={buttonText} onPress={buttonAction} style={styles.actionButton} />
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <View style={styles.mapContainer}>
        <Map
          showUserLocation={true}
          initialRegion={
            currentLocation
              ? {
                  latitude: currentLocation.coordinates.latitude,
                  longitude: currentLocation.coordinates.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }
              : undefined
          }
          markers={[
            ...(rideStatus === "to_pickup" || rideStatus === "arrived"
              ? [
                  {
                    id: "pickup",
                    coordinate: ride.pickup.coordinates,
                    title: "Pickup",
                    description: ride.pickup.address,
                  },
                ]
              : []),
            ...(rideStatus === "in_progress" || rideStatus === "completed"
              ? [
                  {
                    id: "destination",
                    coordinate: ride.destination.coordinates,
                    title: "Destination",
                    description: ride.destination.address,
                  },
                ]
              : []),
          ]}
          polyline={route?.polyline}
        />
      </View>

      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.SURFACE }]}
          onPress={() => router.back()}
        >
          <Image
            source={require("../../assets/icons/back-arrow.png")}
            style={[styles.backIcon, { tintColor: colors.TEXT }]}
          />
        </TouchableOpacity>

        <View style={styles.contentContainer}>{renderRideInfo()}</View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  rideInfoCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rideInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rideInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  timerContainer: {
    backgroundColor: "rgba(66, 133, 244, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  riderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  riderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
  },
  contactButtons: {
    flexDirection: "row",
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  contactIcon: {
    width: 16,
    height: 16,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dotContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pickupDot: {
    backgroundColor: "#3B82F6",
  },
  destinationDot: {
    backgroundColor: "#EF4444",
  },
  dotLine: {
    position: "absolute",
    top: 12,
    width: 2,
    height: 24,
    backgroundColor: "#CBD5E1",
  },
  locationText: {
    flex: 1,
    fontSize: 14,
  },
  rideDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  rideDetailItem: {
    flex: 1,
    alignItems: "center",
  },
  rideDetailValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  rideDetailLabel: {
    fontSize: 12,
  },
  rideDetailDivider: {
    width: 1,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    flex: 2,
    marginLeft: 8,
  },
})

export default ActiveRideScreen

