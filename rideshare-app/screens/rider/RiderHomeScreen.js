"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MapPin, Navigation } from "lucide-react-native"
import Map from "../../components/common/Map"

const RiderHomeScreen = ({ navigation }) => {
  const [pickupLocation, setPickupLocation] = useState("")
  const [dropoffLocation, setDropoffLocation] = useState("")

  const handleBookRide = () => {
    if (pickupLocation && dropoffLocation) {
      navigation.navigate("BookRide", {
        pickup: pickupLocation,
        dropoff: dropoffLocation,
      })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <Map />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchHeader}>
          <Text style={styles.searchTitle}>Where to?</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <MapPin color="#4a80f5" size={20} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Pickup location"
            value={pickupLocation}
            onChangeText={setPickupLocation}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Navigation color="#f54a80" size={20} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Where to?"
            value={dropoffLocation}
            onChangeText={setDropoffLocation}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (!pickupLocation || !dropoffLocation) && styles.buttonDisabled]}
          onPress={handleBookRide}
          disabled={!pickupLocation || !dropoffLocation}
        >
          <Text style={styles.buttonText}>Book Ride</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchHeader: {
    marginBottom: 15,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    height: 50,
  },
  iconContainer: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4a80f5",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#b3c6f5",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default RiderHomeScreen

