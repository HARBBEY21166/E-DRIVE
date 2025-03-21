"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native"
import { useRouter } from "expo-router"
import LocationSearchInput from "../../components/LocationSearchInput"
import CustomButton from "../../components/CustomButton"
import RideLayout from "../../components/RideLayout"
import Map from "../../components/Map"
import useStore from "../../store"
import { getCurrentLocation } from "../../lib/map"
import type { LocationDetails } from "../../types/type"

const BookRideScreen = () => {
  const router = useRouter()
  const { currentLocation, setSelectedPickup, setSelectedDestination } = useStore()

  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [pickupLocation, setPickupLocation] = useState<LocationDetails | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<LocationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapRegion, setMapRegion] = useState(null)

  useEffect(() => {
    if (currentLocation) {
      setPickupLocation(currentLocation)
      setPickup(currentLocation.address)
    }
  }, [currentLocation])

  const handlePickupSelect = (place: {
    id: string
    name: string
    address: string
    coordinates: { latitude: number; longitude: number }
  }) => {
    if (!place.coordinates) {
      console.error("No coordinates available for selected place")
      return
    }

    const location: LocationDetails = {
      coordinates: place.coordinates,
      address: place.address,
      name: place.name,
    }
    setPickupLocation(location)
    setPickup(place.name)
  }

  const handleDestinationSelect = (place: {
    id: string
    name: string
    address: string
    coordinates: { latitude: number; longitude: number }
  }) => {
    if (!place.coordinates) {
      console.error("No coordinates available for selected place")
      return
    }

    const location: LocationDetails = {
      coordinates: place.coordinates,
      address: place.address,
      name: place.name,
    }
    setDestinationLocation(location)
    setDestination(place.name)
  }

  const handleFindRide = () => {
    if (pickupLocation && destinationLocation) {
      setSelectedPickup(pickupLocation)
      setSelectedDestination(destinationLocation)
      router.push("/(root)/find-ride")
    }
  }

  const handleMapRegionChange = (data) => {
    setMapRegion(data)

    // Handle map click to set location
    if (data.action === "click") {
      // If no pickup is set, set it as pickup
      if (!pickupLocation) {
        handleAutoDetectLocation(data.coordinate, "pickup")
      }
      // If pickup is set but no destination, set it as destination
      else if (!destinationLocation) {
        handleAutoDetectLocation(data.coordinate, "destination")
      }
    }
  }

  const handleAutoDetectLocation = async (coordinates = null, locationType = "pickup") => {
    setIsLoading(true)
    try {
      let location
      if (coordinates) {
        // Use provided coordinates
        const { latitude, longitude } = coordinates
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "RidesharingApp/1.0",
            },
          },
        )
        const data = await response.json()
        const address = data.display_name || "Selected Location"

        location = {
          coordinates: { latitude, longitude },
          address,
          name: address.split(",")[0],
        }
      } else {
        // Use device location
        location = await getCurrentLocation()
      }

      if (location) {
        if (locationType === "pickup") {
          setPickupLocation(location)
          setPickup(location.name || location.address.split(",")[0])
        } else {
          setDestinationLocation(location)
          setDestination(location.name || location.address.split(",")[0])
        }
      }
    } catch (error) {
      console.error("Error detecting location:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isButtonDisabled = !pickup || !destination || isLoading

  const mapComponent = (
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
        ...(pickupLocation
          ? [
              {
                id: "pickup",
                coordinate: pickupLocation.coordinates,
                title: "Pickup",
                description: pickupLocation.address,
              },
            ]
          : []),
        ...(destinationLocation
          ? [
              {
                id: "destination",
                coordinate: destinationLocation.coordinates,
                title: "Destination",
                description: destinationLocation.address,
              },
            ]
          : []),
      ]}
      onRegionChange={handleMapRegionChange}
    />
  )

  const bottomComponent = (
    <CustomButton title="Find a Ride" onPress={handleFindRide} disabled={isButtonDisabled} loading={isLoading} />
  )

  return (
    <RideLayout title="Book a Ride" showMap={true} mapComponent={mapComponent} bottomComponent={bottomComponent}>
      <View style={styles.inputsContainer}>
        <View style={styles.inputWithButton}>
          <LocationSearchInput
            label="Pickup Location"
            placeholder="Enter pickup location"
            value={pickup}
            onChangeText={setPickup}
            onPlaceSelect={handlePickupSelect}
          />
          <TouchableOpacity
            style={styles.detectButton}
            onPress={() => handleAutoDetectLocation(null, "pickup")}
            disabled={isLoading}
          >
            <Image source={require("../../assets/icons/location.svg")} style={styles.detectIcon} />
          </TouchableOpacity>
        </View>

        <LocationSearchInput
          label="Destination"
          placeholder="Enter destination"
          value={destination}
          onChangeText={setDestination}
          onPlaceSelect={handleDestinationSelect}
        />

        <Text style={styles.helpText}>You can also tap on the map to set locations</Text>
      </View>
    </RideLayout>
  )
}

const styles = StyleSheet.create({
  inputsContainer: {
    marginBottom: 16,
  },
  inputWithButton: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  detectButton: {
    backgroundColor: "#4CAF50",
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginBottom: 16,
  },
  detectIcon: {
    width: 20,
    height: 20,
    tintColor: "#FFFFFF",
  },
  helpText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
})

export default BookRideScreen

