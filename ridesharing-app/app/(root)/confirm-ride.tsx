"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Alert } from "react-native"
import { useRouter } from "expo-router"
import RideLayout from "../../components/RideLayout"
import Map from "../../components/Map"
import CustomButton from "../../components/CustomButton"
import Payment from "../../components/Payment"
import useStore from "../../store"
import { calculateRoute } from "../../lib/map"
import { formatCurrency } from "../../lib/utils"

const ConfirmRideScreen = () => {
  const router = useRouter()
  const { selectedPickup, selectedDestination, createRide } = useStore()

  const [isLoading, setIsLoading] = useState(false)
  const [routeInfo, setRouteInfo] = useState<{
    distance: number
    duration: number
    price: number
    polyline: Array<{ latitude: number; longitude: number }>
  } | null>(null)

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card1")

  const paymentMethods = [
    {
      id: "card1",
      type: "card",
      name: "Visa",
      details: "•••• 4242",
      icon: require("../../assets/icons/dollar.png"),
    },
    {
      id: "paypal1",
      type: "paypal",
      name: "PayPal",
      details: "user@example.com",
      icon: require("../../assets/icons/dollar.png"),
    },
    {
      id: "cash",
      type: "cash",
      name: "Cash",
      details: "Pay with cash",
      icon: require("../../assets/icons/dollar.png"),
    },
  ]

  useEffect(() => {
    const calculateRouteInfo = async () => {
      if (selectedPickup && selectedDestination) {
        const route = await calculateRoute(selectedPickup.coordinates, selectedDestination.coordinates)

        // Calculate price
        const basePrice = 5
        const pricePerKm = 1.5
        const pricePerMinute = 0.2

        const distancePrice = route.distance * pricePerKm
        const timePrice = route.duration * pricePerMinute
        const totalPrice = basePrice + distancePrice + timePrice

        setRouteInfo({
          distance: route.distance,
          duration: route.duration,
          price: totalPrice,
          polyline: route.polyline,
        })
      }
    }

    calculateRouteInfo()
  }, [selectedPickup, selectedDestination])

  const handleConfirmRide = async () => {
    if (!routeInfo || !selectedPickup || !selectedDestination) return

    setIsLoading(true)

    try {
      const ride = await createRide({
        pickup: selectedPickup,
        destination: selectedDestination,
        price: routeInfo.price,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
      })

      if (ride) {
        Alert.alert("Ride Confirmed", "Your ride has been confirmed. The driver is on the way.", [
          {
            text: "OK",
            onPress: () => router.replace("/(root)/(tabs)/home"),
          },
        ])
      }
    } catch (error) {
      Alert.alert("Error", "Failed to confirm ride. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const mapComponent = (
    <Map
      showUserLocation={true}
      initialRegion={
        selectedPickup
          ? {
              latitude: selectedPickup.coordinates.latitude,
              longitude: selectedPickup.coordinates.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
          : undefined
      }
      markers={[
        ...(selectedPickup
          ? [
              {
                id: "pickup",
                coordinate: selectedPickup.coordinates,
                title: "Pickup",
                description: selectedPickup.address,
              },
            ]
          : []),
        ...(selectedDestination
          ? [
              {
                id: "destination",
                coordinate: selectedDestination.coordinates,
                title: "Destination",
                description: selectedDestination.address,
              },
            ]
          : []),
      ]}
      polyline={routeInfo?.polyline}
    />
  )

  const bottomComponent = (
    <CustomButton title="Confirm & Pay" onPress={handleConfirmRide} loading={isLoading} disabled={isLoading} />
  )

  return (
    <RideLayout title="Confirm Ride" showMap={true} mapComponent={mapComponent} bottomComponent={bottomComponent}>
      {routeInfo && (
        <>
          <View style={styles.rideDetailsCard}>
            <Text style={styles.sectionTitle}>Ride Details</Text>

            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <View style={styles.dotContainer}>
                  <View style={[styles.dot, styles.pickupDot]} />
                  <View style={styles.dotLine} />
                </View>
                <Text style={styles.locationText} numberOfLines={1}>
                  {selectedPickup?.address}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <View style={styles.dotContainer}>
                  <View style={[styles.dot, styles.destinationDot]} />
                </View>
                <Text style={styles.locationText} numberOfLines={1}>
                  {selectedDestination?.address}
                </Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>{routeInfo.distance.toFixed(1)} km</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{Math.round(routeInfo.duration)} min</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Price</Text>
                <Text style={styles.infoValue}>{formatCurrency(routeInfo.price)}</Text>
              </View>
            </View>
          </View>

          <Payment
            selectedMethod={selectedPaymentMethod}
            onSelectMethod={setSelectedPaymentMethod}
            onAddPaymentMethod={() => {
              // Handle adding payment method
              console.log("Add payment method")
            }}
            paymentMethods={paymentMethods}
          />
        </>
      )}
    </RideLayout>
  )
}

const styles = StyleSheet.create({
  rideDetailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
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
    color: "#1E293B",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 12,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
})

export default ConfirmRideScreen

