"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Switch, Alert } from "react-native"
import { useRouter } from "expo-router"
import Map from "../../../components/Map"
import CustomButton from "../../../components/CustomButton"
import { useAuth } from "../../../context/AuthContext"
import { useTheme } from "../../../context/ThemeContext"
import { getCurrentLocation } from "../../../lib/map"
import ErrorAlert from "../../../components/ErrorAlert"

const DriverHomeScreen = () => {
  const router = useRouter()
  const { user, toggleDriverMode, updateDriverDetails } = useAuth()
  const { colors, isDarkMode } = useTheme()

  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<any>(null)
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    total: 0,
  })
  const [pendingRide, setPendingRide] = useState<any>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load driver status
      if (user?.driverDetails) {
        setIsOnline(user.driverDetails.isActive || false)

        // Load earnings
        if (user.driverDetails.earnings) {
          setEarnings({
            today: user.driverDetails.earnings.today || 0,
            week: user.driverDetails.earnings.week || 0,
            total: user.driverDetails.earnings.total || 0,
          })
        }
      }

      // Get current location
      const location = await getCurrentLocation()
      if (location) {
        setCurrentLocation(location)

        // Update driver location in database
        if (user?.driverDetails?.isActive) {
          await updateDriverDetails({
            currentLocation: location.coordinates,
          })
        }
      }

      // Check for pending rides (in a real app, this would come from your backend)
      // For demo purposes, we'll simulate a pending ride after a delay if driver is online
      if (user?.driverDetails?.isActive) {
        setTimeout(() => {
          simulatePendingRide()
        }, 5000)
      }
    } catch (err) {
      console.error("Error loading driver data:", err)
      setError("Failed to load driver data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleOnline = async (value: boolean) => {
    try {
      // If going online, check if driver is approved
      if (value && user?.driverDetails && !user.driverDetails.isApproved) {
        Alert.alert(
          "Account Not Approved",
          "Your driver account is still pending approval. We'll notify you once it's approved.",
          [{ text: "OK" }],
        )
        return
      }

      // If going online, check if all required documents are uploaded
      if (
        value &&
        user?.driverDetails &&
        (!user.driverDetails.documents?.license ||
          !user.driverDetails.documents?.insurance ||
          !user.driverDetails.documents?.registration)
      ) {
        Alert.alert(
          "Missing Documents",
          "Please complete your profile and upload all required documents before going online.",
          [{ text: "Cancel" }, { text: "Complete Profile", onPress: () => router.push("/(driver)/onboarding") }],
        )
        return
      }

      // Toggle driver status
      const success = await toggleDriverMode(value)

      if (success) {
        setIsOnline(value)

        if (value) {
          // Update location when going online
          const location = await getCurrentLocation()
          if (location) {
            setCurrentLocation(location)
            await updateDriverDetails({
              currentLocation: location.coordinates,
            })
          }

          // Simulate a pending ride after a delay
          setTimeout(() => {
            simulatePendingRide()
          }, 5000)
        } else {
          // Clear pending ride when going offline
          setPendingRide(null)
        }
      }
    } catch (err) {
      console.error("Error toggling driver mode:", err)
      Alert.alert("Error", "Failed to update your status. Please try again.")
    }
  }

  const simulatePendingRide = () => {
    // Only simulate if driver is online
    if (!isOnline) return

    // Create a mock ride request
    const mockRide = {
      id: "ride_" + Math.random().toString(36).substring(2, 10),
      rider: {
        name: "John Smith",
        rating: 4.8,
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      pickup: {
        address: "123 Main St, Johannesburg",
        coordinates: {
          latitude: currentLocation?.coordinates.latitude + 0.01,
          longitude: currentLocation?.coordinates.longitude + 0.01,
        },
      },
      destination: {
        address: "456 Market St, Johannesburg",
        coordinates: {
          latitude: currentLocation?.coordinates.latitude + 0.03,
          longitude: currentLocation?.coordinates.longitude + 0.03,
        },
      },
      estimatedFare: Math.floor(Math.random() * 100) + 50, // Random fare between 50-150
      estimatedDistance: Math.floor(Math.random() * 10) + 2, // Random distance between 2-12 km
      estimatedDuration: Math.floor(Math.random() * 20) + 10, // Random duration between 10-30 min
      expiresIn: 15, // Seconds to accept the ride
    }

    setPendingRide(mockRide)
  }

  const handleAcceptRide = () => {
    if (!pendingRide) return

    // In a real app, you would call your API to accept the ride
    Alert.alert("Ride Accepted", "You have accepted the ride. Navigate to the pickup location.", [
      { text: "OK", onPress: () => router.push("/(driver)/active-ride") },
    ])
  }

  const handleDeclineRide = () => {
    setPendingRide(null)

    // In a real app, you would call your API to decline the ride
    // After a delay, simulate another ride request
    setTimeout(() => {
      simulatePendingRide()
    }, 10000)
  }

  const renderDriverStatus = () => (
    <View style={[styles.statusCard, { backgroundColor: colors.SURFACE }]}>
      <View style={styles.statusHeader}>
        <Text style={[styles.statusTitle, { color: colors.TEXT }]}>Driver Status</Text>
        <View style={styles.statusToggle}>
          <Text style={[styles.statusText, { color: isOnline ? colors.SUCCESS : colors.TEXT_SECONDARY }]}>
            {isOnline ? "Online" : "Offline"}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: colors.BORDER, true: colors.SUCCESS }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.earningsContainer}>
        <View style={styles.earningItem}>
          <Text style={[styles.earningValue, { color: colors.TEXT }]}>R{earnings.today.toFixed(2)}</Text>
          <Text style={[styles.earningLabel, { color: colors.TEXT_SECONDARY }]}>Today</Text>
        </View>

        <View style={styles.earningDivider} />

        <View style={styles.earningItem}>
          <Text style={[styles.earningValue, { color: colors.TEXT }]}>R{earnings.week.toFixed(2)}</Text>
          <Text style={[styles.earningLabel, { color: colors.TEXT_SECONDARY }]}>This Week</Text>
        </View>

        <View style={styles.earningDivider} />

        <View style={styles.earningItem}>
          <Text style={[styles.earningValue, { color: colors.TEXT }]}>R{earnings.total.toFixed(2)}</Text>
          <Text style={[styles.earningLabel, { color: colors.TEXT_SECONDARY }]}>Total</Text>
        </View>
      </View>
    </View>
  )

  const renderPendingRide = () => {
    if (!pendingRide) return null

    return (
      <View style={[styles.rideRequestCard, { backgroundColor: colors.SURFACE }]}>
        <View style={styles.rideRequestHeader}>
          <Text style={[styles.rideRequestTitle, { color: colors.TEXT }]}>New Ride Request</Text>
          <View style={styles.expiryContainer}>
            <Text style={[styles.expiryText, { color: colors.ERROR }]}>Expires in {pendingRide.expiresIn}s</Text>
          </View>
        </View>

        <View style={styles.riderInfo}>
          <Image source={{ uri: pendingRide.rider.avatar }} style={styles.riderAvatar} />
          <View style={styles.riderDetails}>
            <Text style={[styles.riderName, { color: colors.TEXT }]}>{pendingRide.rider.name}</Text>
            <View style={styles.ratingContainer}>
              <Image source={require("../../../assets/icons/star.png")} style={styles.starIcon} />
              <Text style={[styles.ratingText, { color: colors.TEXT }]}>{pendingRide.rider.rating}</Text>
            </View>
          </View>
        </View>

        <View style={styles.rideDetails}>
          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <View style={styles.dotContainer}>
                <View style={[styles.dot, styles.pickupDot]} />
                <View style={styles.dotLine} />
              </View>
              <Text style={[styles.locationText, { color: colors.TEXT }]} numberOfLines={1}>
                {pendingRide.pickup.address}
              </Text>
            </View>

            <View style={styles.locationRow}>
              <View style={styles.dotContainer}>
                <View style={[styles.dot, styles.destinationDot]} />
              </View>
              <Text style={[styles.locationText, { color: colors.TEXT }]} numberOfLines={1}>
                {pendingRide.destination.address}
              </Text>
            </View>
          </View>

          <View style={styles.rideInfoContainer}>
            <View style={styles.rideInfoItem}>
              <Text style={[styles.rideInfoValue, { color: colors.TEXT }]}>R{pendingRide.estimatedFare}</Text>
              <Text style={[styles.rideInfoLabel, { color: colors.TEXT_SECONDARY }]}>Fare</Text>
            </View>

            <View style={styles.rideInfoDivider} />

            <View style={styles.rideInfoItem}>
              <Text style={[styles.rideInfoValue, { color: colors.TEXT }]}>{pendingRide.estimatedDistance} km</Text>
              <Text style={[styles.rideInfoLabel, { color: colors.TEXT_SECONDARY }]}>Distance</Text>
            </View>

            <View style={styles.rideInfoDivider} />

            <View style={styles.rideInfoItem}>
              <Text style={[styles.rideInfoValue, { color: colors.TEXT }]}>{pendingRide.estimatedDuration} min</Text>
              <Text style={[styles.rideInfoLabel, { color: colors.TEXT_SECONDARY }]}>Duration</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <CustomButton
            title="Decline"
            onPress={handleDeclineRide}
            style={[styles.declineButton, { backgroundColor: colors.BORDER }]}
            textStyle={{ color: colors.TEXT }}
            primary={false}
          />
          <CustomButton title="Accept" onPress={handleAcceptRide} style={styles.acceptButton} />
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
        />
      </View>

      <View style={styles.overlay}>
        <View style={[styles.header, { backgroundColor: isOnline ? colors.SUCCESS : colors.BORDER }]}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "Driver"}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/(driver)/(tabs)/profile")}>
            <Image
              source={user?.avatar ? { uri: user.avatar } : require("../../../assets/icons/person.png")}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {error && <ErrorAlert message={error} onRetry={loadInitialData} onDismiss={() => setError(null)} />}

          {renderDriverStatus()}

          {isOnline && !pendingRide && (
            <View style={[styles.waitingCard, { backgroundColor: colors.SURFACE }]}>
              <Image
                source={require("../../../assets/icons/search.png")}
                style={[styles.waitingIcon, { tintColor: colors.PRIMARY }]}
              />
              <Text style={[styles.waitingText, { color: colors.TEXT }]}>Waiting for ride requests...</Text>
            </View>
          )}

          {pendingRide && renderPendingRide()}
        </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-start",
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  earningsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  earningItem: {
    flex: 1,
    alignItems: "center",
  },
  earningValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  earningLabel: {
    fontSize: 12,
  },
  earningDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  waitingCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  waitingIcon: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  rideRequestCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rideRequestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rideRequestTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  expiryContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expiryText: {
    fontSize: 12,
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
  rideDetails: {
    marginBottom: 16,
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
  rideInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 12,
  },
  rideInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  rideInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  rideInfoLabel: {
    fontSize: 12,
  },
  rideInfoDivider: {
    width: 1,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  declineButton: {
    flex: 1,
    marginRight: 8,
  },
  acceptButton: {
    flex: 1,
    marginLeft: 8,
  },
})

export default DriverHomeScreen

