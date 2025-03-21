"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import Map from "../../../components/Map"
import CustomButton from "../../../components/CustomButton"
import useStore from "../../../store"
import { getCurrentLocation } from "../../../lib/map"

const HomeScreen = () => {
  const router = useRouter()
  const { user, setCurrentLocation, currentLocation } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoading(true)
      const location = await getCurrentLocation()
      if (location) {
        setCurrentLocation(location)
      }
      setIsLoading(false)
    }

    fetchLocation()
  }, [])

  const handleBookRide = () => {
    router.push("/(root)/book-ride")
  }

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={user?.avatar ? { uri: user.avatar } : require("../../../assets/icons/person.png")}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Where are you going?</Text>
            <TouchableOpacity style={styles.destinationButton} onPress={handleBookRide}>
              <Image source={require("../../../assets/icons/search.png")} style={styles.searchIcon} />
              <Text style={styles.destinationButtonText}>Enter destination</Text>
            </TouchableOpacity>

            <View style={styles.recentLocationsContainer}>
              <Text style={styles.recentLocationsTitle}>Recent Locations</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentLocationsScroll}>
                <TouchableOpacity style={styles.recentLocationItem} onPress={handleBookRide}>
                  <View style={styles.recentLocationIcon}>
                    <Image source={require("../../../assets/icons/point.png")} style={styles.locationIcon} />
                  </View>
                  <View style={styles.recentLocationInfo}>
                    <Text style={styles.recentLocationName}>Work</Text>
                    <Text style={styles.recentLocationAddress} numberOfLines={1}>
                      123 Market St, San Francisco
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.recentLocationItem} onPress={handleBookRide}>
                  <View style={styles.recentLocationIcon}>
                    <Image source={require("../../../assets/icons/point.png")} style={styles.locationIcon} />
                  </View>
                  <View style={styles.recentLocationInfo}>
                    <Text style={styles.recentLocationName}>Home</Text>
                    <Text style={styles.recentLocationAddress} numberOfLines={1}>
                      456 Pine St, San Francisco
                    </Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <CustomButton title="Book a Ride" onPress={handleBookRide} style={styles.bookButton} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: "#64748B",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
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
    justifyContent: "flex-end",
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  destinationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: "#64748B",
  },
  destinationButtonText: {
    fontSize: 16,
    color: "#64748B",
  },
  recentLocationsContainer: {
    marginBottom: 24,
  },
  recentLocationsTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    marginBottom: 12,
  },
  recentLocationsScroll: {
    flexDirection: "row",
  },
  recentLocationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 200,
  },
  recentLocationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationIcon: {
    width: 20,
    height: 20,
    tintColor: "#64748B",
  },
  recentLocationInfo: {
    flex: 1,
  },
  recentLocationName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  recentLocationAddress: {
    fontSize: 12,
    color: "#64748B",
  },
  bookButton: {
    height: 56,
  },
})

export default HomeScreen

