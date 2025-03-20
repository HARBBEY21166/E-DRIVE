"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import LocationSearchInput from "../../components/LocationSearchInput"
import CustomButton from "../../components/CustomButton"
import RideLayout from "../../components/RideLayout"
import Map from "../../components/Map"
import useStore from "../../store"
import type { LocationDetails } from "../../types/type"

const BookRideScreen = () => {
  const router = useRouter()
  const { currentLocation, setSelectedPickup, setSelectedDestination } = useStore()

  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [pickupLocation, setPickupLocation] = useState<LocationDetails | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<LocationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    coordinates?: { latitude: number; longitude: number }
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
    coordinates?: { latitude: number; longitude: number }
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

  const isButtonDisabled = !pickup || !destination

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
                id: 'pickup',
                coordinate: pickupLocation.coordinates,
                title: 'Pickup',
                description: pickupLocation.address,
              },
            ]
          : []),
        ...(destinationLocation
          ? [
              {
                id: 'destination',
                coordinate: destinationLocation.coordinates,
                title: 'Destination',
                description: destinationLocation.address,
              },
            ]
          : []),
      ]}
    />
  );

  const bottomComponent = <CustomButton title="Find a Ride" onPress={handleFindRide} disabled={isButtonDisabled} />

  return (
    <RideLayout title="Book a Ride" showMap={true} mapComponent={mapComponent} bottomComponent={bottomComponent}>
      <View style={styles.inputsContainer}>
        <LocationSearchInput
          label="Pickup Location"
          placeholder="Enter pickup location"
          value={pickup}
          onChangeText={setPickup}
          onPlaceSelect={handlePickupSelect}
        />
        <LocationSearchInput
          label="Destination"
          placeholder="Enter destination"
          value={destination}
          onChangeText={setDestination}
          onPlaceSelect={handleDestinationSelect}
        />
      </View>
    </RideLayout>
  )
}

const styles = StyleSheet.create({
  inputsContainer: {
    marginBottom: 16,
  },
})

export default BookRideScreen

