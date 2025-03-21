"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList } from "react-native"
import { useRouter } from "expo-router"
import RideLayout from "../../components/RideLayout"
import Map from "../../components/Map"
import DriverCard from "../../components/DriverCard"
import CustomButton from "../../components/CustomButton"
import useStore from "../../store"
import type { Driver } from "../../types/type"
import { calculateRoute } from "../../lib/map"

const FindRideScreen = () => {
  const router = useRouter()
  const { selectedPickup, selectedDestination } = useStore()

  const [isLoading, setIsLoading] = useState(true)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [routeInfo, setRouteInfo] = useState<{
    distance: number
    duration: number
    polyline: Array<{ latitude: number; longitude: number }>
  } | null>(null)

  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock drivers data
      const mockDrivers: Driver[] = [
        {
          id: "1",
          name: "John Smith",
          rating: 4.8,
          car: {
            model: "Toyota Camry",
            color: "Black",
            licensePlate: "ABC123",
          },
          location: {
            coordinates: {
              latitude: selectedPickup?.coordinates.latitude! + 0.01,
              longitude: selectedPickup?.coordinates.longitude! + 0.01,
            },
            address: "Nearby Street",
          },
          isAvailable: true,
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        {
          id: "2",
          name: "Sarah Johnson",
          rating: 4.9,
          car: {
            model: "Honda Accord",
            color: "Silver",
            licensePlate: "XYZ789",
          },
          location: {
            coordinates: {
              latitude: selectedPickup?.coordinates.latitude! - 0.01,
              longitude: selectedPickup?.coordinates.longitude! - 0.01,
            },
            address: "Another Street",
          },
          isAvailable: true,
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        },
        {
          id: "3",
          name: "Michael Brown",
          rating: 4.7,
          car: {
            model: "Tesla Model 3",
            color: "White",
            licensePlate: "EV1234",
          },
          location: {
            coordinates: {
              latitude: selectedPickup?.coordinates.latitude! + 0.02,
              longitude: selectedPickup?.coordinates.longitude! - 0.02,
            },
            address: "Tesla Street",
          },
          isAvailable: true,
          avatar: "https://randomuser.me/api/portraits/men/67.jpg",
        },
      ]

      setDrivers(mockDrivers)
      setIsLoading(false)
    }

    const calculateRouteInfo = async () => {
      if (selectedPickup && selectedDestination) {
        const route = await calculateRoute(selectedPickup.coordinates, selectedDestination.coordinates)

        setRouteInfo(route)
      }
    }

    fetchDrivers()
    calculateRouteInfo()
  }, [selectedPickup, selectedDestination])

  const handleSelectDriver = (driverId: string) => {
    setSelectedDriver(driverId)
  }

  const handleConfirmRide = () => {
    if (selectedDriver) {
      router.push("/(root)/confirm-ride")
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
        ...drivers.map((driver) => ({
          id: driver.id,
          coordinate: driver.location.coordinates,
          title: driver.name,
          description: driver.car.model,
          isSelected: driver.id === selectedDriver,
        })),
      ]}
      polyline={routeInfo?.polyline}
    />
  )

  const bottomComponent = (
    <View>
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <View style={styles.routeInfoItem}>
            <Text style={styles.routeInfoLabel}>Distance</Text>
            <Text style={styles.routeInfoValue}>{routeInfo.distance.toFixed(1)} km</Text>
          </View>
          <View style={styles.routeInfoDivider} />
          <View style={styles.routeInfoItem}>
            <Text style={styles.routeInfoLabel}>Duration</Text>
            <Text style={styles.routeInfoValue}>{Math.round(routeInfo.duration)} min</Text>
          </View>
        </View>
      )}
      <CustomButton title="Confirm Ride" onPress={handleConfirmRide} disabled={!selectedDriver} />
    </View>
  )

  const renderDriverItem = ({ item }: { item: Driver }) => {
    // Calculate estimated price based on distance
    const basePrice = 5
    const pricePerKm = 1.5
    const estimatedPrice = basePrice + (routeInfo?.distance || 0) * pricePerKm

    // Calculate ETA
    const speedKmPerMin = 0.5 // 30 km/h in km/min
    const distanceToPickup = 2 // Mock distance in km
    const etaMinutes = Math.round(distanceToPickup / speedKmPerMin)

    return (
      <DriverCard
        driver={{
          id: item.id,
          name: item.name,
          rating: item.rating,
          car: `${item.car.color} ${item.car.model}`,
          price: estimatedPrice,
          eta: `${etaMinutes} min away`,
          avatar: item.avatar,
        }}
        onSelect={handleSelectDriver}
        isSelected={selectedDriver === item.id}
      />
    )
  }

  return (
    <RideLayout title="Available Drivers" showMap={true} mapComponent={mapComponent} bottomComponent={bottomComponent}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding drivers near you...</Text>
        </View>
      ) : (
        <FlatList
          data={drivers}
          renderItem={renderDriverItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.driversList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </RideLayout>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  driversList: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  routeInfoContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  routeInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  routeInfoLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  routeInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  routeInfoDivider: {
    width: 1,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
})

export default FindRideScreen

